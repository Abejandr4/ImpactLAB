// src/components/Impacto/CategoriaCrater.jsx
//
// Sólo aplica en impacto superficial. En airburst muestra mensaje
// explicando que no se forma cráter.

import React from "react";
import Parametro from "./Parametro";
import { PALETTE } from "../../utils/categorias";
import { formatLongitud, formatVolumen } from "../../utils/formatUnidades";
import { analogiaCrater } from "../../utils/analogias";

const CategoriaCrater = ({
  crater,
  isAirburst,
  burstAltitude_km,
  accent,
  tooltipAbierto,
  onToggleTooltip,
}) => {
  // ---- Airburst: no hay cráter ----
  if (isAirburst) {
    return (
      <p style={{ color: PALETTE.textSec, fontStyle: "italic" }}>
        No se forma cráter. Explosión aérea a{" "}
        {(burstAltitude_km || 0).toFixed(1)} km de altitud.
      </p>
    );
  }

  // ---- Impacto superficial ----
  return (
    <div>
      <Parametro
        label="Diámetro final"
        valor={formatLongitud(crater.finalDiameter_m).display}
        accent={accent}
        tooltipId="crater.diametro"
        analogia={analogiaCrater(crater.finalDiameter_m)}
        destacado={true}
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />

      <Parametro
        label="Profundidad"
        valor={formatLongitud(crater.finalDepth_m).display}
        accent={accent}
        tooltipId="crater.profundidad"
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />

      <Parametro
        label="Tipo"
        valor={crater.type === "Simple" ? "Simple" : "Complejo"}
        accent={accent}
        tooltipId="crater.tipo"
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />

      <Parametro
        label="Volumen fundido"
        valor={formatVolumen(crater.meltVolume_km3 * 1e9).display}
        accent={accent}
        tooltipId="crater.volumenFundido"
        nota={crater.meltNote}
        tooltipAbierto={tooltipAbierto}
        onToggleTooltip={onToggleTooltip}
      />
    </div>
  );
};

export default CategoriaCrater;
