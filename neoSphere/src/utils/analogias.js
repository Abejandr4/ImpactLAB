// src/utils/analogias.js
//
// Cada función recibe un valor numérico (en su unidad indicada) y devuelve
// un string con una analogía pensada para niños de 10-12 años.
//
// Si el valor cae fuera de todos los rangos, devuelve "" (vacío) y el
// componente que la consume debe omitir la línea de analogía.
//
// Convención: la analogía NO incluye el número exacto, solo la comparación.
// El número formateado lo muestra la UI por separado.
//
// === VALORES ESTRELLA (analogía siempre visible debajo del número) ===
//   - analogiaEnergia(megatones)
//   - analogiaCrater(diametro_metros)
//   - analogiaSismo(richter)
//   - analogiaVictimas(numero_personas)
//   - analogiaGrosorCapa(metros)
//
// === ANALOGÍAS PARA TOOLTIP (uso secundario) ===
//   - analogiaViento(metros_por_segundo)
//   - analogiaTermica(joules_por_m2)
//   - analogiaPoblacion(numero_personas)

const safeNumber = (n) => (Number.isFinite(n) ? n : 0);

// ===========================================================================
// VALORES ESTRELLA
// ===========================================================================

/**
 * Energía total del impacto, en megatones de TNT.
 */
export function analogiaEnergia(megatones) {
  const mt = safeNumber(megatones);
  if (mt <= 0) return "";

  if (mt < 0.001) return "Como un edificio derrumbándose";
  if (mt < 0.05) return "Como la bomba de Hiroshima";
  if (mt < 1) return "Como un volcán pequeño en erupción";
  if (mt < 50) return "Como mil bombas de Hiroshima juntas";
  if (mt < 500) return "Más que todas las bombas que existen en el mundo";
  if (mt < 50_000) return "Como el volcán Krakatoa explotando";
  return "Como el asteroide que extinguió a los dinosaurios";
}

/**
 * Diámetro del cráter, en metros.
 * Usa la cancha de fútbol (~100 m) como referencia base.
 */
export function analogiaCrater(diametroMetros) {
  const d = safeNumber(diametroMetros);
  if (d <= 0) return "";

  if (d < 50) return "Cabe una piscina olímpica adentro";
  if (d < 150) return "Como una cancha de fútbol entera";
  if (d < 1000) {
    const canchas = Math.round(d / 100);
    return `Como ${canchas} canchas de fútbol juntas`;
  }
  if (d < 5000) return "Cabría un parque temático adentro";
  if (d < 20_000) return "Cabe una ciudad pequeña adentro";
  if (d < 100_000) return "Más grande que el aeropuerto más grande del mundo";
  return "Visible desde el espacio a simple vista";
}

/**
 * Magnitud sísmica en escala Richter (epicentro).
 * Referencias locales: sismo del 19S (M 7.1) y volcán Popocatépetl.
 */
export function analogiaSismo(richter) {
  const m = safeNumber(richter);
  if (m <= 0) return "";

  if (m < 3) return "Apenas se siente, como un camión pasando";
  if (m < 5) return "Tiembla la lámpara, pero nada se rompe";
  if (m < 6) return "Como un sismo normal de Puebla";
  if (m < 7) return "Como el sismo del 19 de septiembre";
  if (m < 8) return "De los más fuertes que se han sentido en México";
  if (m < 9) return "Como los grandes terremotos de Chile o Japón";
  return "Como el peor terremoto registrado en la historia";
}

/**
 * Número combinado de víctimas (escenario esperado).
 * Tono cuidadoso: referencias a tamaño de población, no a entretenimiento.
 * Estadio Cuauhtémoc (Puebla): ~51,000.
 * Estado de Puebla: ~6.5 millones.
 */
export function analogiaVictimas(numero) {
  const n = safeNumber(numero);
  if (n < 1) return "";

  if (n < 100) return "Como las personas de un salón de clases grande";
  if (n < 1000) return "Como las personas de una escuela completa";
  if (n < 10_000) return "Como las personas de un pueblo pequeño";
  if (n < 100_000) return "Como un estadio Cuauhtémoc lleno";
  if (n < 1_000_000) return "Como toda la gente de una ciudad mediana";
  if (n < 10_000_000) return "Como toda la población del estado de Puebla";
  return "Como muchísimas ciudades enteras juntas";
}

/**
 * Grosor de capa de eyecta (manto rocoso que cae del cielo), en metros.
 * El umbral letal típico es ~0.2 m (techos colapsan).
 */
export function analogiaGrosorCapa(metros) {
  const t = safeNumber(metros);
  if (t <= 0) return "";

  if (t < 0.005) return "Una capa de polvo, como pasar el dedo por un mueble";
  if (t < 0.05) return "Como una capa de nieve ligera en el piso";
  if (t < 0.2) return "Llega al tobillo, como pisar mucha arena";
  if (t < 1) return "Llega a la rodilla, tira techos ligeros";
  if (t < 5) return "Llega arriba de tu cabeza, sepulta casas pequeñas";
  return "Más alto que un edificio, entierra todo";
}

// ===========================================================================
// ANALOGÍAS PARA TOOLTIP (secundarias)
// ===========================================================================

/**
 * Velocidad del viento generado por la onda de choque, en m/s.
 * Referencias: tormenta tropical (~20), huracán cat 3 (~50), velocidad
 * del sonido (~340).
 */
export function analogiaViento(ms) {
  const v = safeNumber(ms);
  if (v <= 0) return "";

  if (v < 15) return "Un viento normal de día con aire";
  if (v < 30) return "Un viento fuerte de tormenta";
  if (v < 50) return "Como un huracán categoría 3";
  if (v < 80) return "Más rápido que un auto en carretera";
  if (v < 200) return "Más rápido que un tren bala";
  if (v < 340) return "Casi tan rápido como el sonido";
  return "Más rápido que el sonido";
}

/**
 * Exposición térmica en J/m².
 * Referencias [C2005]: 1.3e5 = quemaduras 1°, 2.5e5 = quemaduras 2°,
 * 4.2e5 = quemaduras 3°, 1.0e6 = ropa se prende.
 */
export function analogiaTermica(joulesPorM2) {
  const j = safeNumber(joulesPorM2);
  if (j <= 0) return "";

  if (j < 1e4) return "Como pararte cerca de una fogata";
  if (j < 1e5) return "Como abrir un horno caliente en la cara";
  if (j < 5e5) return "Suficiente para quemar tu piel en segundos";
  if (j < 2e6) return "Tu ropa se prendería en llamas al instante";
  return "Como estar dentro de un horno industrial";
}

/**
 * Cantidad de personas (para población expuesta en un radio).
 * Más neutral que `analogiaVictimas` — sin mencionar muerte.
 */
export function analogiaPoblacion(numero) {
  const n = safeNumber(numero);
  if (n < 1) return "";

  if (n < 100) return "Como las personas de un salón grande";
  if (n < 1000) return "Como una escuela entera";
  if (n < 10_000) return "Como un estadio pequeño lleno";
  if (n < 100_000) return "Como un estadio Cuauhtémoc lleno";
  if (n < 1_000_000) return "Como toda la gente de Heroica Puebla centro";
  if (n < 10_000_000) return "Como todo el estado de Puebla";
  return "Como varios estados de México juntos";
}
