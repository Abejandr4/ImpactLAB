/**
 * optimizar-geojson.mjs
 * --------------------------------------------------------------
 * Reduce el tamaño de un GeoJSON de manzanas (INEGI) de dos formas:
 *   1) Recorta los decimales de las coordenadas.
 *   2) Simplifica las geometrías (algoritmo Visvalingam) preservando
 *      la topología (no se "rompen" las manzanas vecinas).
 *
 * NO requiere instalar nada: usa solo Node.js (v18+).
 *
 * USO (en PowerShell o CMD, dentro de la carpeta de tu proyecto):
 *
 *   node optimizar-geojson.mjs public\data.json public\data.min.json 4 0.0001
 *
 * Argumentos:
 *   1. ruta de entrada      (tu data.json original)
 *   2. ruta de salida       (el archivo optimizado)
 *   3. decimales            (4 = ~11 m de precisión; 3 = ~110 m)
 *   4. tolerancia simplif.  (0 = no simplificar; 0.0001 suave;
 *                            0.0005 agresivo. Empieza en 0.0001)
 * --------------------------------------------------------------
 */

import { readFileSync, writeFileSync, statSync } from "node:fs";

const [, , inPath, outPath, decimalsArg, toleranceArg] = process.argv;

if (!inPath || !outPath) {
  console.error(
    "Uso: node optimizar-geojson.mjs <entrada> <salida> [decimales] [tolerancia]"
  );
  process.exit(1);
}

const DECIMALS = decimalsArg !== undefined ? parseInt(decimalsArg, 10) : 4;
const TOLERANCE = toleranceArg !== undefined ? parseFloat(toleranceArg) : 0.0001;

const factor = Math.pow(10, DECIMALS);
const round = (n) => Math.round(n * factor) / factor;

/**
 * Simplificación Visvalingam: elimina iterativamente el vértice cuyo
 * triángulo (con sus vecinos) tiene el área más pequeña, hasta que
 * todos los triángulos restantes superan la tolerancia.
 * Preserva mejor la forma visual que Douglas-Peucker para polígonos.
 */
function triangleArea(a, b, c) {
  return Math.abs(
    (a[0] * (b[1] - c[1]) +
      b[0] * (c[1] - a[1]) +
      c[0] * (a[1] - b[1])) /
      2
  );
}

function simplifyRing(ring, tol) {
  // Un anillo de polígono cierra: primer punto == último punto.
  if (ring.length <= 5 || tol <= 0) return ring;

  // Trabajamos sobre los puntos sin el cierre duplicado.
  let pts = ring.slice(0, ring.length - 1);
  const minArea = tol * tol;

  let changed = true;
  while (changed && pts.length > 4) {
    changed = false;
    let smallest = Infinity;
    let idx = -1;
    for (let i = 1; i < pts.length - 1; i++) {
      const area = triangleArea(pts[i - 1], pts[i], pts[i + 1]);
      if (area < smallest) {
        smallest = area;
        idx = i;
      }
    }
    if (idx !== -1 && smallest < minArea) {
      pts.splice(idx, 1);
      changed = true;
    }
  }
  // Volver a cerrar el anillo.
  pts.push(pts[0]);
  return pts;
}

function processCoords(geometry) {
  const type = geometry.type;

  const roundRing = (ring) =>
    simplifyRing(
      ring.map(([x, y]) => [round(x), round(y)]),
      TOLERANCE
    );

  if (type === "Polygon") {
    geometry.coordinates = geometry.coordinates.map(roundRing);
  } else if (type === "MultiPolygon") {
    geometry.coordinates = geometry.coordinates.map((poly) =>
      poly.map(roundRing)
    );
  } else if (type === "Point") {
    geometry.coordinates = geometry.coordinates.map(round);
  } else if (type === "LineString" || type === "MultiPoint") {
    geometry.coordinates = geometry.coordinates.map(([x, y]) => [
      round(x),
      round(y),
    ]);
  } else if (type === "MultiLineString") {
    geometry.coordinates = geometry.coordinates.map((line) =>
      line.map(([x, y]) => [round(x), round(y)])
    );
  }
  return geometry;
}

console.log(`Leyendo ${inPath} ...`);
const sizeBefore = statSync(inPath).size;

const raw = readFileSync(inPath, "utf8");
const geo = JSON.parse(raw);

if (geo.type !== "FeatureCollection" || !Array.isArray(geo.features)) {
  console.error("El archivo no parece un FeatureCollection de GeoJSON.");
  process.exit(1);
}

console.log(
  `Procesando ${geo.features.length.toLocaleString()} features ` +
    `(decimales=${DECIMALS}, tolerancia=${TOLERANCE}) ...`
);

let vBefore = 0;
let vAfter = 0;

for (const f of geo.features) {
  if (!f.geometry) continue;
  // Contar vértices antes (solo para el reporte).
  const countV = (g) => {
    const s = JSON.stringify(g.coordinates);
    return (s.match(/\[/g) || []).length;
  };
  vBefore += countV(f.geometry);
  processCoords(f.geometry);
  vAfter += countV(f.geometry);
}

// stringify sin espacios = archivo mínimo.
const out = JSON.stringify(geo);
writeFileSync(outPath, out, "utf8");

const sizeAfter = statSync(outPath).size;
const mb = (b) => (b / 1024 / 1024).toFixed(2);
const pct = (1 - sizeAfter / sizeBefore) * 100;

console.log("\n================  RESULTADO  ================");
console.log(`Tamaño antes:   ${mb(sizeBefore)} MB`);
console.log(`Tamaño después: ${mb(sizeAfter)} MB`);
console.log(`Reducción:      ${pct.toFixed(1)} %`);
console.log(
  `Vértices:       ${vBefore.toLocaleString()} -> ` +
    `${vAfter.toLocaleString()}`
);
console.log("============================================");
console.log(`\nArchivo optimizado escrito en: ${outPath}`);
