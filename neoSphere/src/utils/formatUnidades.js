// src/utils/formatUnidades.js
//
// Auto-escalado de unidades para el simulador de impacto.
// Cada función recibe un valor numérico en su unidad BASE y devuelve:
//   { value: number, unit: string, display: string }
//
// Regla común de decimales:
//   - 2 decimales si el valor formateado es < 10
//   - 1 decimal si es < 100
//   - 0 decimales si es >= 100
//
// Todas las funciones manejan valores no finitos (NaN, Infinity, null) devolviendo
// un objeto consistente con value=0 para no romper la UI.

const safeNumber = (n) => (Number.isFinite(n) ? n : 0);

/**
 * Aplica la regla común de decimales a un número.
 */
const formatDecimals = (n) => {
  const abs = Math.abs(n);
  if (abs < 10) return n.toFixed(2);
  if (abs < 100) return n.toFixed(1);
  return Math.round(n).toString();
};

const make = (value, unit) => ({
  value,
  unit,
  display: `${formatDecimals(value)} ${unit}`,
});

// ---------------------------------------------------------------------------
// LONGITUD (entrada en metros)
// ---------------------------------------------------------------------------
// Escalas: mm  |  cm  |  m  |  km
//   < 0.01 m   -> mm
//   < 1 m      -> cm
//   < 1000 m   -> m
//   >= 1000 m  -> km
export function formatLongitud(metros) {
  const m = safeNumber(metros);
  const abs = Math.abs(m);

  if (abs < 0.01) return make(m * 1000, "mm");
  if (abs < 1) return make(m * 100, "cm");
  if (abs < 1000) return make(m, "m");
  return make(m / 1000, "km");
}

// ---------------------------------------------------------------------------
// ENERGÍA (entrada en megatones de TNT)
// ---------------------------------------------------------------------------
// Escalas: t TNT  |  kT  |  MT  |  GT
//   < 0.001 MT (< 1 kT)   -> toneladas de TNT
//   < 1 MT                -> kT (kilotones)
//   < 1000 MT             -> MT (megatones)
//   >= 1000 MT            -> GT (gigatones)
export function formatEnergia(megatones) {
  const mt = safeNumber(megatones);
  const abs = Math.abs(mt);

  if (abs < 0.001) return make(mt * 1_000_000, "t TNT");
  if (abs < 1) return make(mt * 1000, "kT");
  if (abs < 1000) return make(mt, "MT");
  return make(mt / 1000, "GT");
}

// ---------------------------------------------------------------------------
// TIEMPO (entrada en segundos)
// ---------------------------------------------------------------------------
// Escalas: s  |  min y s  |  h y min
//   < 60 s    -> "X s"
//   < 3600 s  -> "X min Y s"
//   >= 3600 s -> "X h Y min"
// Este formato es compuesto, por lo que `value` es el total en segundos y
// `display` es la cadena legible.
export function formatTiempo(segundos) {
  const s = safeNumber(segundos);
  const abs = Math.abs(s);

  if (abs < 60) {
    return {
      value: s,
      unit: "s",
      display: `${formatDecimals(s)} s`,
    };
  }

  if (abs < 3600) {
    const min = Math.floor(s / 60);
    const restoS = Math.round(s - min * 60);
    return {
      value: s,
      unit: "min",
      display: restoS === 0 ? `${min} min` : `${min} min ${restoS} s`,
    };
  }

  const h = Math.floor(s / 3600);
  const restoMin = Math.round((s - h * 3600) / 60);
  return {
    value: s,
    unit: "h",
    display: restoMin === 0 ? `${h} h` : `${h} h ${restoMin} min`,
  };
}

// ---------------------------------------------------------------------------
// VOLUMEN (entrada en metros cúbicos)
// ---------------------------------------------------------------------------
// Escalas: L  |  m³  |  km³
//   < 1 m³           -> L (litros, 1 m³ = 1000 L)
//   < 1_000_000 m³   -> m³
//   >= 1_000_000 m³  -> km³ (1 km³ = 1e9 m³)
export function formatVolumen(m3) {
  const v = safeNumber(m3);
  const abs = Math.abs(v);

  if (abs < 1) return make(v * 1000, "L");
  if (abs < 1_000_000) return make(v, "m³");
  return make(v / 1e9, "km³");
}

// ---------------------------------------------------------------------------
// PRESIÓN (entrada en Pascales)
// ---------------------------------------------------------------------------
// Escalas: Pa  |  kPa  |  MPa
//   < 1000 Pa        -> Pa
//   < 1_000_000 Pa   -> kPa
//   >= 1_000_000 Pa  -> MPa
export function formatPresion(pascales) {
  const p = safeNumber(pascales);
  const abs = Math.abs(p);

  if (abs < 1000) return make(p, "Pa");
  if (abs < 1_000_000) return make(p / 1000, "kPa");
  return make(p / 1_000_000, "MPa");
}

// ---------------------------------------------------------------------------
// NÚMEROS GRANDES (población, viviendas)
// ---------------------------------------------------------------------------
// Para niños: "12.4 mil" en lugar de "12,400". Mantiene unidad en español.
//   < 1000              -> número directo (sin sufijo)
//   < 1_000_000         -> "X mil"
//   < 1_000_000_000     -> "X millones"
//   >= 1_000_000_000    -> "X mil millones"
export function formatNumero(n) {
  const num = safeNumber(n);
  const abs = Math.abs(num);

  if (abs < 1000) {
    return {
      value: num,
      unit: "",
      display: Math.round(num).toString(),
    };
  }

  if (abs < 1_000_000) {
    const v = num / 1000;
    return {
      value: v,
      unit: "mil",
      display: `${formatDecimals(v)} mil`,
    };
  }

  if (abs < 1_000_000_000) {
    const v = num / 1_000_000;
    return {
      value: v,
      unit: "millones",
      display: `${formatDecimals(v)} ${v === 1 ? "millón" : "millones"}`,
    };
  }

  const v = num / 1_000_000_000;
  return {
    value: v,
    unit: "mil millones",
    display: `${formatDecimals(v)} mil millones`,
  };
}
