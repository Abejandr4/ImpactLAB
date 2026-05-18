// src/components/Impacto/Parametro.jsx
//
// Fila reutilizable para mostrar un parámetro en el sidebar.
// Reemplaza al componente `Row` interno actual de impacto.jsx, y añade:
//   - ícono ⓘ con tooltip (si se pasa tooltipId)
//   - línea de analogía debajo (solo para valores estrella)
//   - línea de nota (para meltNote, reachNote, arrivalNote, etc.)
//
// Props:
//   label         - string. Etiqueta del parámetro.
//   valor         - string YA FORMATEADO (ej. "2.45 km"). Quien llama usa formatUnidades.
//   accent        - color hex de la categoría. Tinta el valor y el tooltip.
//   tooltipId     - opcional. Si existe en TOOLTIPS, muestra ⓘ.
//   analogia      - opcional. String ya generado por la función analogia*().
//                   Si es "" o undefined, no se muestra esa línea.
//   nota          - opcional. Texto de validez/advertencia (cursiva, gris).
//                   Útil para meltNote, reachNote, arrivalNote.
//   tooltipAbierto, onToggleTooltip
//                 - estado controlado desde impacto.jsx. Solo un tooltip
//                   puede estar abierto a la vez globalmente.
//   destacado     - opcional bool. Si true, el valor se muestra más grande
//                   (para valores "estrella" como diámetro de cráter,
//                   magnitud sísmica, energía total).

import React from "react";
import Tooltip from "./Tooltip";
import { PALETTE } from "../../utils/categorias";

const Parametro = ({
  label,
  valor,
  accent,
  tooltipId,
  analogia,
  nota,
  tooltipAbierto,
  onToggleTooltip,
  destacado = false,
}) => {
  const hasTooltip = Boolean(tooltipId);
  const hasAnalogia = Boolean(analogia && analogia.trim().length > 0);
  const hasNota = Boolean(nota && nota.trim().length > 0);

  return (
    <div style={{ padding: "0.4rem 0" }}>
      {/* --- Fila principal: label (+ⓘ) ............ valor --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "0.75rem",
        }}
      >
        <span
          style={{
            fontSize: "0.8rem",
            color: PALETTE.textSec,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {label}
          {hasTooltip && (
            <Tooltip
              tooltipId={tooltipId}
              abierto={tooltipAbierto === tooltipId}
              onToggle={() => onToggleTooltip(tooltipId)}
              accent={accent}
            />
          )}
        </span>

        <span
          style={{
            fontSize: destacado ? "1.6rem" : "1.05rem",
            fontWeight: destacado ? 700 : 600,
            color: accent || "#fff",
            textAlign: "right",
            lineHeight: 1.15,
          }}
        >
          {valor}
        </span>
      </div>

      {/* --- Analogía (solo valores estrella) --- */}
      {hasAnalogia && (
        <p
          style={{
            margin: "0.3rem 0 0",
            fontSize: "0.85rem",
            color: PALETTE.textMain,
            fontStyle: "italic",
            opacity: 0.85,
            textAlign: "right",
            lineHeight: 1.4,
          }}
        >
          ≈ {analogia}
        </p>
      )}

      {/* --- Nota de validez / advertencia --- */}
      {hasNota && (
        <p
          style={{
            margin: "0.35rem 0 0",
            fontSize: "0.72rem",
            color: PALETTE.textFaint,
            fontStyle: "italic",
            lineHeight: 1.4,
          }}
        >
          ⓘ {nota}
        </p>
      )}
    </div>
  );
};

export default Parametro;
