import React, { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import asteroidRoca from "../assets/img/roca.png";
import asteroidMetalico from "../assets/img/metalico.png";
import { simulateAsteroidImpact } from "../utils/Operaciones";
import PueblaMap from "../components/PueblaMap";

// Fix iconos Leaflet + mover controles de zoom a esquina inferior derecha
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// ── Rangos de densidad ────────────────────────────────────────────────────────
const DENSITY_RANGES = {
  Roca:     { min: 2500, max: 3200, initial: 2800 },
  Metálica: { min: 7000, max: 8000, initial: 7500 },
};

// ── Tipos de asteroide ────────────────────────────────────────────────────────
const ASTEROID_TYPES = [
  {
    id: "Roca",
    label: "Rocoso",
    sublabel: "Condrita / Silicato",
    description:
      "Son la mayoría (Tipos S y C); compuestos de silicatos o carbono; suelen fragmentarse en la atmósfera.",
    img: asteroidRoca,
  },
  {
    id: "Metálica",
    label: "Metálico",
    sublabel: "Hierro / Níquel",
    description:
      "Tipo M; compuestos de hierro y níquel; resisten mejor la entrada atmosférica, causando impactos terrestres devastadores.",
    img: asteroidMetalico,
  },
];

// ── Formateo diámetro ─────────────────────────────────────────────────────────
const formatDiameter = (m) => {
  if (m < 1000) return { value: String(m), unit: "m" };
  return { value: (m / 1000).toFixed(1), unit: "km" };
};

// ── Analogías de tamaño ───────────────────────────────────────────────────────
const getSizeAnalogy = (d) => {
  if (d <= 5)   return { icon: "🪑", label: "mesa de comedor grande" };
  if (d < 80)   return { icon: "⚽", label: "campo de fútbol" };
  if (d < 170)  return { icon: "⚽", label: "1.5 campos de fútbol — umbral de peligro" };
  if (d < 250)  return { icon: "🏢", label: "rascacielos de 50 pisos (promedio NEA)" };
  if (d < 600)  return { icon: "🏛️", label: "varias manzanas del Zócalo de Puebla" };
  if (d < 1500) return { icon: "🏛️", label: "10 veces el Zócalo de Puebla" };
  if (d < 3500) return { icon: "⚽", label: "30 campos de fútbol seguidos" };
  return               { icon: "🎡", label: "56 Estrellas de Puebla en línea recta" };
};

// ── Analogías de velocidad ────────────────────────────────────────────────────
const getSpeedAnalogy = (s) => {
  if (s <= 6)  return "De CDMX a Puebla en menos de 20 segundos";
  if (s <= 12) return "30 veces más rápida que el sonido en el aire";
  if (s <= 16) return "Cruzaría todo México en solo 3.5 minutos";
  return              "Cruzaría el diámetro de la Tierra en 10 minutos";
};

// ── Slider ────────────────────────────────────────────────────────────────────
const ImpactSlider = ({ label, displayValue, displayUnit, min, max, step, value, onChange, accent }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: "1.4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </span>
        <span style={{ fontSize: "1.35rem", fontWeight: 600, color: "#fff" }}>
          {displayValue}{" "}
          <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>{displayUnit}</span>
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%", height: "4px",
          appearance: "none", WebkitAppearance: "none",
          background: `linear-gradient(to right, ${accent} 0%, ${accent} ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`,
          borderRadius: "2px", outline: "none", cursor: "pointer",
        }}
      />
    </div>
  );
};

// ── MapWrapper: mueve zoom a esquina inferior derecha ─────────────────────────
// Se inyecta CSS globalmente una sola vez
let zoomCSSInjected = false;
const injectZoomCSS = () => {
  if (zoomCSSInjected) return;
  zoomCSSInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    .leaflet-control-zoom {
      position: absolute !important;
      bottom: 2.5rem !important;
      right: 0.75rem !important;
      top: auto !important;
      left: auto !important;
      margin: 0 !important;
      border: none !important;
      box-shadow: none !important;
    }
    .leaflet-top.leaflet-left { display: none !important; }
    .leaflet-bottom.leaflet-right .leaflet-control-zoom { display: flex; flex-direction: column; }
    .leaflet-control-zoom-in,
    .leaflet-control-zoom-out {
      background: rgba(0,0,0,0.75) !important;
      color: rgba(255,255,255,0.8) !important;
      border: 1px solid rgba(255,255,255,0.12) !important;
      width: 32px !important;
      height: 32px !important;
      line-height: 32px !important;
      font-size: 1.1rem !important;
      border-radius: 6px !important;
      margin-bottom: 4px !important;
    }
    .leaflet-control-zoom-in:hover,
    .leaflet-control-zoom-out:hover {
      background: rgba(124,58,237,0.6) !important;
      color: #fff !important;
    }
  `;
  document.head.appendChild(style);
};

// ── Componente principal ──────────────────────────────────────────────────────
const SkyfallX1 = () => {
  // Estado — idéntico al original
  const [diameter, setDiameter]       = useState(2500);
  const [speed, setSpeed]             = useState(10.0);
  const [angle, setAngle]             = useState(45);
  const [typeIndex, setTypeIndex]     = useState(0);
  const [density, setDensity]         = useState(DENSITY_RANGES.Roca.initial);
  const [position, setPosition]       = useState([19.0433, -98.2022]);
  const [isLaunched, setIsLaunched]   = useState(false);
  const [showMapHint, setShowMapHint] = useState(true);

  const navigate     = useNavigate();
  const composition  = ASTEROID_TYPES[typeIndex].id;
  const currentRange = DENSITY_RANGES[composition];
  const analogy      = getSizeAnalogy(diameter);
  const speedAnalogy = getSpeedAnalogy(speed);
  const diamFmt      = formatDiameter(diameter);

  useEffect(() => { injectZoomCSS(); }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowMapHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setDensity(DENSITY_RANGES[composition].initial);
  }, [composition]);

  const prevType = () => setTypeIndex((i) => (i - 1 + ASTEROID_TYPES.length) % ASTEROID_TYPES.length);
  const nextType = () => setTypeIndex((i) => (i + 1) % ASTEROID_TYPES.length);

  // handleLaunch — idéntico al original
  const handleLaunch = () => {
    const simParams = {
      diameter_km:             diameter / 1000,
      density_kgm3:            density,
      velocity_kms:            speed,
      angle_deg:               angle,
      distance_from_impact_km: 10,
      targetType:              "land",
      lat:                     position[0],
      lng:                     position[1],
      radius:                  (diameter / speed) * 100,
    };
    const results = simulateAsteroidImpact(simParams);
    navigate("/video1", {
      state: {
        simulationResults: results,
        inputParameters: {
          ...simParams,
          composition,
          targetLocation: `Puebla (${position[0].toFixed(4)}, ${position[1].toFixed(4)})`,
        },
      },
    });
  };

  const asteroidImgSize = Math.max(110, Math.min(180, diameter / 20));

  return (
    <div style={{
      background: "#000000",
      height: "100vh",
      color: "#fff",
      fontFamily: "'Space Grotesk', sans-serif",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header style={{
        padding: "3.5rem 2rem 1rem",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
        textAlign: "center",
      }}>
        <h1 style={{
          margin: 0,
          fontSize: "clamp(1.8rem, 3.2vw, 2.8rem)",
          fontWeight: 800,
          color: "#ffffff",
          textShadow: "0 0 20px rgba(255,255,255,0.2), 0 0 40px rgba(255,255,255,0.08)",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}>
          Simulador de Impacto de Asteroides
        </h1>
      </header>

      {/* ══ LAYOUT PRINCIPAL ════════════════════════════════════════════════ */}
      <div style={{
        display: "flex",
        flex: 1,
        overflow: "hidden",
        minHeight: 0,
        padding: "1.2rem",       // padding exterior alrededor de mapa + sidebar
        gap: "1.2rem",
      }}>

        {/* ── MAPA — llena su espacio, sin línea divisoria ─────────────────── */}
        <div style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          minWidth: 0,
          borderRadius: "14px",
          // Sin borde — el mapa ocupa limpiamente todo el área
        }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "14px", overflow: "hidden" }}>
            <PueblaMap position={position} setPosition={setPosition} />
          </div>

          {/* Tooltip auto-hide */}
          <div style={{
            position: "absolute",
            top: "42%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.65)",
            color: "#fff",
            borderRadius: "12px",
            padding: "0.7rem 1.4rem",
            fontSize: "0.9rem",
            fontWeight: 600,
            textAlign: "center",
            pointerEvents: "none",
            zIndex: 500,
            whiteSpace: "nowrap",
            border: "1px solid rgba(255,255,255,0.08)",
            opacity: showMapHint ? 1 : 0,
            transition: "opacity 1s ease",
          }}>
            Selecciona el lugar del impacto
          </div>

          {/* Badge coordenadas — esquina superior izquierda */}
          <div style={{
            position: "absolute",
            top: "0.8rem", left: "0.8rem",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            padding: "0.3rem 0.75rem",
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.45)",
            zIndex: 500,
            pointerEvents: "none",
          }}>
            {position[0].toFixed(4)}°N · {Math.abs(position[1]).toFixed(4)}°O
          </div>

          {/* Badge inferior */}
          <div style={{
            position: "absolute",
            bottom: "1rem", left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.68)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "0.35rem 1.1rem",
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.04em",
            pointerEvents: "none",
            zIndex: 500,
          }}>
            Haz clic en el mapa · Solo Puebla
          </div>
        </div>

        {/* ══ SIDEBAR — más ancho, estilo card como /explora ══════════════ */}
        <div style={{
          width: "360px",              // más ancho que antes (300 → 360)
          flexShrink: 0,
          height: "100%",
          boxSizing: "border-box",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "14px",        // recuadro card, sin línea izquierda
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}>

          {/* Contenido scrolleable */}
          <div style={{ padding: "1.4rem 1.5rem 0", flex: 1 }}>

            <p style={{
              margin: "0 0 1.1rem",
              fontSize: "0.82rem",
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.13em",
            }}>
              Prepara tu asteroide
            </p>

            {/* ── SELECTOR DE TIPO ─────────────────────────────────────── */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "12px",
              padding: "1rem 0.9rem 0.9rem",
              marginBottom: "1.4rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.6rem" }}>
                <button
                  onClick={prevType}
                  style={{
                    background: "none", border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.45)", borderRadius: "6px",
                    width: "32px", height: "32px", cursor: "pointer", fontSize: "1.1rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "color 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color="#fff"; e.currentTarget.style.borderColor="rgba(255,255,255,0.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,0.45)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"; }}
                >‹</button>

                <div style={{ textAlign: "center", flex: 1 }}>
                  <img
                    src={ASTEROID_TYPES[typeIndex].img}
                    alt={ASTEROID_TYPES[typeIndex].label}
                    style={{
                      width: `${asteroidImgSize}px`,
                      height: `${asteroidImgSize * 0.62}px`,
                      objectFit: "contain",
                      display: "block",
                      margin: "0 auto 0.55rem",
                      transition: "width 0.2s ease, height 0.2s ease",
                    }}
                  />
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>
                    {ASTEROID_TYPES[typeIndex].label}
                  </div>
                  <div style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.35)", marginTop: "0.15rem" }}>
                    {ASTEROID_TYPES[typeIndex].sublabel}
                  </div>
                </div>

                <button
                  onClick={nextType}
                  style={{
                    background: "none", border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.45)", borderRadius: "6px",
                    width: "32px", height: "32px", cursor: "pointer", fontSize: "1.1rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "color 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color="#fff"; e.currentTarget.style.borderColor="rgba(255,255,255,0.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,0.45)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"; }}
                >›</button>
              </div>

              {/* Descripción */}
              <div style={{
                marginTop: "0.85rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                fontSize: "0.95rem",
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.6,
              }}>
                {ASTEROID_TYPES[typeIndex].description}
              </div>
            </div>

            {/* ── DENSIDAD ─────────────────────────────────────────────── */}
            <div style={{ marginBottom: "1.4rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Densidad
                </span>
                <span style={{ fontSize: "1.35rem", fontWeight: 600, color: "#fff" }}>
                  {density.toLocaleString()}{" "}
                  <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>kg/m³</span>
                </span>
              </div>
              <input
                type="range"
                min={currentRange.min} max={currentRange.max} step={100} value={density}
                onChange={(e) => setDensity(Number(e.target.value))}
                style={{
                  width: "100%", height: "4px",
                  appearance: "none", WebkitAppearance: "none",
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((density - currentRange.min) / (currentRange.max - currentRange.min)) * 100}%, rgba(255,255,255,0.1) ${((density - currentRange.min) / (currentRange.max - currentRange.min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
                  borderRadius: "2px", outline: "none", cursor: "pointer",
                }}
              />
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.2)", margin: "0.35rem 0 0" }}>
                Rango: {currentRange.min.toLocaleString()}–{currentRange.max.toLocaleString()} kg/m³
              </p>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: "1.4rem" }} />

            {/* ── TAMAÑO ───────────────────────────────────────────────── */}
            <ImpactSlider
              label="Tamaño (Diámetro)"
              displayValue={diamFmt.value} displayUnit={diamFmt.unit}
              min={1} max={5000} step={1} value={diameter}
              onChange={setDiameter} accent="#a855f7"
            />
            <div style={{
              display: "flex", alignItems: "flex-start", gap: "0.5rem",
              background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.18)",
              borderRadius: "9px", padding: "0.5rem 0.85rem", marginBottom: "1.4rem",
              fontSize: "0.95rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5,
            }}>
              <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: "0.05rem" }}>{analogy.icon}</span>
              <span>
                Equivale a{" "}
                <strong style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                  {analogy.label}
                </strong>
              </span>
            </div>

            {/* ── VELOCIDAD ────────────────────────────────────────────── */}
            <ImpactSlider
              label="Velocidad de impacto"
              displayValue={speed % 1 === 0 ? speed : speed.toFixed(1)} displayUnit="km/s"
              min={5} max={20} step={0.5} value={speed}
              onChange={setSpeed} accent="#06b6d4"
            />
            <div style={{
              display: "flex", alignItems: "flex-start", gap: "0.5rem",
              background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.16)",
              borderRadius: "9px", padding: "0.5rem 0.85rem", marginBottom: "1.4rem",
              fontSize: "0.95rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5,
            }}>
              <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: "0.05rem" }}>⚡</span>
              <span>{speedAnalogy}</span>
            </div>

            {/* ── ÁNGULO ───────────────────────────────────────────────── */}
            <ImpactSlider
              label="Ángulo de impacto"
              displayValue={angle} displayUnit="°"
              min={1} max={90} step={1} value={angle}
              onChange={setAngle} accent="#10b981"
            />
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.25)", margin: "-0.7rem 0 1.6rem" }}>
              90° = impacto vertical directo
            </p>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: "1.2rem" }} />
          </div>

          {/* ── BOTÓN LANZAR ─────────────────────────────────────────────── */}
          <div style={{ padding: "0 1.5rem 1.5rem", flexShrink: 0 }}>
            <button
              onClick={() => setIsLaunched(true)}
              style={{
                width: "100%", padding: "1rem",
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                border: "none", borderRadius: "10px", color: "#fff",
                fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", cursor: "pointer",
                transition: "opacity 0.15s, transform 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity="0.88"; e.currentTarget.style.transform="translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="translateY(0)"; }}
            >
              Lanzar ›
            </button>
          </div>
        </div>
      </div>

      {/* ══ MODAL ═══════════════════════════════════════════════════════════ */}
      {isLaunched && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)",
            zIndex: 9999, display: "flex", alignItems: "center",
            justifyContent: "center", padding: "1.5rem",
          }}
          onClick={() => setIsLaunched(false)}
        >
          <div
            style={{
              background: "#090910",
              border: "1px solid rgba(124,58,237,0.3)",
              borderRadius: "16px", padding: "2rem",
              width: "100%", maxWidth: "420px",
              maxHeight: "90vh", overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "1.1rem" }}>
              <img
                src={ASTEROID_TYPES[typeIndex].img}
                alt={ASTEROID_TYPES[typeIndex].label}
                style={{ width: "110px", height: "70px", objectFit: "contain",
                  filter: "drop-shadow(0 0 18px rgba(124,58,237,0.45))" }}
              />
            </div>

            <p style={{
              textAlign: "center", fontSize: "0.65rem", letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.3)", textTransform: "uppercase", margin: "0 0 0.3rem",
            }}>
              Confirmar lanzamiento
            </p>
            <h2 style={{ textAlign: "center", fontSize: "1.3rem", fontWeight: 700, color: "#a78bfa", margin: "0 0 1.5rem" }}>
              {ASTEROID_TYPES[typeIndex].label} · {diamFmt.value} {diamFmt.unit}
            </h2>

            {/* Tabla */}
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px", overflow: "hidden", marginBottom: "1rem",
            }}>
              {[
                ["Diámetro",    `${diamFmt.value} ${diamFmt.unit}`,                                  "#a855f7"],
                ["Velocidad",   `${speed % 1 === 0 ? speed : speed.toFixed(1)} km/s`,               "#06b6d4"],
                ["Ángulo",      `${angle}°`,                                                          "#10b981"],
                ["Composición", composition,                                                           "#f59e0b"],
                ["Densidad",    `${density.toLocaleString()} kg/m³`,                                 "#6366f1"],
                ["Ubicación",   `${position[0].toFixed(3)}°N, ${Math.abs(position[1]).toFixed(3)}°O`, "rgba(255,255,255,0.35)"],
              ].map(([lbl, val, color], i, arr) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "0.6rem 1rem",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>{lbl}</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Analogía tamaño */}
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.15)",
              borderRadius: "8px", padding: "0.5rem 0.9rem", marginBottom: "0.6rem",
              fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.4,
            }}>
              <span style={{ fontSize: "1rem" }}>{analogy.icon}</span>
              Tamaño de{" "}
              <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600, marginLeft: "0.2rem" }}>
                {analogy.label}
              </strong>
            </div>

            {/* Analogía velocidad */}
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.13)",
              borderRadius: "8px", padding: "0.5rem 0.9rem", marginBottom: "1.5rem",
              fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.4,
            }}>
              <span style={{ fontSize: "1rem" }}>⚡</span>
              {speedAnalogy}
            </div>

            <button
              onClick={handleLaunch}
              style={{
                width: "100%", padding: "0.95rem",
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                border: "none", borderRadius: "10px", color: "#fff",
                fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", cursor: "pointer",
                marginBottom: "0.5rem", transition: "opacity 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity="1"}
            >
              Confirmar y simular ›
            </button>

            <button
              onClick={() => setIsLaunched(false)}
              style={{
                width: "100%", padding: "0.55rem", background: "none", border: "none",
                color: "rgba(255,255,255,0.25)", fontSize: "0.75rem", cursor: "pointer",
                letterSpacing: "0.08em", textTransform: "uppercase", transition: "color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.color="rgba(255,255,255,0.6)"}
              onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.25)"}
            >
              Regresar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkyfallX1;