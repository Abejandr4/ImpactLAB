// src/components/Impacto/Tooltip.jsx
//
// Tooltip con ícono ⓘ tap-to-toggle (también funciona con hover en desktop).
//
// IMPORTANTE: la burbuja se renderiza vía React Portal directo en document.body
// para evitar que el overflow del sidebar la recorte. La posición se calcula
// dinámicamente leyendo el getBoundingClientRect del ícono.
 
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { TOOLTIPS } from "../../utils/tooltips";
import { PALETTE } from "../../utils/categorias";
 
const TOOLTIP_WIDTH = 240;
const TOOLTIP_OFFSET = 10; // px entre el ícono y la burbuja
 
const Tooltip = ({ tooltipId, abierto, onToggle, accent }) => {
  const data = TOOLTIPS[tooltipId];
  const iconRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
 
  // Calcular posición de la burbuja cuando se abre o se hace scroll/resize
  useEffect(() => {
    if (!abierto || !iconRef.current) return;
 
    const updatePos = () => {
      const rect = iconRef.current?.getBoundingClientRect();
      if (!rect) return;
 
      const iconCenterX = rect.left + rect.width / 2;
      const iconBottomY = rect.bottom;
 
      // Centrar burbuja bajo el ícono
      let left = iconCenterX - TOOLTIP_WIDTH / 2;
 
      // Clamp para que no se salga del viewport (8px de margen)
      const minLeft = 8;
      const maxLeft = window.innerWidth - TOOLTIP_WIDTH - 8;
      left = Math.max(minLeft, Math.min(left, maxLeft));
 
      setPos({
        top: iconBottomY + TOOLTIP_OFFSET,
        left,
      });
    };
 
    updatePos();
    // capture:true — escucha scrolls anidados (como el del <aside>)
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [abierto]);
 
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
      <button
        ref={iconRef}
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
 
      {/* Burbuja vía Portal: vive en document.body, fuera del overflow del sidebar */}
      {abierto &&
        ReactDOM.createPortal(
          <div
            data-tooltip="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
              width: TOOLTIP_WIDTH,
              padding: "0.7rem 0.85rem",
              borderRadius: 10,
              background: "rgba(15,15,15,0.98)",
              border: `1px solid ${color}55`,
              boxShadow: `0 8px 24px rgba(0,0,0,0.6), 0 0 16px ${color}22`,
              backdropFilter: "blur(8px)",
              textTransform: "none",
              letterSpacing: "normal",
              pointerEvents: "auto",
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
          </div>,
          document.body
        )}
    </span>
  );
};
 
export default Tooltip;
 