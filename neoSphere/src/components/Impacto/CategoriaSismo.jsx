// src/components/Impacto/CategoriaSismo.jsx
//
// Solo aplica en impacto superficial. La magnitud Richter es valor estrella.
// El bloque de geología (zona + tipo de suelo) se mantiene como cards
// duales del diseño original.

import React from "react";
import Parametro from "./Parametro";
import { PALETTE } from "../../utils/categorias";
import { formatTiempo } from "../../utils/formatUnidades";
import { analogiaSismo } from "../../utils/analogias";

const CategoriaSismo = ({
  seismicEffects,
  sueloAfectado,
  isAirburst,
  accent,
  tooltipAbierto,
  onToggleTooltip,
}) => {
  // ---- Airburst: no hay sismo ----
  if (isAirburst) {
    return (
      <p style={{ color: PALETTE.textSec, fontStyle: "italic" }}>
        No hay sismo significativo en una explosión aérea.
      </p>
    );
  }

  const richter = seismicEffects?.richterMagnitude || 0;

  return (
    <div>
      {/* --- Bloque destacado: magnitud Richter --- */}
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
            Magnitud
          </span>
          {/* tooltipId="sismo.richter" inline */}
          <SismoTooltipInline
            tooltipId="sismo.richter"
            tooltipAbierto={tooltipAbierto}
            onToggleTooltip={onToggleTooltip}
            accent={accent}
          />
        </div>
        <p
          style={{
            fontSize: "2.4rem",
            fontWeight: 800,
            color: accent,
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          {richter.toFixed(2)}
        </p>
        <span style={{ color: PALETTE.textSec, fontSize: "0.8rem" }}>
          escala Richter
        </span>
        {/* Analogía debajo (valor estrella) */}
        {analogiaSismo(richter) && (
          <p
            style={{
              margin: "0.5rem 0 0",
              fontSize: "0.85rem",
              color: PALETTE.textMain,
              fontStyle: "italic",
              opacity: 0.85,
              lineHeight: 1.4,
            }}
          >
            ≈ {analogiaSismo(richter)}
          </p>
        )}
      </div>

      <Parametro
        label="Magnitud atenuada"
        valor={(seismicEffects.effectiveMagnitude || 0).toFixed(2)}
        accent={accent}
        tooltipId="sismo.efectiva"
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />

      <Parametro
        label="Escala Mercalli"
        valor={seismicEffects.mercalliIntensity || "—"}
        accent={accent}
        tooltipId="sismo.mercalli"
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />

      <Parametro
        label="Tiempo de llegada"
        valor={formatTiempo(seismicEffects.arrival_time_s).display}
        accent={accent}
        tooltipId="sismo.tiempoLlegada"
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />

      {/* --- Geología del impacto: zona + tipo de suelo --- */}
      <div
        style={{
          paddingTop: "0.75rem",
          marginTop: "0.5rem",
          borderTop: `1px solid ${PALETTE.cardBorder}`,
        }}
      >
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
            Geología del impacto
          </span>
          <SismoTooltipInline
            tooltipId="sismo.geologia"
            tooltipAbierto={tooltipAbierto}
            onToggleTooltip={onToggleTooltip}
            accent={accent}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              background: PALETTE.card,
              border: `1px solid ${PALETTE.cardBorder}`,
              borderRadius: 8,
              padding: "0.75rem",
            }}
          >
            <p
              style={{
                margin: 0,
                color: PALETTE.textSec,
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Zona
            </p>
            <p style={{ margin: 0, color: "#fff", fontWeight: 600 }}>
              {sueloAfectado.zona}
            </p>
          </div>
          <div
            style={{
              background: PALETTE.card,
              border: `1px solid ${PALETTE.cardBorder}`,
              borderRadius: 8,
              padding: "0.75rem",
            }}
          >
            <p
              style={{
                margin: 0,
                color: PALETTE.textSec,
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Composición
            </p>
            <p style={{ margin: 0, color: "#fff", fontWeight: 600 }}>
              {sueloAfectado.tipoSuelo}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper inline para añadir Tooltip a labels custom sin repetir 5 líneas.
// (lo importamos via import normal arriba; aquí solo lo enchufamos)
import Tooltip from "./Tooltip";
const SismoTooltipInline = ({
  tooltipId,
  tooltipAbierto,
  onToggleTooltip,
  accent,
}) => (
  <Tooltip
    tooltipId={tooltipId}
    abierto={tooltipAbierto === tooltipId}
    onToggle={() => onToggleTooltip(tooltipId)}
    accent={accent}
  />
);

export default CategoriaSismo;
