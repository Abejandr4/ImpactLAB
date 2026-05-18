// src/utils/categorias.js
//
// Paleta de colores del sitio y configuración de las categorías del simulador.
// Centralizado aquí para que cualquier componente (mapa, sidebar, vulnerabilidad)
// los importe sin depender del archivo grande de la pantalla.

// =====================================================================
// PALETA DEL SITIO  (negro puro + acentos)
// =====================================================================
export const PALETTE = {
  bg: "#000000",
  card: "rgba(255,255,255,0.04)",
  // card más oscura estilo "Prepara tu asteroide" (contenedores internos)
  cardDeep: "#0a0a0a",
  cardBorder: "rgba(255,255,255,0.09)",
  textMain: "rgba(255,255,255,0.85)",
  textSec: "rgba(255,255,255,0.45)",
  textFaint: "rgba(255,255,255,0.25)",
};

// =====================================================================
// CONFIGURACIÓN DE CATEGORÍAS
// =====================================================================
// Orden y colores según boceto del simulador.
//   - "crater" usa un café/marrón propio
//   - el resto usa los acentos de la paleta del sitio
//
// Cada categoría incluye `radioKey`: nombre del campo en affectedData de
// donde sale su radio máximo (en km). Útil para que el mapa y el slider
// sepan qué radio dibujar sin un switch hardcodeado.
//
// "vulnerabilidad" no tiene radioKey porque agrupa a todas las demás
// (dibuja múltiples círculos en el mapa).
// =====================================================================
export const CATEGORIES = [
  {
    id: "crater",
    label: "Cráter",
    hex: "#a16207", // café / marrón
    glow: "rgba(161,98,7,0.35)",
    radioKey: "craterRadius_km",
  },
  {
    id: "termica",
    label: "Radiación térmica",
    hex: "#f59e0b", // ámbar
    glow: "rgba(245,158,11,0.35)",
    radioKey: "thermalRadius_km",
  },
  {
    id: "onda",
    label: "Onda de choque",
    hex: "#06b6d4", // cyan
    glow: "rgba(6,182,212,0.35)",
    radioKey: "blastRadius_km",
  },
  {
    id: "sismo",
    label: "Sismo",
    hex: "#a855f7", // violeta
    glow: "rgba(168,85,247,0.35)",
    radioKey: "seismicRadius_km",
  },
  {
    id: "ejecta",
    label: "Eyecta",
    hex: "#6366f1", // índigo
    glow: "rgba(99,102,241,0.35)",
    radioKey: "ejectaRadius_km",
  },
  {
    id: "vulnerabilidad",
    label: "Pérdidas",
    hex: "#10b981", // verde
    glow: "rgba(16,185,129,0.35)",
    radioKey: null, // agrupador
  },
];

/**
 * Helper para encontrar una categoría por id sin repetir .find() por toda la app.
 */
export function getCategoria(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}
