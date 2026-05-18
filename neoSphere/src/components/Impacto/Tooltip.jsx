// src/components/Impacto/Tooltip.jsx
//
// Tooltip con ícono ⓘ tap-to-toggle (también funciona con hover en desktop).
//
// El estado de "qué tooltip está abierto" NO vive aquí, vive en el padre
// (impacto.jsx) para garantizar que solo uno esté abierto a la vez.
//
// Uso:
//   <Tooltip
//     tooltipId="sismo.richter"
//     abierto={tooltipAbierto === "sismo.richter"}
//     onToggle={() => setTooltipAbierto(prev =>
//       prev === "sismo.richter" ? null : "sismo.richter"
//     )}
//   />
//
// Si tooltipId no existe en TOOLTIPS, el componente no renderiza nada
// (devuelve null). Esto permite usarlo siempre sin condicionales en el padre.

import React from "react";
import { TOOLTIPS } from "../../utils/tooltips";
import { PALETTE } from "../../utils/categorias";

const Tooltip = ({ tooltipId, abierto, onToggle, accent }) => {
  const data = TOOLTIPS[tooltipId];

  // Si el id no existe, no renderizamos nada (no rompe la UI).
  if (!data) return null;

  const color = accent || PALETTE.textSec;

  return (
    <span
      // Marca para detectar clicks "dentro de un tooltip" en el listener global
      data-tooltip="true"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        marginLeft: 6,
        lineHeight: 0,
      }}
    >
      {/* --- Ícono ⓘ --- */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // que no cierre por el listener global
          onToggle();
        }}
        onMouseEnter={() => {
          // Hover en desktop: abre si no estaba abierto
          if (!abierto) onToggle();
        }}
        onMouseLeave={() => {
          // Hover-out cierra solo si fue abierto por hover.
          // Para mantener simple: cerrar siempre al salir.
          if (abierto) onToggle();
        }}
        aria-label={`Más información sobre ${data.titulo}`}
        style={{
          width: 16,
          height: 16,
          padding: 0.1,
          borderRadius: "50%",
          border: `1px solid ${color}`,
          background: "transparent",
          color: color,
          fontSize: "0.7rem",
          fontWeight: 700,
          lineHeight: 1,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          transition: "all 0.2s",
          opacity: abierto ? 1 : 0.6,
        }}
      >
        i
      </button>

      {/* --- Burbuja --- */}
      {abierto && (
        <div
          data-tooltip="true"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            width: 240,
            padding: "0.8rem 0.85rem",
            borderRadius: 10,
            background: "rgba(15,15,15,0.98)",
            border: `1px solid ${color}55`,
            boxShadow: `0 8px 24px rgba(0,0,0,0.6), 0 0 16px ${color}22`,
            backdropFilter: "blur(8px)",
            // Pequeña flecha apuntando al ícono
            // (se logra con un pseudo-elemento, pero aquí lo dejamos simple)
          }}
        >
          <p
            style={{
              margin: 0,
              marginBottom: 4,
              color: color,
              fontSize: "0.8rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {data.titulo}
          </p>
          <p
            style={{
              margin: 0,
              color: PALETTE.textMain,
              fontSize: "0.7rem",
              lineHeight: 1.45,
              fontWeight: 400,
            }}
          >
            {data.descripcion}
          </p>
        </div>
      )}
    </span>
  );
};

export default Tooltip;
