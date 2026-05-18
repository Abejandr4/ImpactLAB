// src/components/Impacto/CategoriaEyecta.jsx
//
// Solo aplica en impacto superficial.
// El grosor de capa es valor estrella (analogía visible).
// Si el observador está dentro del cráter, mostramos el mensaje
// específico y omitimos los parámetros de eyecta.

import React from "react";
import Parametro from "./Parametro";
import Tooltip from "./Tooltip";
import { PALETTE } from "../../utils/categorias";
import {
  formatLongitud,
  formatTiempo,
} from "../../utils/formatUnidades";
import { analogiaGrosorCapa } from "../../utils/analogias";

const CategoriaEyecta = ({
  ejecta,
  isAirburst,
  accent,
  tooltipAbierto,
  onToggleTooltip,
}) => {
  // ---- Airburst: sin eyecta significativa ----
  if (isAirburst) {
    return (
      <p style={{ color: PALETTE.textSec, fontStyle: "italic" }}>
        No hay eyecciones significativas debido a la explosión aérea.
      </p>
    );
  }

  // ---- Observador dentro del cráter: usar mensaje específico ----
  if (ejecta?.insideCrater) {
    return (
      <div>
        <p
          style={{
            color: PALETTE.textMain,
            fontStyle: "italic",
            marginBottom: "0.75rem",
          }}
        >
          {ejecta.message}
        </p>

        {/* Aún podemos mostrar el alcance máximo total */}
        <Parametro
          label="Alcance máximo"
          valor={formatLongitud((ejecta.maxReach_km || 0) * 1000).display}
          accent={accent}
          tooltipId="eyecta.alcanceMaximo"
          nota={ejecta.reachNote}
          tooltipAbierto={tooltipAbierto}
          onToggleTooltip={onToggleTooltip}
        />
      </div>
    );
  }

  return (
    <div>
      <Parametro
        label="Grosor de capa"
        valor={formatLongitud(ejecta.thickness_m).display}
        accent={accent}
        tooltipId="eyecta.grosor"
        analogia={analogiaGrosorCapa(ejecta.thickness_m)}
        destacado={true}
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />

      <Parametro
        label="Tamaño de fragmentos"
        valor={formatLongitud((ejecta.meanFragmentSize_mm || 0) / 1000).display}
        accent={accent}
        tooltipId="eyecta.fragmento"
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />

      <Parametro
        label="Alcance máximo"
        valor={formatLongitud((ejecta.maxReach_km || 0) * 1000).display}
        accent={accent}
        tooltipId="eyecta.alcanceMaximo"
        nota={ejecta.reachNote}
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />

      <Parametro
        label="Tiempo de llegada"
        valor={formatTiempo(ejecta.arrivalTime_s).display}
        accent={accent}
        tooltipId="eyecta.tiempoLlegada"
        nota={ejecta.arrivalNote}
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />
    </div>
  );
};

export default CategoriaEyecta;
