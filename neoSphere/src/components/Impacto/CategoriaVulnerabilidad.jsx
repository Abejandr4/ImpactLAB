// src/components/Impacto/CategoriaVulnerabilidad.jsx
//
// Categoría "Pérdidas" (id interno: "vulnerabilidad"). Muestra:
//   - Header con víctimas combinadas (regla no aditiva de Rumpf et al. 2017).
//   - Chips de filtro: [Todos] [Onda] [Térmica] [Sismo] [Eyecta] [Cráter].
//   - Vista detallada por efecto, según chip activo.
//
// En airburst se ocultan los chips de Sismo, Eyecta y Cráter.

import React from "react";
import Tooltip from "./Tooltip";
import { PALETTE, CATEGORIES } from "../../utils/categorias";
import { formatNumero } from "../../utils/formatUnidades";
import { analogiaVictimas } from "../../utils/analogias";

// =============================================================
// Configuración interna de efectos
// =============================================================
const EFECTOS = [
  {
    id: "onda",
    label: "Onda",
    catId: "onda",
    radioKey: "blastRadius_km",
    populationKey: "populationInBlast",
    housingKey: "housingInBlast",
    victimsKey: "shockwave",
    requiresSuperficial: false,
  },
  {
    id: "termica",
    label: "Térmica",
    catId: "termica",
    radioKey: "thermalRadius_km",
    populationKey: "populationInThermal",
    housingKey: null,
    victimsKey: "fireball",
    requiresSuperficial: false,
  },
  {
    id: "sismo",
    label: "Sismo",
    catId: "sismo",
    radioKey: "seismicRadius_km",
    populationKey: "populationInSeismic",
    housingKey: null,
    victimsKey: "seismic",
    requiresSuperficial: true,
  },
  {
    id: "eyecta",
    label: "Eyecta",
    catId: "ejecta",
    radioKey: "ejectaRadius_km",
    populationKey: "populationInEjecta",
    housingKey: null,
    victimsKey: "ejecta",
    requiresSuperficial: true,
  },
  {
    id: "crater",
    label: "Cráter",
    catId: "crater",
    radioKey: "craterRadius_km",
    populationKey: "populationInCrater",
    housingKey: "housingInCrater",
    victimsKey: null,
    requiresSuperficial: true,
  },
];

const getColor = (catId) =>
  CATEGORIES.find((c) => c.id === catId)?.hex || PALETTE.textSec;

// =============================================================
// Sub-componentes
// =============================================================

const Chip = ({ label, active, color, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding: "0.4rem 0.85rem",
      borderRadius: 9999,
      border: `1px solid ${active ? color : PALETTE.cardBorder}`,
      background: active ? `${color}22` : "transparent",
      color: active ? color : PALETTE.textMain,
      fontSize: "0.82rem",
      fontWeight: 600,
      letterSpacing: "0.02em",
      cursor: "pointer",
      transition: "all 0.2s",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </button>
);

const ScenarioCard = ({ label, value, accent }) => (
  <div
    style={{
      flex: 1,
      padding: "0.6rem 0.75rem",
      borderRadius: 8,
      background: PALETTE.card,
      border: `1px solid ${PALETTE.cardBorder}`,
      textAlign: "center",
    }}
  >
    <p
      style={{
        margin: 0,
        fontSize: "0.65rem",
        color: PALETTE.textSec,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontWeight: 600,
      }}
    >
      {label}
    </p>
    <p
      style={{
        margin: "0.25rem 0 0",
        fontSize: "1.1rem",
        fontWeight: 700,
        color: accent,
      }}
    >
      {value}
    </p>
  </div>
);

const FilaResumen = ({ efecto, accent, recalculatedEffects }) => {
  const af = recalculatedEffects?.affectedData || {};
  const v = recalculatedEffects?.victims || {};
  const radio_km = af[efecto.radioKey] || 0;
  const poblacion = af[efecto.populationKey] || 0;

  let victimasEsperadas;
  if (efecto.victimsKey && v[efecto.victimsKey]) {
    victimasEsperadas = v[efecto.victimsKey].expected?.estimated || 0;
  } else if (efecto.id === "crater") {
    victimasEsperadas = poblacion;
  } else {
    victimasEsperadas = 0;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.65rem",
        padding: "0.55rem 0.75rem",
        borderRadius: 8,
        background: PALETTE.card,
        border: `1px solid ${PALETTE.cardBorder}`,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 9999,
          background: accent,
          boxShadow: `0 0 6px ${accent}`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: "0.85rem",
          color: PALETTE.textMain,
          fontWeight: 600,
          flex: "0 0 65px",
        }}
      >
        {efecto.label}
      </span>
      <span
        style={{
          fontSize: "0.78rem",
          color: PALETTE.textSec,
          flex: 1,
          textAlign: "right",
        }}
      >
        {radio_km.toFixed(1)} km
      </span>
      <span
        style={{
          fontSize: "0.9rem",
          color: accent,
          fontWeight: 700,
          flex: "0 0 80px",
          textAlign: "right",
        }}
      >
        {formatNumero(victimasEsperadas).display}
      </span>
    </div>
  );
};

// =============================================================
// Componente principal
// =============================================================

const CategoriaVulnerabilidad = ({
  recalculatedEffects,
  isAirburst,
  accent,
  filtroEfecto,
  setFiltroEfecto,
  tooltipAbierto,
  onToggleTooltip,
}) => {
  const [verEscenarios, setVerEscenarios] = React.useState(false);

  const combinedVictims = recalculatedEffects?.combinedVictims || {};
  const affectedData = recalculatedEffects?.affectedData || {};
  const victims = recalculatedEffects?.victims || {};

  const chipsDisponibles = EFECTOS.filter(
    (e) => !isAirburst || !e.requiresSuperficial
  );

  const expectedCombined = combinedVictims.expected?.estimated || 0;
  const bestCombined = combinedVictims.best?.estimated || 0;
  const worstCombined = combinedVictims.worst?.estimated || 0;

  // ------------------------------------------------------------
  // VISTA: HEADER
  // ------------------------------------------------------------
  const renderHeader = () => {
    // Suma de viviendas en los radios afectados (blast + crater)
    // Como blast suele contener al crater, basta con tomar el housing del blast
    // y sumar el del cráter si es mayor (defensive)
    const viviendasBlast = affectedData?.housingInBlast || 0;
    const viviendasCrater = affectedData?.housingInCrater || 0;
    const viviendasTotal = Math.max(viviendasBlast, viviendasCrater);

    return (
      <>
        {/* Bloque víctimas esperadas */}
        <div
          style={{
            background: `${accent}14`,
            border: `1px solid ${accent}33`,
            borderRadius: 12,
            padding: "1rem",
            marginBottom: "0.75rem",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              marginBottom: "0.35rem",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: PALETTE.textSec,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Víctimas esperadas
            </span>
            <Tooltip
              tooltipId="vulnerabilidad.combinada"
              abierto={tooltipAbierto === "vulnerabilidad.combinada"}
              onToggle={() => onToggleTooltip("vulnerabilidad.combinada")}
              accent={accent}
            />
          </div>

          <p
            style={{
              fontSize: "2.1rem",
              fontWeight: 800,
              color: accent,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {formatNumero(expectedCombined).display}
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 400,
                color: PALETTE.textSec,
                marginLeft: 6,
              }}
            >
              personas
            </span>
          </p>

          {analogiaVictimas(expectedCombined) && (
            <p
              style={{
                margin: "0.4rem 0 0",
                fontSize: "0.85rem",
                color: PALETTE.textMain,
                fontStyle: "italic",
                opacity: 0.85,
                lineHeight: 1.4,
              }}
            >
              ≈ {analogiaVictimas(expectedCombined)}
            </p>
          )}

          <div
            style={{
              marginTop: "0.75rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <button
              type="button"
              onClick={() => setVerEscenarios((v) => !v)}
              style={{
                padding: 0,
                background: "transparent",
                border: "none",
                color: PALETTE.textSec,
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              {verEscenarios ? "▲ Ocultar" : "▼ Ver rango (mejor / peor caso)"}
            </button>
            <Tooltip
              tooltipId="vulnerabilidad.escenarios"
              abierto={tooltipAbierto === "vulnerabilidad.escenarios"}
              onToggle={() => onToggleTooltip("vulnerabilidad.escenarios")}
              accent={accent}
            />
          </div>

          {verEscenarios && (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginTop: "0.6rem",
              }}
            >
              <ScenarioCard
                label="Optimista"
                value={formatNumero(bestCombined).display}
                accent={PALETTE.textMain}
              />
              <ScenarioCard
                label="Pesimista"
                value={formatNumero(worstCombined).display}
                accent={PALETTE.textMain}
              />
            </div>
          )}
        </div>

        {/* Bloque viviendas afectadas */}
        <div
          style={{
            background: `${accent}14`,
            border: `1px solid ${accent}33`,
            borderRadius: 12,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              marginBottom: "0.35rem",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: PALETTE.textSec,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Viviendas afectadas
            </span>
            <Tooltip
              tooltipId="vulnerabilidad.viviendas"
              abierto={tooltipAbierto === "vulnerabilidad.viviendas"}
              onToggle={() => onToggleTooltip("vulnerabilidad.viviendas")}
              accent={accent}
            />
          </div>

          <p
            style={{
              fontSize: "1.7rem",
              fontWeight: 800,
              color: accent,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {formatNumero(viviendasTotal).display}
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 400,
                color: PALETTE.textSec,
                marginLeft: 6,
              }}
            >
              viviendas
            </span>
          </p>
        </div>
      </>
    );
  };

  // ------------------------------------------------------------
  // VISTA: CHIPS DE FILTRO
  // ------------------------------------------------------------
  const renderChips = () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.4rem",
        marginBottom: "1rem",
      }}
    >
      <Chip
        label="Todos"
        active={filtroEfecto === "todos"}
        color={accent}
        onClick={() => setFiltroEfecto("todos")}
      />
      {chipsDisponibles.map((e) => (
        <Chip
          key={e.id}
          label={e.label}
          active={filtroEfecto === e.id}
          color={getColor(e.catId)}
          onClick={() => setFiltroEfecto(e.id)}
        />
      ))}
    </div>
  );

  // ------------------------------------------------------------
  // VISTA: FILTRO "TODOS" — lista compacta
  // ------------------------------------------------------------
  const renderTodos = () => (
    <div>
      <p
        style={{
          fontSize: "0.7rem",
          color: PALETTE.textSec,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: "0 0 0.5rem",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Por efecto</span>
        <span>Radio</span>
        <span>Víctimas esperadas</span>
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
        }}
      >
        {chipsDisponibles.map((e) => (
          <FilaResumen
            key={e.id}
            efecto={e}
            accent={getColor(e.catId)}
            recalculatedEffects={recalculatedEffects}
          />
        ))}
      </div>
    </div>
  );

  // ------------------------------------------------------------
  // VISTA: FILTRO ESPECÍFICO (excepto cráter)
  // ------------------------------------------------------------
  const renderDetalleEfecto = (efecto) => {
    const color = getColor(efecto.catId);
    const radio_km = affectedData[efecto.radioKey] || 0;
    const poblacion = affectedData[efecto.populationKey] || 0;
    const viviendas = efecto.housingKey
      ? affectedData[efecto.housingKey] || 0
      : null;
    const vEfecto = victims[efecto.victimsKey];

    if (!vEfecto) {
      return (
        <div>
          <p
            style={{
              color: PALETTE.textSec,
              fontStyle: "italic",
              fontSize: "0.85rem",
            }}
          >
            Sin datos de víctimas para este efecto en el escenario actual.
          </p>
        </div>
      );
    }

    const expected = vEfecto.expected?.estimated || 0;
    const best = vEfecto.best?.estimated || 0;
    const worst = vEfecto.worst?.estimated || 0;

    return (
      <div
        style={{
          background: PALETTE.card,
          border: `1px solid ${color}33`,
          borderRadius: 10,
          padding: "0.85rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: viviendas !== null ? "1fr 1fr 1fr" : "1fr 1fr",
            gap: "0.5rem",
            marginBottom: "0.85rem",
          }}
        >
          <div>
            <p style={miniLabel}>Radio</p>
            <p style={{ ...miniValue, color }}>{radio_km.toFixed(1)} km</p>
          </div>
          <div>
            <p style={miniLabel}>Expuestos</p>
            <p style={miniValue}>{formatNumero(poblacion).display}</p>
          </div>
          {viviendas !== null && (
            <div>
              <p style={miniLabel}>Viviendas</p>
              <p style={miniValue}>{formatNumero(viviendas).display}</p>
            </div>
          )}
        </div>

        <div
          style={{
            paddingTop: "0.75rem",
            borderTop: `1px solid ${PALETTE.cardBorder}`,
          }}
        >
          <p style={miniLabel}>Víctimas esperadas</p>
          <p
            style={{
              margin: "0.15rem 0 0",
              fontSize: "1.5rem",
              fontWeight: 700,
              color,
              lineHeight: 1.15,
            }}
          >
            {formatNumero(expected).display}
          </p>
          {analogiaVictimas(expected) && (
            <p
              style={{
                margin: "0.3rem 0 0",
                fontSize: "0.8rem",
                color: PALETTE.textMain,
                fontStyle: "italic",
                opacity: 0.8,
                lineHeight: 1.4,
              }}
            >
              ≈ {analogiaVictimas(expected)}
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginTop: "0.75rem",
          }}
        >
          <ScenarioCard
            label="Optimista"
            value={formatNumero(best).display}
            accent={PALETTE.textMain}
          />
          <ScenarioCard
            label="Pesimista"
            value={formatNumero(worst).display}
            accent={PALETTE.textMain}
          />
        </div>
      </div>
    );
  };

  // ------------------------------------------------------------
  // VISTA: FILTRO "CRÁTER"
  // ------------------------------------------------------------
  const renderDetalleCrater = () => {
    const efecto = EFECTOS.find((e) => e.id === "crater");
    const color = getColor(efecto.catId);
    const radio_km = affectedData[efecto.radioKey] || 0;
    const poblacion = affectedData[efecto.populationKey] || 0;
    const viviendas = affectedData[efecto.housingKey] || 0;

    return (
      <div
        style={{
          background: PALETTE.card,
          border: `1px solid ${color}33`,
          borderRadius: 10,
          padding: "0.85rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "0.5rem",
            marginBottom: "0.85rem",
          }}
        >
          <div>
            <p style={miniLabel}>Radio</p>
            <p style={{ ...miniValue, color }}>{radio_km.toFixed(2)} km</p>
          </div>
          <div>
            <p style={miniLabel}>Personas</p>
            <p style={miniValue}>{formatNumero(poblacion).display}</p>
          </div>
          <div>
            <p style={miniLabel}>Viviendas</p>
            <p style={miniValue}>{formatNumero(viviendas).display}</p>
          </div>
        </div>
        <p
          style={{
            margin: 0,
            padding: "0.6rem 0.75rem",
            borderRadius: 8,
            background: `${color}11`,
            border: `1px dashed ${color}44`,
            color: PALETTE.textMain,
            fontSize: "0.85rem",
            fontStyle: "italic",
            lineHeight: 1.45,
          }}
        >
          Toda la población y viviendas dentro del cráter son afectadas por
          completo.
        </p>
      </div>
    );
  };

  // ------------------------------------------------------------
  // Lógica de renderizado del detalle según filtro
  // ------------------------------------------------------------
  const renderDetalle = () => {
    if (filtroEfecto === "todos") return renderTodos();
    if (filtroEfecto === "crater") return renderDetalleCrater();

    const efecto = EFECTOS.find((e) => e.id === filtroEfecto);
    if (!efecto) return renderTodos();
    return renderDetalleEfecto(efecto);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div>
      {renderHeader()}
      {renderChips()}
      {renderDetalle()}
    </div>
  );
};

// =============================================================
// Estilos compartidos
// =============================================================
const miniLabel = {
  margin: 0,
  fontSize: "0.65rem",
  color: PALETTE.textSec,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 600,
};
const miniValue = {
  margin: "0.15rem 0 0",
  fontSize: "0.95rem",
  fontWeight: 700,
  color: "#fff",
};

export default CategoriaVulnerabilidad;