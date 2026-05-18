// src/components/Impacto/Tooltip.jsx
//
// Tooltip con ícono ⓘ tap-to-toggle (también funciona con hover en desktop).
//
// El estado de "qué tooltip está abierto" NO vive aquí, vive en el padre
// (impacto.jsx) para garantizar que solo uno esté abierto a la vez.

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
      data-tooltip="true"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        marginLeft: 4,
        lineHeight: 0,
      }}
    >
      {/* --- Ícono ⓘ --- */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        onMouseEnter={() => {
          if (!abierto) onToggle();
        }}
        onMouseLeave={() => {
          if (abierto) onToggle();
        }}
        aria-label={`Más información sobre ${data.titulo}`}
        style={{
          width: 16,
          height: 16,
          padding: 0,
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
 
      {/* --- Burbuja: solo descripción, sin título, en capitalización normal --- */}
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
            padding: "0.7rem 0.85rem",
            borderRadius: 10,
            background: "rgba(15,15,15,0.98)",
            border: `1px solid ${color}55`,
            boxShadow: `0 8px 24px rgba(0,0,0,0.6), 0 0 16px ${color}22`,
            backdropFilter: "blur(8px)",
            textTransform: "none",
            letterSpacing: "normal",
          }}
        >
          <p
            style={{
              margin: 0,
              color: PALETTE.textMain,
              fontSize: "0.82rem",
              lineHeight: 1.45,
              fontWeight: 400,
              textTransform: "none",
              letterSpacing: "normal",
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