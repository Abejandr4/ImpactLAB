// src/components/Impacto/CategoriaTermica.jsx
//
// Térmica aplica en ambos escenarios (airburst y superficial) si v > 15 km/s.
// Si no aplica, muestra el mensaje devuelto por Operaciones.js.

import React from "react";
import Parametro from "./Parametro";
import Tooltip from "./Tooltip";
import { PALETTE } from "../../utils/categorias";
import {
  formatLongitud,
  formatTiempo,
} from "../../utils/formatUnidades";

const CategoriaTermica = ({
  thermalRadiation,
  accent,
  tooltipAbierto,
  onToggleTooltip,
}) => {
  // ---- Térmica no aplica (v <= 15 km/s) ----
  if (thermalRadiation?.applies === false || thermalRadiation?.message) {
    return (
      <p style={{ color: PALETTE.textSec, fontStyle: "italic" }}>
        {thermalRadiation?.message ||
          "Radiación térmica no significativa en este impacto."}
      </p>
    );
  }

  // Parsear lista vertical de efectos de ignición
  const ignitionList = (thermalRadiation.ignitionEffects || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Exposición térmica: valor en J/m². Formateado a mano porque no encaja
  // con las funciones genéricas de formatUnidades.
  const formatExposicion = (jm2) => {
    if (!Number.isFinite(jm2) || jm2 <= 0) return "0 J/m²";
    if (jm2 < 1000) return `${jm2.toFixed(0)} J/m²`;
    if (jm2 < 1_000_000) return `${(jm2 / 1000).toFixed(1)} kJ/m²`;
    return `${(jm2 / 1_000_000).toFixed(2)} MJ/m²`;
  };

  // Fracción visible sobre el horizonte: 0–1 → porcentaje
  const horizonPct = Math.round(
    (thermalRadiation.horizonFraction || 0) * 100
  );

  return (
    <div>
      <Parametro
        label="Exposición térmica"
        valor={formatExposicion(thermalRadiation.thermalExposure_Jm2)}
        accent={accent}
        tooltipId="termica.exposicion"
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />

      <Parametro
        label="Radio bola de fuego"
        valor={formatLongitud(thermalRadiation.fireballRadius_m).display}
        accent={accent}
        tooltipId="termica.bolaDeFuego"
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />

      <Parametro
        label="Duración del calor"
        valor={formatTiempo(thermalRadiation.irradiationDuration_s).display}
        accent={accent}
        tooltipId="termica.duracion"
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />

      <Parametro
        label="Visible sobre horizonte"
        valor={`${horizonPct}%`}
        accent={accent}
        tooltipId="termica.horizonte"
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />

      {/* --- Lista vertical de efectos de ignición --- */}
      {ignitionList.length > 0 && (
        <div style={{ paddingTop: "0.75rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                color: PALETTE.textSec,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Qué se quema o sufre quemaduras
            </span>
            <Tooltip
              tooltipId="termica.ignicion"
              abierto={tooltipAbierto === "termica.ignicion"}
              onToggle={() => onToggleTooltip("termica.ignicion")}
              accent={accent}
            />
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
            }}
          >
            {ignitionList.map((item, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: "0.9rem",
                  color: accent,
                  fontWeight: 600,
                  paddingLeft: "0.85rem",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    color: accent,
                  }}
                >
                  •
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CategoriaTermica;
