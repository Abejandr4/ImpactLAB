// src/components/Impacto/CategoriaOnda.jsx
//
// Onda de choque aplica en ambos escenarios (airburst y superficial).
// Es la categoría principal en airburst.

import React from "react";
import Parametro from "./Parametro";
import Tooltip from "./Tooltip";
import { PALETTE } from "../../utils/categorias";
import {
  formatPresion,
  formatTiempo,
} from "../../utils/formatUnidades";

const CategoriaOnda = ({
  airBlast,
  accent,
  tooltipAbierto,
  onToggleTooltip,
}) => {
  return (
    <div>
      <Parametro
        label="Sobrepresión"
        valor={formatPresion(airBlast.overpressure_Pa).display}
        accent={accent}
        tooltipId="onda.sobrepresion"
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />

      <Parametro
        label="Velocidad del viento"
        valor={`${(airBlast.windVelocity_ms || 0).toFixed(1)} m/s`}
        accent={accent}
        tooltipId="onda.viento"
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />

      <Parametro
        label="Tiempo de llegada"
        valor={formatTiempo(airBlast.arrival_time_s).display}
        accent={accent}
        tooltipId="onda.tiempoLlegada"
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />

      {/* --- Daño estructural (texto descriptivo largo) --- */}
      <div style={{ paddingTop: "0.75rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            marginBottom: "0.4rem",
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
            Daño estructural
          </span>
          <Tooltip
            tooltipId="onda.dano"
            abierto={tooltipAbierto === "onda.dano"}
            onToggle={() => onToggleTooltip("onda.dano")}
            accent={accent}
          />
        </div>
        <p
          style={{
            margin: 0,
            color: accent,
            fontWeight: 600,
            fontSize: "0.95rem",
            lineHeight: 1.5,
          }}
        >
          {airBlast.damageDescription}
        </p>
      </div>
    </div>
  );
};

export default CategoriaOnda;
