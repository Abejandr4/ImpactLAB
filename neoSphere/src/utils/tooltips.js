// src/utils/tooltips.js
//
// Diccionario plano de descripciones breves para niños (10-12 años).
// Lenguaje conversacional, máximo 2 frases por descripcion.
//
// Estructura: { id: { titulo, descripcion } }
//
// Convención de IDs:
//   - "cat.<categoria>"    -> tooltip para el header del acordeón
//   - "<categoria>.<param>" -> tooltip para un parámetro específico
//
// Si un parámetro no tiene tooltip, simplemente no se incluye aquí.
// El componente <Parametro> lo detecta y omite el ícono ⓘ.

export const TOOLTIPS = {
  // ---------- HEADERS DE CATEGORÍAS ----------
  "cat.crater": {
    titulo: "Cráter",
    descripcion:
      "El hoyo gigante que deja el asteroide al chocar con el suelo. Su tamaño depende de la velocidad y del tamaño del asteroide.",
  },
  "cat.termica": {
    titulo: "Radiación térmica",
    descripcion:
      "El calor que sale del impacto, como un sol mini que brilla unos segundos. Puede quemar todo lo que esté cerca.",
  },
  "cat.onda": {
    titulo: "Onda de choque",
    descripcion:
      "Una ola de aire muy fuerte que sale del impacto a la velocidad del sonido. Rompe ventanas, paredes y árboles.",
  },
  "cat.sismo": {
    titulo: "Sismo",
    descripcion:
      "El golpe del impacto hace temblar la tierra, como un terremoto. Mientras más lejos, menos se siente.",
  },
  "cat.eyecta": {
    titulo: "Eyecta",
    descripcion:
      "Los pedazos de roca que el impacto lanza al aire. Caen lejos del cráter como una lluvia de piedras.",
  },
  "cat.vulnerabilidad": {
    titulo: "Personas afectadas",
    descripcion:
      "Aquí ves cuántas personas y casas podrían resultar afectadas por todos los efectos juntos.",
  },

  // ---------- CRÁTER ----------
  "crater.diametro": {
    titulo: "Diámetro final",
    descripcion:
      "Qué tan ancho queda el cráter después del impacto. Se mide de un borde al otro.",
  },
  "crater.profundidad": {
    titulo: "Profundidad",
    descripcion:
      "Qué tan hondo es el cráter, desde el borde hasta el fondo.",
  },
  "crater.tipo": {
    titulo: "Tipo de cráter",
    descripcion:
      "Los cráteres pequeños son simples, como un tazón. Los grandes son complejos: tienen un montículo en el centro y bordes en anillos.",
  },
  "crater.volumenFundido": {
    titulo: "Roca derretida",
    descripcion:
      "El impacto es tan violento que derrite la roca del suelo. Aquí ves cuánta roca queda convertida en lava al fondo del cráter.",
  },

  // ---------- TÉRMICA ----------
  "termica.exposicion": {
    titulo: "Exposición térmica",
    descripcion:
      "Cuánto calor recibe cada metro cuadrado de superficie a tu distancia. Mientras más, más cosas se queman.",
  },
  "termica.bolaDeFuego": {
    titulo: "Bola de fuego",
    descripcion:
      "Una esfera gigante de gas y polvo a miles de grados que aparece después del impacto. Quema todo dentro de su radio.",
  },
  "termica.duracion": {
    titulo: "Duración del calor",
    descripcion:
      "Cuántos segundos sigue brillando la bola de fuego mientras quema lo que está cerca.",
  },
  "termica.horizonte": {
    titulo: "Visible sobre el horizonte",
    descripcion:
      "Si estás muy lejos, la curvatura de la Tierra esconde parte de la bola de fuego. Aquí ves qué tanto se alcanza a ver.",
  },
  "termica.ignicion": {
    titulo: "Qué se quema",
    descripcion:
      "Lista de materiales que se prenden en llamas a tu distancia. Los más fáciles de quemar son el pasto y el papel; los más difíciles, la madera gruesa.",
  },

  // ---------- ONDA DE CHOQUE ----------
  "onda.sobrepresion": {
    titulo: "Sobrepresión",
    descripcion:
      "La fuerza extra del aire al pasar la onda de choque. Mientras más alta, más cosas aplasta y rompe.",
  },
  "onda.viento": {
    titulo: "Velocidad del viento",
    descripcion:
      "Qué tan rápido sopla el viento que genera la onda de choque al pasar. Puede ser más fuerte que un huracán.",
  },
  "onda.tiempoLlegada": {
    titulo: "Tiempo de llegada",
    descripcion:
      "Cuánto tarda la onda de choque en llegar desde el impacto hasta tu posición. Viaja a la velocidad del sonido.",
  },
  "onda.dano": {
    titulo: "Daño estructural",
    descripcion:
      "Qué se rompe a tu distancia: desde ventanas hasta casas enteras, según qué tan fuerte sea la onda.",
  },

  // ---------- SISMO ----------
  "sismo.richter": {
    titulo: "Magnitud Richter",
    descripcion:
      "Mide qué tan fuerte tiembla la Tierra en el lugar del impacto. Cada número entero es como 32 veces más fuerte que el anterior.",
  },
  "sismo.mercalli": {
    titulo: "Escala Mercalli",
    descripcion:
      "Describe los daños que sientes y ves: desde apenas se mueve la lámpara hasta destrucción casi total. Va de I a XII.",
  },
  "sismo.efectiva": {
    titulo: "Magnitud atenuada",
    descripcion:
      "La magnitud real que sientes a tu distancia. Mientras más lejos del impacto, menos tiembla.",
  },
  "sismo.tiempoLlegada": {
    titulo: "Tiempo de llegada",
    descripcion:
      "Cuánto tardan las ondas sísmicas en llegar desde el impacto hasta tu posición. Viajan a unos 5 km cada segundo.",
  },
  "sismo.geologia": {
    titulo: "Geología del impacto",
    descripcion:
      "El tipo de suelo cambia cómo se siente el temblor. La roca dura transmite mejor las ondas que la tierra blanda.",
  },

  // ---------- EYECTA ----------
  "eyecta.grosor": {
    titulo: "Grosor de capa",
    descripcion:
      "Qué tan gruesa es la capa de roca y polvo que cae a tu distancia. Si es muy gruesa, puede tirar techos.",
  },
  "eyecta.fragmento": {
    titulo: "Tamaño de fragmentos",
    descripcion:
      "El tamaño promedio de las rocas que caen del cielo a tu distancia. Mientras más cerca del cráter, más grandes.",
  },
  "eyecta.alcanceMaximo": {
    titulo: "Alcance máximo",
    descripcion:
      "La distancia más lejana hasta donde llegan los pedazos de roca lanzados por el impacto.",
  },
  "eyecta.tiempoLlegada": {
    titulo: "Tiempo de llegada",
    descripcion:
      "Cuánto tardan los pedazos de roca en caer del cielo en tu posición. Vuelan en arco como una pelota lanzada al aire.",
  },

  // ---------- VULNERABILIDAD ----------
  "vulnerabilidad.combinada": {
    titulo: "Víctimas combinadas",
    descripcion:
      "El total de personas afectadas considerando todos los efectos juntos. No se cuenta dos veces a la misma persona.",
  },
  "vulnerabilidad.escenarios": {
    titulo: "Optimista / Esperado / Pesimista",
    descripcion:
      "Tres formas de imaginar el desastre: si todos están bien protegidos, lo más probable, o si nadie está protegido.",
  },
  "vulnerabilidad.poblacion": {
    titulo: "Población afectada",
    descripcion:
      "Cuántas personas viven dentro del radio donde el efecto puede causar daño.",
  },
  "vulnerabilidad.viviendas": {
    titulo: "Viviendas afectadas",
    descripcion:
      "Cuántas casas y edificios hay dentro del radio del efecto.",
  },
  "vulnerabilidad.radioMaximo": {
    titulo: "Radio máximo",
    descripcion:
      "Hasta dónde llega el efecto con suficiente fuerza para causar daño serio.",
  },
  "global.energia": {
    titulo: "Megatones (MT)",
    descripcion:
      "Unidad para medir explosiones gigantes. 1 megatón equivale a un millón de toneladas de dinamita explotando al mismo tiempo.",
  },
};

/**
 * Helper opcional: devuelve null si el id no existe en lugar de undefined.
 * Útil para condicionar render del ícono ⓘ.
 */
export function getTooltip(id) {
  return TOOLTIPS[id] || null;
}
