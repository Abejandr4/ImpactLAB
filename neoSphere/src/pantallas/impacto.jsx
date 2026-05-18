// src/pantallas/Impacto.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Circle, Marker, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import CategoriaCrater from "../components/Impacto/CategoriaCrater";
import CategoriaTermica from "../components/Impacto/CategoriaTermica";
import CategoriaOnda from "../components/Impacto/CategoriaOnda";
import CategoriaSismo from "../components/Impacto/CategoriaSismo";
import CategoriaEyecta from "../components/Impacto/CategoriaEyecta";

// --- CONFIGURACIÓN DE ICONOS DE LEAFLET ---
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import { simulateAsteroidImpact } from "../utils/Operaciones";
import { PALETTE, CATEGORIES } from "../utils/categorias";

// --- CONSTANTES GLOBALES ---
const MAP_ZOOM = 9;
const MAX_DISTANCE_KM = 500;

const Impacto = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- GeoJSON ---
  const [geoJsonData, setGeoJsonData] = useState(null);

  const { simulationResults: initialResults, inputParameters: inputs } =
    location.state || {};

  const impactPos = useMemo(() => {
    return inputs ? [inputs.lat, inputs.lng] : [19.0433, -98.2022];
  }, [inputs]);

  useEffect(() => {
    let isMounted = true;

    fetch(`${import.meta.env.BASE_URL}data.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted) setGeoJsonData(data);
      })
      .catch((err) => console.error("Error loading data:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // --- ESTADO ---
  const [distanceSliderValue, setDistanceSliderValue] = useState(20);
  const [tooltipAbierto, setTooltipAbierto] = useState(null);
  // Categoría abierta en el acordeón (solo una a la vez). Por defecto la primera.
  const [openCategory, setOpenCategory] = useState("crater");

  // --- CALLBACKS ---
  const handleToggleTooltip = useCallback((id) => {
    setTooltipAbierto((prev) => (prev === id ? null : id));
  }, []);

  // --- LISTENER GLOBAL DE TOOLTIP (click-fuera) ---
  useEffect(() => {
    if (!tooltipAbierto) return;

    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-tooltip="true"]')) {
        setTooltipAbierto(null);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [tooltipAbierto]);

  // --- LÓGICA DE CÁLCULO ---

  const currentDistanceKm = useMemo(
    () => (distanceSliderValue / 100) * MAX_DISTANCE_KM,
    [distanceSliderValue]
  );

  const recalculatedEffects = useMemo(() => {
    if (!inputs) return null;
    const currentInputs = {
      ...inputs,
      geoJsonData,
      distance_from_impact_km: currentDistanceKm,
    };
    return simulateAsteroidImpact(currentInputs);
  }, [inputs, currentDistanceKm, geoJsonData]);

  const craterRadiusMeters = useMemo(() => {
    if (!recalculatedEffects) return 0;
    const { scenario, crater } = recalculatedEffects;
    return scenario !== "Explosión Aérea" &&
      scenario !== "Airburst" &&
      crater?.finalDiameter_m
      ? crater.finalDiameter_m / 2
      : 0;
  }, [recalculatedEffects]);

  const sueloAfectado = useMemo(() => {
    if (!inputs || !inputs.lat)
      return { zona: "Desconocida", tipoSuelo: "No especificado" };

    const lat = inputs.lat;
    let zona = "";
    let tipoSuelo = "";

    if (lat > 19.5) {
      zona = "Sierra Norte";
      tipoSuelo = "Roca";
    } else if (lat > 18.7) {
      zona = "Valles Centrales";
      tipoSuelo = "Sedimento";
    } else {
      zona = "Mixteca";
      tipoSuelo = "Suelo Blando";
    }

    return { zona, tipoSuelo };
  }, [inputs]);

  const totalAffectedPopulation =
    recalculatedEffects?.affectedData?.combinedReferencePopulation || 0;
  const totalAffectedHousing =
    recalculatedEffects?.affectedData?.housingInBlast || 0;

  // Estilo del acento activo (la categoría abierta)
  const activeCat = useMemo(
    () => CATEGORIES.find((c) => c.id === openCategory) || CATEGORIES[0],
    [openCategory]
  );

  // -------------------------------------------------------------------
  //  Pantalla de carga
  // -------------------------------------------------------------------
  if (!inputs || !recalculatedEffects) {
    return (
      <div
        style={{ background: PALETTE.bg, color: PALETTE.textMain }}
        className="min-h-screen flex items-center justify-center font-sans"
      >
        <p
          className="text-xl"
          style={{ fontWeight: 600, letterSpacing: "0.05em" }}
        >
          Cargando datos de la simulación…
        </p>
      </div>
    );
  }

  // Desestructuración de resultados calculados
  const {
    impactEnergyMegatons = 0,
    crater = { finalDiameter_m: 0, transientDiameter_m: 0, type: "N/A" },
    airBlast = {
      overpressure_Pa: 0,
      windVelocity_ms: 0,
      arrival_time_s: 0,
      damageDescription: "N/A",
    },
    seismicEffects = { richterMagnitude: 0, mercalliIntensity: "N/A" },
    thermalRadiation = {
      thermalExposure_Jm2: 0,
      fireballRadius_km: 0,
      ignitionEffects: "N/A",
    },
    ejecta = {
      thickness_m: 0,
      meanFragmentSize_mm: 0,
      message: "No hay eyecciones.",
    },
    scenario = "N/A",
    burstAltitude_km = 0,
  } = recalculatedEffects;

  const isAirburst = scenario === "Explosión Aérea" || scenario === "Airburst";

  // -------------------------------------------------------------------
  //  Radio dibujado en el mapa según la categoría abierta
  //  (un círculo distinto por categoría)
  // -------------------------------------------------------------------
  const mapCircleRadius = useMemo(() => {
    switch (openCategory) {
      case "crater":
        return craterRadiusMeters;
      case "termica":
        return (thermalRadiation?.fireballRadius_km || 0) * 1000;
      case "onda":
      case "sismo":
      case "ejecta":
        // estos efectos se evalúan a la distancia del observador
        return currentDistanceKm * 1000;
      case "vulnerabilidad":
        // "radio más grande": cubre la zona poblada afectada (≥ cráter)
        return Math.max(craterRadiusMeters, currentDistanceKm * 1000);
      default:
        return craterRadiusMeters;
    }
  }, [
    openCategory,
    craterRadiusMeters,
    thermalRadiation,
    currentDistanceKm,
  ]);

  // ===================================================================
  //  Estilos reutilizables (estética del sitio)
  // ===================================================================
  const labelStyle = {
    fontSize: "0.95rem",
    color: PALETTE.textSec,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };
  const bigValueStyle = {
    fontSize: "1.35rem",
    fontWeight: 600,
    color: "#fff",
  };
  const cardStyle = {
    background: PALETTE.card,
    border: `1px solid ${PALETTE.cardBorder}`,
    borderRadius: 14,
  };

  // ===================================================================
  //  Contenido por categoría  
  // ===================================================================
  const renderCategoryBody = (id) => {
    switch (id) {
      case "crater":
        return (
          <CategoriaCrater
            crater={crater}
            isAirburst={isAirburst}
            burstAltitude_km={burstAltitude_km}
            accent={activeCat.hex}
            tooltipAbierto={tooltipAbierto}
            onToggleTooltip={handleToggleTooltip}
          />
        );

      case "termica":
        return (
          <CategoriaTermica
            thermalRadiation={thermalRadiation}
            accent={activeCat.hex}
            tooltipAbierto={tooltipAbierto}
            onToggleTooltip={handleToggleTooltip}
          />
        );

      case "onda":
        return (
          <CategoriaOnda
            airBlast={airBlast}
            accent={activeCat.hex}
            tooltipAbierto={tooltipAbierto}
            onToggleTooltip={handleToggleTooltip}
          />
        );

      case "sismo":
        return (
          <CategoriaSismo
            seismicEffects={seismicEffects}
            sueloAfectado={sueloAfectado}
            isAirburst={isAirburst}
            accent={activeCat.hex}
            tooltipAbierto={tooltipAbierto}
            onToggleTooltip={handleToggleTooltip}
          />
        );

      case "ejecta":
        return (
          <CategoriaEyecta
            ejecta={ejecta}
            isAirburst={isAirburst}
            accent={activeCat.hex}
            tooltipAbierto={tooltipAbierto}
            onToggleTooltip={handleToggleTooltip}
          />
        );

      case "vulnerabilidad":
        // Aún no se refactoriza — la haremos en Fase 4.
        return (
          <div>
            <div
              className="rounded-xl p-4 mb-3"
              style={{
                background: `${activeCat.hex}14`,
                border: `1px solid ${activeCat.hex}33`,
              }}
            >
              <span style={{ ...labelStyle, fontSize: "0.75rem" }}>
                Población afectada
              </span>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.15,
                }}
              >
                {totalAffectedPopulation.toLocaleString()}
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 400,
                    color: PALETTE.textSec,
                    marginLeft: 8,
                  }}
                >
                  personas
                </span>
              </p>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: `${activeCat.hex}14`,
                border: `1px solid ${activeCat.hex}33`,
              }}
            >
              <span style={{ ...labelStyle, fontSize: "0.75rem" }}>
                Viviendas afectadas
              </span>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.15,
                }}
              >
                {totalAffectedHousing.toLocaleString()}
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 400,
                    color: PALETTE.textSec,
                    marginLeft: 8,
                  }}
                >
                  viviendas
                </span>
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ===================================================================
  //  RENDER
  // ===================================================================
  return (
    <div
      className="h-screen w-screen overflow-hidden font-sans flex flex-col pt-10"
      style={{ background: PALETTE.bg, color: PALETTE.textMain }}
    >
      {/* ---------------- HEADER ---------------- */}
      <header
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ borderBottom: `1px solid ${PALETTE.cardBorder}` }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(1.8rem, 3.2vw, 2.8rem)",
            fontWeight: 800,
            color: "#ffffff",
            textShadow: "0 0 20px rgba(255,255,255,0.2), 0 0 40px rgba(255,255,255,0.08)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Resultados del Asteroide
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/skyfallx-game")}
            className="transition-all"
            style={{
              padding: "0.55rem 1.1rem",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: PALETTE.textMain,
              background: PALETTE.card,
              border: `1px solid ${PALETTE.cardBorder}`,
            }}
          >
            <><span style={{ fontSize: "1.1rem" }}>←</span> Otro impacto</>
          </button>
          <button
            onClick={() =>
              navigate("/defensa-planetaria", {
                state: {
                  simulationResults: recalculatedEffects,
                  inputParameters: inputs,
                },
              })
            }
            className="transition-all hover:opacity-90"
            style={{
              padding: "0.55rem 1.1rem",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#fff",
              background:
                "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
            }}
          >
            <>Defensa Planetaria <span style={{ fontSize: "1.1rem" }}>→</span></>
          </button>
        </div>
      </header>


      {/* ---------------- BODY: MAPA (2/3) + SIDEBAR (1/3) ---------------- */}
      <div className="flex-1 flex overflow-hidden gap-4 p-4">
        {/* ===== MAPA ===== */}
        <div className="relative flex-1 lg:basis-2/3 h-full">
          <div
            className="relative h-full w-full overflow-hidden"
            style={{
              borderRadius: 16,
              border: `1px solid ${PALETTE.cardBorder}`,
            }}
          >
            {/* Badge de coordenadas (estilo referencia) */}
            <div
              className="absolute top-4 left-4 z-[500] px-3 py-1.5 rounded-lg backdrop-blur-md"
              style={{
                background: "rgba(0,0,0,0.55)",
                border: `1px solid ${PALETTE.cardBorder}`,
              }}
            >
              <span
                style={{
                  color: PALETTE.textSec,
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                {impactPos[0].toFixed(4)}°N · {Math.abs(impactPos[1]).toFixed(4)}°O
              </span>
            </div>

            {/* Label flotante: distancia del observador */}
            <div
              className="absolute bottom-4 left-4 z-[500] px-4 py-3 rounded-2xl backdrop-blur-md"
              style={{
                background: "rgba(0,0,0,0.8)",
                border: `1px solid ${PALETTE.cardBorder}`,
                maxWidth: 340,
              }}
            >
              <span style={{ ...labelStyle, fontSize: "0.75rem" }}>Energía total liberada</span>
              <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff", lineHeight: 1.2, marginTop: "0.25rem" }}>
                {impactEnergyMegatons.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                <span style={{ fontSize: "0.85rem", fontWeight: 400, color: PALETTE.textSec }}>MT</span>
              </p>
            </div>

            <MapContainer
              center={impactPos}
              zoom={MAP_ZOOM}
              scrollWheelZoom={false}
              className="h-full w-full"
              style={{ background: "#000" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Capa GeoJSON del Mapa de Población
              {geoJsonData && (
                <GeoJSON
                  data={geoJsonData}
                  style={{ color: "#4b5563", weight: 1, fillOpacity: 0.1, interactive: false }}
                />
              )} */}

              {mapCircleRadius > 0 ? (
                <Circle
                  center={impactPos}
                  radius={mapCircleRadius}
                  pathOptions={{
                    color: activeCat.hex,
                    fillColor: activeCat.hex,
                    fillOpacity: 0.35,
                    weight: 3,
                  }}
                />
              ) : (
                <Marker position={impactPos} />
              )}
            </MapContainer>
          </div>
        </div>

        {/* ===== SIDEBAR: RESULTADOS (acordeón con scroll) ===== */}
        <aside
          className="h-full overflow-y-auto shrink-0 w-full max-w-md lg:basis-1/3"
          style={{
            background: PALETTE.card,
            border: `1px solid ${PALETTE.cardBorder}`,
            borderRadius: 16,
          }}
        >
          <div className="p-6">
            {/* 1. SLIDER STICKY — primero de todo */}
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                marginLeft: "-1.5rem",
                marginRight: "-1.5rem",
                marginTop: "-1.5rem",
                padding: "1.25rem 1.5rem",
                background: PALETTE.bg,
                borderBottom: `1px solid ${PALETTE.cardBorder}`,
                marginBottom: "1.5rem",
              }}
            >
              <div className="flex justify-between items-baseline">
                <span style={{ ...labelStyle, fontSize: "0.8rem" }}>
                  Distancia al centro
                </span>
                <span style={{ ...bigValueStyle, color: activeCat.hex }}>
                  {currentDistanceKm.toFixed(1)} km
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={distanceSliderValue}
                onChange={(e) => setDistanceSliderValue(Number(e.target.value))}
                className="w-full mt-3 appearance-none cursor-pointer"
                style={{
                  height: 6,
                  borderRadius: 9999,
                  background: `linear-gradient(to right, ${activeCat.hex} ${distanceSliderValue}%, rgba(255,255,255,0.1) ${distanceSliderValue}%)`,
                  accentColor: activeCat.hex,
                }}
              />
              <div
                className="flex justify-between mt-1"
                style={{ color: PALETTE.textFaint, fontSize: "0.7rem" }}
              >
                <span>0 km</span>
                <span>{MAX_DISTANCE_KM} km</span>
              </div>
            </div>

            {/* 2. Título de sección */}
            <p
              style={{
                color: PALETTE.textSec,
                fontSize: "0.95rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                marginBottom: "1.5rem",
              }}
            >
              Consecuencias del impacto
            </p>

            {/* 3. Etiqueta del acordeón (puedes borrarla si te parece redundante con el título de arriba) */}
            <p
              style={{
                color: PALETTE.textFaint,
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: "0.75rem",
              }}
            >
              Categoría
            </p>

            {/* 4. Acordeón */}
            <div className="space-y-3">
              {CATEGORIES.map((cat) => {
                const isOpen = openCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    className="transition-all duration-300"
                    style={{
                      background: PALETTE.cardDeep,
                      border: `1px solid ${
                        isOpen ? `${cat.hex}66` : PALETTE.cardBorder
                      }`,
                      borderRadius: 16,
                      boxShadow: isOpen ? `0 0 24px ${cat.glow}` : "none",
                      overflow: isOpen ? "visible" : "hidden",
                    }}
                  >
                    {/* --- Cabecera del acordeón --- */}
                    <button
                      onClick={() =>
                        setOpenCategory(isOpen ? null : cat.id)
                      }
                      className="w-full flex items-center justify-between px-5 py-4 transition-colors"
                      style={{ background: "transparent" }}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 9999,
                            background: cat.hex,
                            boxShadow: `0 0 10px ${cat.hex}`,
                            display: "inline-block",
                          }}
                        />
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "1rem",
                            color: isOpen ? cat.hex : PALETTE.textMain,
                            transition: "color 0.3s",
                          }}
                        >
                          {cat.label}
                        </span>
                      </span>
                      <span
                        style={{
                          color: isOpen ? cat.hex : PALETTE.textSec,
                          transform: isOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.3s, color 0.3s",
                          fontSize: "0.85rem",
                        }}
                      >
                        ▼
                      </span>
                    </button>

                    {/* --- Cuerpo expandible --- */}
                    <div
                      style={{
                        maxHeight: isOpen ? 1200 : 0,
                        opacity: isOpen ? 1 : 0,
                        transition:
                          "max-height 0.4s ease, opacity 0.3s ease",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        className="px-5 pb-5 pt-2"
                        style={{
                          borderTop: `1px solid ${PALETTE.cardBorder}`,
                        }}
                      >
                        {renderCategoryBody(cat.id)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
};

export default Impacto;