import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, ChevronDown, ChevronUp, Trophy, Zap } from "lucide-react";
import confetti from "canvas-confetti";
import { MiniQuiz, type QuizQuestion } from "./Explora/MiniQuiz";
import { AsteroidTypeExplorer } from "./Explora/AsteroidTypeExplorer";
import { SpotAsteroidGame } from "./Explora/SpotAsteroidGame";
import { NEOOrbits } from "./Explora/NEOOrbits";
import { DefenseStrategy } from "./Explora/DefenseStrategy";

// ─── Images ────────────────────────────────────────────────────────────────
const asteroidImg = "https://ciencia.nasa.gov/wp-content/uploads/sites/2/2023/06/921_683_bennu_carousel_5-jpg.webp?resize=1200,900";
const earthImg = "https://images-assets.nasa.gov/image/PIA22970/PIA22970~orig.jpg";
const radarImg = "https://images-assets.nasa.gov/image/PIA26711/PIA26711~medium.jpg";
const historyImg = "https://images-assets.nasa.gov/image/ACD17-0168-009/ACD17-0168-009~medium.jpg"
const dinoImg = "https://images-assets.nasa.gov/image/jsc2008e027179/jsc2008e027179~medium.jpg";
const barringerImg = "https://images-assets.nasa.gov/image/PIA03212/PIA03212~orig.jpg"
const ceresImg = "https://images-assets.nasa.gov/image/PIA17650/PIA17650~medium.jpg"
const tunguskaImg = "https://www.clarin.com/img/2018/08/17/SkUa3KNUm_720x0__1.jpg"
const chelyabinskImg = "https://images-assets.nasa.gov/image/PIA16828/PIA16828~small.jpg"
const dartImg = "https://images-assets.nasa.gov/image/PIA25329/PIA25329~medium.jpg"
const solarImg = "https://images-assets.nasa.gov/image/NHQ202111230012/NHQ202111230012~medium.jpg";

// ─── Quiz data ──────────────────────────────────────────────────────────────
const quizzes: Record<string, QuizQuestion[]> = {
  asteroids: [
    {
      question: "¿Cuántos asteroides conocidos existen en el Sistema Solar?",
      options: ["Unos 1,000", "Más de 1.3 millones", "Exactamente 50,000", "Solo 200"],
      correct: 1,
      explanation: "¡Correcto! Se conocen más de 1.3 millones de asteroides, y cada año se descubren miles más con telescopios automatizados.",
    },
    {
      question: "¿Cómo se llama el asteroide más grande del Cinturón Principal?",
      options: ["Apophis", "Bennu", "Ceres", "Eros"],
      correct: 2,
      explanation: "Ceres mide ~940 km de diámetro y es tan grande que se clasifica como planeta enano. Fue descubierto en 1801 por Giuseppe Piazzi.",
    },
    {
      question: "¿Entre qué planetas se encuentra el Cinturón Principal de Asteroides?",
      options: ["Tierra y Marte", "Marte y Júpiter", "Júpiter y Saturno", "Venus y la Tierra"],
      correct: 1,
      explanation: "El Cinturón Principal está entre Marte y Júpiter. La enorme gravedad de Júpiter impidió que esos materiales se unieran para formar un planeta.",
    },
  ],
  neos: [
    {
      question: "¿Qué significa la sigla NEO?",
      options: [
        "Nuevo Espacio Orbital",
        "Objeto Cercano a la Tierra",
        "Núcleo de Energía Orbital",
        "Nave Exploradora Orbital",
      ],
      correct: 1,
      explanation: "NEO viene del inglés Near-Earth Object. Son asteroides o cometas cuya órbita se acerca a menos de 195 millones de km del Sol.",
    },
    {
      question: "¿Cuántos NEOs son conocidos actualmente?",
      options: ["Unos 500", "Más de 36,000", "Exactamente 1,000", "Más de 2 millones"],
      correct: 1,
      explanation: "Se conocen más de 36,000 NEOs y el número crece constantemente gracias a programas de vigilancia como Catalina Sky Survey y Pan-STARRS.",
    },
    {
      question: "¿Qué son los PHAs?",
      options: [
        "Un tipo de planeta enano",
        "Asteroides Potencialmente Peligrosos",
        "Una sonda espacial de la NASA",
        "Planetas fuera del Sistema Solar",
      ],
      correct: 1,
      explanation: "PHA significa Potentially Hazardous Asteroid. Son NEOs de más de 140 m que pasan a menos de 7.5 millones de km de la Tierra. ¡Hay más de 2,300 conocidos!",
    },
  ],
  detection: [
    {
      question: "¿Cómo diferencian los astrónomos un asteroide de una estrella en una foto?",
      options: [
        "Por su color rojo",
        "Porque los asteroides se mueven entre las fotos",
        "Por su tamaño grande",
        "Porque brillan más que las estrellas",
      ],
      correct: 1,
      explanation: "¡Exacto! Las estrellas parecen fijas, pero los asteroides se mueven. Comparando fotos del mismo cielo con horas de diferencia, los asteroides 'se desplazan' entre las estrellas.",
    },
    {
      question: "¿Qué programa descubre más NEOs en el mundo actualmente?",
      options: ["Telescopio Hubble", "Telescopio James Webb", "Catalina Sky Survey", "Observatorio de Arecibo"],
      correct: 2,
      explanation: "El Catalina Sky Survey opera desde Arizona (y Australia) y es el programa que más asteroides y cometas descubre en el mundo cada año.",
    },
    {
      question: "¿Cuántas observaciones mínimas se necesitan para calcular la órbita de un asteroide?",
      options: ["Solo 1", "Al menos 3", "Exactamente 100", "Más de 1,000"],
      correct: 1,
      explanation: "Con al menos 3 observaciones en momentos diferentes, los matemáticos pueden calcular la órbita completa aplicando las leyes de Kepler y Newton.",
    },
  ],
  history: [
    {
      question: "¿Hace cuántos años impactó el asteroide que causó la extinción de los dinosaurios?",
      options: ["Hace 1 millón de años", "Hace 66 millones de años", "Hace 500,000 años", "Hace 10 millones de años"],
      correct: 1,
      explanation: "El impacto de Chicxulub ocurrió hace ~66 millones de años. Liberó la energía de 10 billones de bombas atómicas y extinguió al 75% de las especies del planeta.",
    },
    {
      question: "¿Dónde ocurrió el famoso evento de Tunguska en 1908?",
      options: ["Arizona, EE.UU.", "Canadá", "Siberia, Rusia", "Antártida"],
      correct: 2,
      explanation: "El evento de Tunguska ocurrió en Siberia, Rusia. Un asteroide de ~50 m explotó en el aire y arrasó 2,150 km² de bosque, derribando 80 millones de árboles.",
    },
    {
      question: "¿En qué año impactó el bólido de Chelyabinsk en Rusia?",
      options: ["2005", "2013", "2019", "2020"],
      correct: 1,
      explanation: "El 15 de febrero de 2013, un asteroide de ~20 m explotó sobre Chelyabinsk. La onda de choque rompió ventanas en 3 ciudades e hirió a más de 1,600 personas.",
    },
  ],
  science: [
    {
      question: "¿Qué misión demostró por primera vez que podemos desviar un asteroide?",
      options: ["Misión Apollo", "Misión DART (2022)", "Misión Voyager", "Misión Cassini"],
      correct: 1,
      explanation: "¡La misión DART de la NASA impactó contra el asteroide Dimorphos el 26 de septiembre de 2022 y cambió su órbita exitosamente! Fue la primera prueba real de defensa planetaria.",
    },
    {
      question: "¿En cuánto tiempo cambió DART la órbita del asteroide Dimorphos?",
      options: ["2 horas", "32 minutos", "5 días", "1 año"],
      correct: 1,
      explanation: "El impacto de DART redujo el período orbital de Dimorphos en exactamente 32 minutos (de 11h 55min a 11h 23min). ¡Un resultado mucho mejor de lo esperado!",
    },
    {
      question: "¿Cuál es el único desastre natural que los humanos podemos prevenir completamente?",
      options: ["Terremotos", "Huracanes", "Impacto de asteroide", "Erupciones volcánicas"],
      correct: 2,
      explanation: "Un impacto de asteroide es el único desastre natural que podemos prevenir al 100%, siempre y cuando lo detectemos con suficiente anticipación. ¡El tiempo es nuestro aliado!",
    },
  ],
};

// ─── Timeline data ──────────────────────────────────────────────────────────
const timelineEvents = [
  {
    year: "Hace 66 M años",
    icon: "🦕",
    color: "#ef4444",
    title: "Chicxulub — Extinción de los dinosaurios",
    desc: "Un asteroide de ~10 km impactó en el Golfo de México. Liberó más energía que todas las armas nucleares del mundo juntas ×10,000. Extinguió al 75% de las especies.",
    energy: "100,000,000 megatones",
    size: "Como la Ciudad de México de ancho",
    img: dinoImg,
  },
  {
    year: "Hace 50,000 años",
    icon: "🏜️",
    color: "#f97316",
    title: "Cráter del Meteoro, Arizona",
    desc: "Un meteorito metálico de ~50 m formó el famoso Barringer Crater en Arizona. Tiene 1.2 km de diámetro y 170 m de profundidad. ¡Hoy es una atracción turística!",
    energy: "10 megatones",
    size: "Como un edificio de 17 pisos de profundidad",
    img: barringerImg,
  },
  {
    year: "1801",
    icon: "🔭",
    color: "#a78bfa",
    title: "Descubrimiento de Ceres",
    desc: "El astrónomo italiano Giuseppe Piazzi descubrió Ceres desde Palermo. Al principio lo llamó planeta, pero era demasiado pequeño. ¡Primer asteroide de la historia!",
    energy: "—",
    size: "940 km de diámetro",
    img: ceresImg,
  },
  {
    year: "1908",
    icon: "🌲",
    color: "#fbbf24",
    title: "Evento de Tunguska",
    desc: "Un asteroide de ~50 m explotó sobre Siberia sin llegar al suelo. Arrasó 2,150 km² de bosque y derribó 80 millones de árboles. Por suerte era una zona deshabitada.",
    energy: "12-15 megatones",
    size: "Como una ciudad mediana destruida",
    img: tunguskaImg,
  },
  {
    year: "2013",
    icon: "💥",
    color: "#60a5fa",
    title: "Bólido de Chelyabinsk",
    desc: "Un asteroide de 20 m entró a la atmósfera sobre Rusia. Su onda de choque rompió vidrios en 3 ciudades e hirió a 1,600 personas. ¡Fue grabado por miles de dashcams!",
    energy: "400-500 kilotoneladas",
    size: "Como un edificio de 6 pisos",
    img: chelyabinskImg,
  },
  {
    year: "2022",
    icon: "🎯",
    color: "#4ade80",
    title: "Misión DART — ¡Primer desvío exitoso!",
    desc: "La NASA impactó la nave DART contra el asteroide Dimorphos (170 m). ¡Cambió su órbita 32 minutos! Primera prueba exitosa de defensa planetaria en la historia.",
    energy: "—",
    size: "¡Historia hecha por la humanidad!",
    img: dartImg,
  },
];

// ─── Helper components ──────────────────────────────────────────────────────
function FunFact({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{emoji}</span>
      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

function InfoBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${color}33` }}>
      <div style={{ color, fontWeight: 800, fontSize: "1.05rem" }}>{value}</div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.68rem", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function StepReveal({ steps }: { steps: { icon: string; title: string; desc: string }[] }) {
  const [revealed, setRevealed] = useState(0);
  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{
            opacity: i <= revealed ? 1 : 0.3,
            x: i <= revealed ? 0 : 10,
          }}
          className="flex gap-3 p-3 rounded-xl cursor-pointer"
          style={{
            background: i <= revealed ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${i <= revealed ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.08)"}`,
          }}
          onClick={() => setRevealed(i)}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: i <= revealed ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.08)",
              border: `2px solid ${i <= revealed ? "#8b5cf6" : "rgba(255,255,255,0.15)"}`,
              fontSize: "1rem",
            }}
          >
            {i < revealed ? "✓" : s.icon}
          </div>
          <div>
            <div style={{ color: i <= revealed ? "white" : "rgba(255,255,255,0.4)", fontWeight: 600, fontSize: "0.85rem" }}>
              {s.title}
            </div>
            {i <= revealed && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.78rem", lineHeight: 1.5, marginTop: 3 }}
              >
                {s.desc}
              </motion.p>
            )}
            {i > revealed && (
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem" }}>Toca para revelar</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function InteractiveTimeline() {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {timelineEvents.map((ev, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.01 }}
          className="rounded-xl cursor-pointer"
          style={{ border: `1px solid ${selected === i ? ev.color : "rgba(255,255,255,0.1)"}` }}
          onClick={() => setSelected(selected === i ? null : i)}
        >
          <div
            className="flex items-center gap-3 p-3"
            style={{ background: selected === i ? `${ev.color}18` : "rgba(255,255,255,0.03)" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `${ev.color}22`,
                border: `2px solid ${ev.color}66`,
                fontSize: "1.1rem",
              }}
            >
              {ev.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ color: ev.color, fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.05em" }}>
                {ev.year}
              </div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: "0.83rem" }}>
                {ev.title}
              </div>
            </div>
            <div style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
              {selected === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>

          <AnimatePresence>
            {selected === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-2" style={{ borderTop: `1px solid ${ev.color}33` }}>
                  <div className={`grid gap-4 ${ev.img ? "grid-cols-2" : "grid-cols-1"}`}>
                    {/* Columna izquierda — info */}
                    <div>
                      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem", lineHeight: 1.6 }}>{ev.desc}</p>
                      <div className="flex gap-3 mt-3 flex-wrap">
                        <div className="flex-1 min-w-28 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem" }}>⚡ ENERGÍA</div>
                          <div style={{ color: ev.color, fontSize: "0.78rem", fontWeight: 700 }}>{ev.energy}</div>
                        </div>
                        <div className="flex-1 min-w-28 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem" }}>📏 TAMAÑO</div>
                          <div style={{ color: ev.color, fontSize: "0.78rem", fontWeight: 700 }}>{ev.size}</div>
                        </div>
                      </div>
                    </div>
                    {/* Columna derecha — imagen */}
                    {ev.img && (
                      <div className="rounded-xl overflow-hidden" style={{ height: 160 }}>
                        <img src={ev.img} alt={ev.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Topic definitions ──────────────────────────────────────────────────────
interface Topic {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  glowColor: string;
}

const topics: Topic[] = [
  { id: "asteroids", emoji: "🪨", title: "¿Qué son los Asteroides?", subtitle: "Rocas espaciales que viajan por el Sistema Solar", color: "#00b4d8", glowColor: "rgba(0,180,216,0.25)" },
  { id: "neos", emoji: "🌍", title: "¿Qué son los NEOs?", subtitle: "Los vecinos más cercanos de la Tierra en el espacio", color: "#f97316", glowColor: "rgba(249,115,22,0.25)" },
  { id: "detection", emoji: "🔭", title: "Detección y Seguimiento", subtitle: "¿Cómo encontramos y rastreamos asteroides?", color: "#8b5cf6", glowColor: "rgba(139,92,246,0.25)" },
  { id: "history", emoji: "📜", title: "Historia de los Asteroides", subtitle: "De los dinosaurios hasta la era espacial", color: "#f59e0b", glowColor: "rgba(245,158,11,0.25)" },
  { id: "science", emoji: "🚀", title: "Ciencia y Defensa Planetaria", subtitle: "Por qué estudiarlos salva vidas y responde misterios", color: "#10b981", glowColor: "rgba(16,185,129,0.25)" },
];

function TopicContent({ id, color }: { id: string; color: string }) {
  switch (id) {
    case "asteroids":
      return (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5 items-center">
            <div>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                ¡Imagina que el Sistema Solar es como una gran fábrica que quedó a medio terminar! Los asteroides son los{" "}
                <strong style={{ color }}>sobrantes de construcción</strong> de cuando se formaron los planetas hace más de 4,500 millones de años.
              </p>
              <p className="mt-3" style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                Son cuerpos rocosos o metálicos que orbitan alrededor del Sol. No son planetas (muy pequeños) ni cometas (sin cola de hielo). ¡Como las "piezas de LEGO" que el Sistema Solar nunca usó! 🧩
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ height: 180 }}>
              <img src={asteroidImg} alt="Asteroide" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <InfoBadge label="Asteroides conocidos" value=">1.3M" color={color} />
            <InfoBadge label="El más grande" value="Ceres 940km" color="#a78bfa" />
            <InfoBadge label="Edad (años)" value="4,500 M" color="#fbbf24" />
            <InfoBadge label="Tipos principales" value="C, S, M" color="#34d399" />
          </div>

          <div>
            <p className="mb-3" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em" }}>
              🧪 EXPLORADOR DE TIPOS
            </p>
            <AsteroidTypeExplorer />
          </div>

          <div className="space-y-2">
            <FunFact emoji="🌌" text="Si juntaras todos los asteroides del Cinturón Principal, formarían una bola más pequeña que la Luna. ¡El espacio es increíblemente vacío!" />
            <FunFact emoji="💧" text="Los asteroides carbonáceos (Tipo C) contienen agua y aminoácidos. ¡Podrían haber traído los ingredientes de la vida a la Tierra primitiva!" />
          </div>
        </div>
      );

    case "neos":
      return (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5 items-center">
            <div>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                <strong style={{ color }}>NEO</strong> = Near-Earth Object = <strong style={{ color }}>Objeto Cercano a la Tierra</strong>. Son asteroides o cometas cuya órbita pasa cerca de la órbita de nuestro planeta.
              </p>
              <p className="mt-3" style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                "Cercano" significa que pasan a menos de 195 millones de km del Sol. En el universo, eso es como vivir en el mismo vecindario. 🏘️
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ height: 180 }}>
              <img src={earthImg} alt="Tierra" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <InfoBadge label="NEOs conocidos" value=">36,000" color={color} />
            <InfoBadge label="PHAs peligrosos" value=">2,300" color="#ef4444" />
            <InfoBadge label="Nuevos por año" value="~3,000" color="#fbbf24" />
            <InfoBadge label="Familias" value="4 grupos" color="#34d399" />
          </div>

          <div>
            <p className="mb-3" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em" }}>
              🌍 FAMILIAS DE NEOs — ÓRBITAS INTERACTIVAS
            </p>
            <NEOOrbits />
          </div>

          <FunFact emoji="⚠️" text="Los PHAs (Asteroides Potencialmente Peligrosos) miden más de 140 m y pasan a menos de 7.5 millones de km de la Tierra — 20 veces más cerca que la Luna. ¡Hay más de 2,300 conocidos!" />
        </div>
      );

    case "detection":
      return (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5 items-center">
            <div>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                Encontrar asteroides es como buscar pelotas negras en la oscuridad total. ¡Pero los astrónomos lo hacen todos los días usando telescopios con cámaras de miles de megapíxeles e{" "}
                <strong style={{ color }}>inteligencia artificial</strong>!
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ height: 160 }}>
              <img src={radarImg} alt="Telescopio" className="w-full h-full object-cover" />
            </div>
          </div>

          <div>
            <p className="mb-3" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em" }}>
              🎮 MINIJUEGO — ¡DETECTA EL ASTEROIDE!
            </p>
            <SpotAsteroidGame />
          </div>

          <div>
            <p className="mb-3" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em" }}>
              📋 EL PROCESO REAL — TOCA PARA REVELAR CADA PASO
            </p>
            <StepReveal
              steps={[
                { icon: "🌃", title: "Observación nocturna", desc: "Telescopios automáticos fotografían miles de sectores del cielo cada noche. Las cámaras tienen hasta 1,400 megapíxeles." },
                { icon: "💻", title: "Análisis por IA", desc: "Un software compara fotos del mismo sector tomadas con horas de diferencia. Los asteroides 'se mueven' entre las estrellas fijas." },
                { icon: "📍", title: "Cálculo de órbita", desc: "Con 3 observaciones mínimas, los matemáticos calculan la órbita completa usando las leyes de Kepler y Newton." },
                { icon: "📊", title: "Escala de Turín", desc: "Se asigna un nivel de riesgo del 0 al 10. El 0 = sin peligro, el 10 = impacto catastrófico seguro. Casi todos están en 0." },
                { icon: "🔄", title: "Seguimiento continuo", desc: "El asteroide se monitorea durante meses o años para refinar la predicción y confirmar si representa un peligro real." },
              ]}
            />
          </div>
        </div>
      );

    case "history":
      return (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5 items-center">
            <div>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                Los asteroides han moldeado la historia de la Tierra desde el principio. ¡Algunos científicos creen que incluso podrían haber traído el agua de nuestros océanos! 💧
              </p>
              <p className="mt-3" style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                Desde la extinción de los dinosaurios hasta la primera misión de defensa planetaria en 2022 — los asteroides son protagonistas de la historia cósmica de nuestro planeta.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ height: 160 }}>
              <img src={historyImg} alt="Dinosaurios" className="w-full h-full object-cover" />
            </div>
          </div>

          <div>
            <p className="mb-3" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em" }}>
              🕰️ LÍNEA DEL TIEMPO INTERACTIVA — TOCA CADA EVENTO
            </p>
            <InteractiveTimeline />
          </div>

          <FunFact emoji="🌊" text="¿Sabías que parte del agua de nuestros océanos llegó a la Tierra a bordo de asteroides carbonáceos? ¡Le debemos nuestros mares a las 'rocas espaciales'!" />
        </div>
      );

    case "science":
      return (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5 items-center">
            <div>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                Los asteroides son <strong style={{ color }}>cápsulas del tiempo cósmicas</strong> — prácticamente sin cambios desde la formación del Sistema Solar. ¡Estudiarlos es como leer el "diario de infancia" de nuestros planetas!
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ height: 160 }}>
              <img src={solarImg} alt="Sistema solar" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: "⏰", title: "Origen del Sistema Solar", desc: "Nos revelan cómo se formaron los planetas hace 4,600 millones de años. Son los fósiles cósmicos más primitivos.", color: "#60a5fa" },
              { icon: "💧", title: "Origen del agua y la vida", desc: "Contienen aminoácidos y agua. Podrían haber 'sembrado' los ingredientes de la vida en la Tierra primitiva.", color: "#34d399" },
              { icon: "💎", title: "Minería espacial (futuro)", desc: "Un asteroide metálico de 500 m contiene más metales preciosos que toda la producción mundial de un siglo.", color: "#fbbf24" },
              { icon: "🛡️", title: "Defensa planetaria", desc: "Son el único desastre natural que podemos prevenir completamente si los detectamos con tiempo suficiente.", color: "#f87171" },
            ].map((v) => (
              <div key={v.title} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${v.color}33` }}>
                <div style={{ fontSize: "1.4rem" }}>{v.icon}</div>
                <div style={{ color: v.color, fontWeight: 700, fontSize: "0.82rem", marginTop: 6 }}>{v.title}</div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.77rem", lineHeight: 1.5, marginTop: 3 }}>{v.desc}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-3" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em" }}>
              🛡️ ELIGE TU ESTRATEGIA DE DEFENSA PLANETARIA
            </p>
            <DefenseStrategy />
          </div>

          <div className="p-4 rounded-xl text-center" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,180,216,0.1))", border: "1px solid rgba(16,185,129,0.25)" }}>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.88rem", fontStyle: "italic", lineHeight: 1.7 }}>
              "Somos la primera especie capaz de detectar una amenaza de impacto con suficiente anticipación para hacer algo al respecto. Eso nos da una responsabilidad enorme."
            </p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem", marginTop: 6 }}>— Comunidad científica de defensa planetaria</p>
          </div>
        </div>
      );

    default:
      return null;
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function ExploraPage() {
  const [openId, setOpenId] = useState<string>(topics[0].id);
  const [stars, setStars] = useState<Set<string>>(new Set());
  const [celebrated, setCelebrated] = useState(false);

  const handlePass = (id: string) => {
    setStars((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (stars.size === 5 && !celebrated) {
      setCelebrated(true);
      const end = Date.now() + 3000;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#a78bfa", "#00b4d8", "#fbbf24"] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#f97316", "#34d399", "#f472b6"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [stars, celebrated]);

  const activeTopic = topics.find((t) => t.id === openId)!;

  return (
    <div className="w-full min-h-screen" style={{ zoom: 1.1, background: "#000000"  }}>

      {/* ── Header centrado ── */}
      <div className="text-center pt-12 pb-8 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            color: "#ffffff",
            fontSize: "clamp(1.7rem, 4vw, 2.6rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            textShadow: "0 0 20px rgba(255,255,255,0.2), 0 0 40px rgba(255,255,255,0.08)",
          }}
        >
          Explora los Asteroides
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2"
          style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem" }}
        >
          Explora cada sección, interactúa con los elementos y ¡gana una ⭐ superando el quiz de cada tema!
        </motion.p>
      </div>

      {/* ── Layout sidebar + contenido ── */}
      <div className="flex gap-0 px-4 pb-10" style={{ minHeight: "80vh" }}>

        {/* Sidebar izquierda */}
        <div
          className="flex flex-col gap-2 flex-shrink-0"
          style={{
            width: 280,
            position: "sticky",
            top: 80,
            alignSelf: "flex-start",
          }}
        >
          {/* Progreso */}
          <div
            className="p-4 rounded-2xl mb-2"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em" }}>
                TU PROGRESO
              </span>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", fontWeight: 700 }}>
                {stars.size}/5 ⭐
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div
                animate={{ width: `${(stars.size / 5) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #a78bfa, #00b4d8)" }}
              />
            </div>
          </div>

          {/* Lista de temas */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="px-4 pt-3 pb-2" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em" }}>
              TEMAS
            </p>
            {topics.map((topic) => {
              const isActive = openId === topic.id;
              const hasStarr = stars.has(topic.id);
              return (
                <button
                  key={topic.id}
                  onClick={() => setOpenId(topic.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200"
                  style={{
                    background: isActive ? `${topic.color}18` : "transparent",
                    borderLeft: `3px solid ${isActive ? topic.color : "transparent"}`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isActive ? `${topic.color}33` : "rgba(255,255,255,0.06)",
                      border: `2px solid ${isActive ? topic.color : "rgba(255,255,255,0.12)"}`,
                      fontSize: "1rem",
                    }}
                  >
                    {hasStarr ? "⭐" : topic.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{
                      color: isActive ? topic.color : "rgba(255,255,255,0.8)",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {topic.title}
                    </div>
                    <div style={{
                      color: "rgba(255,255,255,0.35)",
                      fontSize: "0.7rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {topic.subtitle}
                    </div>
                  </div>
                  {isActive && (
                    <div style={{ color: topic.color, flexShrink: 0, fontSize: "0.8rem" }}>›</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel de contenido derecho */}
        <div className="flex-1 min-w-0 pl-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={openId}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Topic header */}
              <div
                className="flex items-center gap-4 p-6"
                style={{ background: activeTopic.glowColor, borderBottom: `1px solid ${activeTopic.color}33` }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${activeTopic.color}33`,
                    border: `2px solid ${activeTopic.color}`,
                    fontSize: "1.5rem",
                  }}
                >
                  {activeTopic.emoji}
                </div>
                <div>
                  <h2 style={{ color: activeTopic.color, fontWeight: 800, fontSize: "1.3rem" }}>
                    {activeTopic.title}
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginTop: 2 }}>
                    {activeTopic.subtitle}
                  </p>
                </div>
              </div>

              {/* Topic body */}
              <div className="p-6">
                <TopicContent id={openId} color={activeTopic.color} />
                <MiniQuiz
                  questions={quizzes[openId]}
                  color={activeTopic.color}
                  onPass={() => handlePass(openId)}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* All stars celebration */}
          <AnimatePresence>
            {stars.size === 5 && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-5 rounded-2xl text-center"
                style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(167,139,250,0.2))", border: "2px solid rgba(251,191,36,0.5)" }}
              >
                <div style={{ fontSize: "2.5rem" }}>🏆</div>
                <p style={{ color: "#fbbf24", fontWeight: 800, fontSize: "1.1rem", marginTop: 6 }}>
                  ¡Eres un experto en asteroides!
                </p>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginTop: 4 }}>
                  Completaste los 5 temas y ganaste todas las estrellas. ¡La NASA estaría orgullosa de ti! 🚀
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-center pb-6" style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.72rem" }}>
        Información basada en datos de NASA, ESA y el Centro de Planetas Menores (MPC).
      </p>
    </div>
  );
}
