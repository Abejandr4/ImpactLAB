import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import Confetti from "react-confetti"; 

// Importación de las imágenes
import asteroidRoca from "../assets/img/roca.png";
import asteroidMetalico from "../assets/img/metalico.png";

// ─── Estrategias Expandidas para Primaria Alta (10-12 años) ───────────────────
const STRATEGIES = [
  {
    id: "kinetic",
    emoji: "🚀",
    name: "Impacto Cinético",
    subtitle: "¡Un choque directo a toda velocidad!",
    color: "#f97316",
    img: "https://images-assets.nasa.gov/image/PIA25329/PIA25329~medium.jpg",
    minLeadYears: 5,
    maxDiameterM: 1000,
    baseSucessRate: 85, 
    baseEffectiveness: 80,
    metalPenalty: 20,
    description: "Enviamos una nave espacial pesada a miles de kilómetros por hora para chocar de frente contra el asteroide. Al impactar, le transfiere todo su 'momento lineal' (la fuerza de su movimiento). Esto frena o empuja la roca un poquito, suficiente para que años después no pase por la Tierra. Es ideal para rocas medianas y la NASA ya comprobó que funciona con la misión DART.",
    analogy: "🎮 Es como jugar al billar cósmico: si golpeas una bola en movimiento con otra bola rápida, cambias su dirección al instante.",
    notes: [
      { icon: "✅", text: "Tecnología probada y exitosa en la vida real." },
      { icon: "🪨", text: "Si el asteroide es de metal pesado, cuesta mucho más trabajo desviarlo." }
    ],
  },
  {
    id: "coating",
    emoji: "🎨",
    name: "Efecto Yarkovsky",
    subtitle: "Usar el calor del Sol para empujarlo",
    color: "#ef4444",
    img: "https://ciencia.nasa.gov/wp-content/uploads/sites/2/2023/06/921_683_bennu_carousel_5-jpg.webp?resize=1200,900",
    minLeadYears: 15,
    maxDiameterM: 400,
    baseSucessRate: 55,
    baseEffectiveness: 60,
    metalPenalty: 45,
    description: "Enviamos una nave para pintar de negro una parte del asteroide con polvo especial. El color oscuro absorbe más luz del Sol. Cuando ese lado del asteroide rota y se enfría, libera energía térmica hacia el espacio. Esa pequeña fuga de calor actúa como un motor minúsculo que empuja la roca. Se necesitan muchísimos años, pero es súper seguro.",
    analogy: "☀️ Es como usar una playera negra en un día soleado: absorbes más calor. Ese calor extra funciona como un motor que nunca se apaga.",
    notes: [
      { icon: "⏳", text: "Es el método más lento de todos. Se necesitan décadas." },
      { icon: "📏", text: "Solo sirve para asteroides que midan menos de 400 metros." }
    ],
  },
  {
    id: "gravity",
    emoji: "🛰️",
    name: "Tractor de Gravedad",
    subtitle: "Atracción invisible en el espacio",
    color: "#60a5fa" ,
    img: "https://images-assets.nasa.gov/image/NHQ202111230012/NHQ202111230012~medium.jpg",
    minLeadYears: 12,
    maxDiameterM: 500,
    baseSucessRate: 65,
    baseEffectiveness: 70,
    metalPenalty: 0,
    description: "Colocamos una nave espacial inmensamente pesada a volar al lado del asteroide, pero sin tocarlo. En el espacio, todo lo que tiene masa tiene gravedad. La nave enciende sus motores suavemente para no chocar y, al hacerlo, su propia gravedad va 'arrastrando' al asteroide fuera de su camino. Es excelente porque no hay riesgo de fragmentar la roca.",
    analogy: "🧲 Es como usar un imán invisible. Como la nave pesa mucho, jala poco a poco a la roca hacia un lado.",
    notes: [
      { icon: "🎯", text: "Es muy preciso y seguro porque no hay riesgo de romper la roca." },
      { icon: "⚖️", text: "Si el asteroide es gigante, necesitaríamos construir una nave inmensamente pesada." }
    ],
  },
  {
    id: "laser",
    emoji: "⚡",
    name: "Ablación Láser",
    subtitle: "Vaporizar la roca para crear propulsión",
    color: "#a78bfa" ,
    img: "https://images-assets.nasa.gov/image/PIA26711/PIA26711~medium.jpg",
    minLeadYears: 8,
    maxDiameterM: 600,
    baseSucessRate: 60,
    baseEffectiveness: 65,
    metalPenalty: 35,
    description: "Disparamos láseres súper potentes hacia la roca. El calor es tan extremo que la superficie pasa de sólido a gas al instante (un proceso llamado sublimación). Este gas sale disparado con muchísima fuerza hacia el espacio, empujando al asteroide en la dirección opuesta, justo como lo hace el escape de fuego en un cohete espacial.",
    analogy: "🔍 Es como usar una lupa gigante para concentrar la luz. Al quemar la roca, el humo que sale disparado la empuja hacia atrás.",
    notes: [
      { icon: "🔭", text: "Podemos operar los láseres desde una distancia segura." },
      { icon: "🪙", text: "Si el asteroide es de metal brillante, el láser se refleja y pierde fuerza." }
    ],
  },
  {
    id: "nuclear",
    emoji: "💥",
    name: "Explosión Nuclear",
    subtitle: "El empuje más extremo de todos",
    color: "#fbbf24" ,
    img: "https://images-assets.nasa.gov/image/jsc2008e027179/jsc2008e027179~medium.jpg",
    minLeadYears: 2,
    maxDiameterM: 10000,
    baseSucessRate: 90,
    baseEffectiveness: 95,
    metalPenalty: 5,
    description: "¡No perforamos la roca como en las películas! Detonamos una carga nuclear cerca del asteroide, sin tocarlo. Los rayos X y la radiación de la explosión calientan la roca tan rápido que una capa entera se vaporiza y explota hacia el espacio, dándole un empujón brutal a lo que queda del asteroide. Es la última opción si nos queda poco tiempo o si el asteroide es colosal.",
    analogy: "💨 Es como hacer explotar un fuego artificial gigante al lado de un globo: la onda de energía lo avienta lejos.",
    notes: [
      { icon: "💪", text: "Tiene el mayor poder para desviar rocas gigantes en poco tiempo." },
      { icon: "⚠️", text: "Riesgo extremo: podría fracturar el asteroide y crear una lluvia de meteoritos peligrosos." }
    ],
  },
  {
    id: "solar",
    emoji: "⛵",
    name: "Vela Solar",
    subtitle: "Navegando con la luz de las estrellas",
    color: "#34d399" ,
    img: "https://images-assets.nasa.gov/image/PIA03212/PIA03212~orig.jpg",
    minLeadYears: 18,
    maxDiameterM: 200,
    baseSucessRate: 50,
    baseEffectiveness: 55,
    metalPenalty: 30,
    description: "Atamos el asteroide a una tela reflectante ultradelgada del tamaño de varias canchas de fútbol. Aunque la luz del Sol (los fotones) no tiene masa, sí tiene 'impulso'. Al rebotar constantemente contra la vela brillante, la presión de la luz va empujando la vela, y al asteroide con ella, a lo largo de décadas.",
    analogy: "⛵ Es exactamente igual a un barco de vela en el mar, pero en lugar de usar el viento, la vela es empujada por la luz del Sol.",
    notes: [
      { icon: "🪐", text: "Solo funciona para asteroides muy pequeños y rocosos." },
      { icon: "🔬", text: "Es una tecnología experimental que todavía estamos perfeccionando." }
    ],
  },
];

// ─── Funciones Auxiliares ────────────────────────────────────────────────────
function calcViability(strategy, { diameterM, leadTimeYears, isMetallic, velocityKms }) {
  let successRate = strategy.baseSucessRate;
  let effectiveness = strategy.baseEffectiveness;

  const timeDiff = leadTimeYears - strategy.minLeadYears;
  if (timeDiff < 0) {
    const penalty = Math.min(75, Math.abs(timeDiff) * 9);
    successRate -= penalty;
    effectiveness -= penalty * 0.85;
  } else {
    const bonus = Math.min(15, timeDiff * 1.5);
    successRate += bonus;
    effectiveness += bonus * 0.7;
  }

  if (diameterM > strategy.maxDiameterM) {
    const overRatio = (diameterM - strategy.maxDiameterM) / strategy.maxDiameterM;
    const penalty = Math.min(65, overRatio * 35);
    successRate -= penalty;
    effectiveness -= penalty * 0.9;
  } else {
    const bonus = Math.min(10, ((strategy.maxDiameterM - diameterM) / strategy.maxDiameterM) * 10);
    successRate += bonus;
    effectiveness += bonus * 0.5;
  }

  if (isMetallic) {
    successRate -= strategy.metalPenalty;
    effectiveness -= strategy.metalPenalty * 0.8;
  }

  if (velocityKms > 20) {
    const vPenalty = (velocityKms - 20) * 1.5;
    successRate -= vPenalty;
    effectiveness -= vPenalty;
  }

  successRate = Math.max(0, Math.min(100, Math.round(successRate)));
  effectiveness = Math.max(0, Math.min(100, Math.round(effectiveness)));
  const feasible = leadTimeYears >= strategy.minLeadYears;
  const overallScore = (successRate + effectiveness) / 2;

  return { successRate, effectiveness, feasible, overallScore };
}

// Analogías de Tamaño
const getSizeAnalogy = (d) => {
  if (d <= 5)   return { icon: "🪑", label: "mesa de comedor grande" };
  if (d < 80)   return { icon: "⚽", label: "campo de fútbol" };
  if (d < 170)  return { icon: "⚽", label: "1.5 campos de fútbol — umbral de peligro" };
  if (d < 250)  return { icon: "🏢", label: "rascacielos de 50 pisos (promedio NEA)" };
  if (d < 600)  return { icon: "⛪", label: "la base de la Pirámide de Cholula" };
  if (d < 1500) return { icon: "🏛️", label: "10 veces el Zócalo de Puebla" };
  if (d < 3500) return { icon: "⚽", label: "30 campos de fútbol seguidos" };
  return               { icon: "🎡", label: "56 Estrellas de Puebla en línea recta" };
};

function getComparativeText(meters) {
  const analogy = getSizeAnalogy(meters);
  return `${analogy.icon} ${analogy.label}`;
}

// Analogías de Velocidad
const getSpeedAnalogy = (s) => {
  if (s <= 6)  return "Equivale a ir de CDMX a Puebla en menos de 20 segundos";
  if (s <= 12) return "30 veces más rápida que el sonido en el aire";
  if (s <= 16) return "Un objeto cruzaría todo México en solo 3.5 minutos";
  return              "Un objeto cruzaría el diámetro de la Tierra en 10 minutos";
};

// ─── Tarjeta de estrategia (Vista Principal) ──────────────────────────────────
function StrategyCard({ strategy, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="rounded-xl cursor-pointer overflow-hidden flex flex-col"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.1)`,
        height: "100%",
      }}
    >
      <div style={{ height: 100, overflow: "hidden", position: "relative", flexShrink: 0 }}>
        <img
          src={strategy.img}
          alt={strategy.name}
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.65)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8))" }} />
        <div className="absolute bottom-2 left-3 flex items-center gap-2">
          <span style={{ fontSize: "1.1rem" }}>{strategy.emoji}</span>
          <span style={{ color: strategy.color, fontWeight: 700, fontSize: "0.95rem" }}>{strategy.name}</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-between" style={{ padding: "0.75rem", textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", marginBottom: "0.6rem", flexGrow: 1 }}>
          {strategy.description.substring(0, 100)}...
        </p>
        <span style={{ color: strategy.color, fontSize: "0.65rem", fontWeight: "bold", background: `${strategy.color}22`, padding: "6px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Leer más y probar
        </span>
      </div>
    </motion.div>
  );
}

// ─── Modal de evaluación Interactivo ──────────────────────────
function AssessmentModal({ strategy, viability, leadTimeYears, diameterM, isMetallic, onClose }) {
  const [testState, setTestState] = useState('reading'); 

  const runSimulation = () => {
    setTestState('simulating');
    setTimeout(() => {
      setTestState('results');
    }, 1800);
  };

  let verdict, verdictColor, emojiVerdict;
  if (viability.overallScore >= 70) {
    verdict = "¡Misión Exitosa! Logramos desviar el asteroide.";
    verdictColor = "#4ade80";
    emojiVerdict = "🟢";
  } else if (viability.overallScore >= 45) {
    verdict = "Impacto Parcial. Funcionó a medias, hay daños.";
    verdictColor = "#facc15";
    emojiVerdict = "🟡";
  } else {
    verdict = "¡Misión Fallida! El asteroide no se desvió.";
    verdictColor = "#f87171";
    emojiVerdict = "🔴";
  }

  let reasonText = "";
  const timeDiff = leadTimeYears - strategy.minLeadYears;

  if (viability.overallScore >= 70) {
    reasonText = "¡Misión superada! 🌟 ";
    if (timeDiff >= 5) {
      reasonText += "¡Tener tantos años de ventaja fue la clave! ⏳ Nos dio el tiempo perfecto para empujar el asteroide sin presiones.";
    } else if (diameterM < strategy.maxDiameterM * 0.5) {
      reasonText += "¡Fue pan comido! 🥖 Como el asteroide era pequeñito, nuestra tecnología lo mandó a volar rapidísimo.";
    } else {
      reasonText += "¡Nuestra tecnología espacial funcionó de maravilla! 🚀 Logramos vencer el impulso de esta enorme roca espacial.";
    }
  } else if (viability.overallScore >= 45) {
    reasonText = "Análisis del radar 📡: ¡Uf, por poco! 😅 Logramos desviar una parte, pero la Tierra recibió algunos rasguños. ";
    if (timeDiff < 0) reasonText += "Nos faltó un poquito más de tiempo para prepararnos mejor. ";
    else if (diameterM > strategy.maxDiameterM) reasonText += "La roca resultó ser demasiado grande para moverla por completo. ";
    else if (isMetallic) reasonText += "Al ser de metal, costó muchísimo trabajo empujarla. ";
    reasonText += "¡La próxima vez necesitamos una estrategia con más poder!";
  } else {
    let issues = [];
    if (timeDiff < 0) issues.push(`¡el tiempo se nos acabó muy rápido! ⏳ Necesitábamos al menos ${strategy.minLeadYears} años de preparación y solo teníamos ${leadTimeYears}`);
    if (diameterM > strategy.maxDiameterM) issues.push(`¡la roca era demasiado gigantesca! 🏔️ Nuestra máquina no tuvo la fuerza suficiente para mover un asteroide de más de ${strategy.maxDiameterM} metros`);
    if (isMetallic && strategy.metalPenalty > 0) issues.push(`al ser de metal pesado, ¡era súper duro y pesadísimo de mover! 🛡️`);

    if (issues.length > 0) {
      const joined = issues.join(" y además, ");
      reasonText = "Análisis del radar 📡: ¡Oh no! La misión falló porque " + joined + ". ¡Tenemos que intentar otra estrategia!";
    } else {
      reasonText = "Análisis del radar 📡: El empujón que le dimos no fue suficiente para alterar su órbita a tiempo. ¡Necesitamos un plan con más poder!";
    }
  }

  let modalAnimation = { opacity: 1, scale: 1, y: 0, x: 0, rotate: 0, boxShadow: `0 0 60px ${strategy.color}22` };
  let modalTransition = { duration: 0.22 };

  if (testState === 'results') {
    if (viability.overallScore >= 70) {
      modalAnimation = { opacity: 1, scale: 1, y: 0, x: 0, rotate: 0, boxShadow: `0 0 60px ${strategy.color}22` };
    } else if (viability.overallScore >= 45) {
      modalAnimation = { 
        opacity: 1, scale: 1, y: 0, x: 0, 
        rotate: [-3, 3, -2, 2, -1, 1, 0], 
        boxShadow: [`0 0 60px ${strategy.color}22`, `0 0 100px #facc1588`, `0 0 60px ${strategy.color}22`] 
      };
      modalTransition = { duration: 0.6, ease: "easeInOut" };
    } else {
      modalAnimation = { 
        opacity: 1, scale: 1, y: 0, rotate: 0,
        x: [-12, 12, -10, 10, -5, 5, 0], 
        boxShadow: [`0 0 60px ${strategy.color}22`, `0 0 100px #f8717188`, `0 0 60px ${strategy.color}22`] 
      };
      modalTransition = { duration: 0.4 };
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      {testState === 'results' && viability.overallScore >= 70 && (
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={400} gravity={0.15} />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24, boxShadow: `0 0 60px ${strategy.color}22` }}
        animate={modalAnimation}
        exit={{ opacity: 0, scale: 0.92, y: 24, boxShadow: `0 0 60px ${strategy.color}22` }}
        transition={modalTransition}
        className="w-full rounded-2xl overflow-hidden flex flex-col"
        style={{ maxWidth: 500, maxHeight: "90vh", background: "#0f0f0f", border: `1px solid rgba(255,255,255,0.15)` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ height: 160, position: "relative", flexShrink: 0 }}>
          <img src={strategy.img} alt={strategy.name} className="w-full h-full object-cover" style={{ filter: "brightness(0.5)" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${strategy.color}22 0%, rgba(15,15,15,0.95) 100%)` }} />
          <button onClick={onClose} className="absolute top-3 right-3 rounded-full p-1.5" style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}>
            <X size={16} />
          </button>
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <div className="flex items-center justify-center rounded-full" style={{ width: 50, height: 50, background: `${strategy.color}33`, border: `2px solid ${strategy.color}`, fontSize: "1.5rem" }}>
              {strategy.emoji}
            </div>
            <div>
              <div style={{ color: strategy.color, fontWeight: 800, fontSize: "1.3rem" }}>{strategy.name}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                {testState === 'results' ? 'Reporte de Misión' : 'Expediente de Estrategia'}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {testState === 'reading' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="p-4 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: 700, marginBottom: 8, letterSpacing: "1px" }}>¿CÓMO FUNCIONA?</div>
                <p style={{ color: "white", fontSize: "0.9rem", lineHeight: 1.5 }}>{strategy.description}</p>
                <div className="mt-3 p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.3)", borderLeft: `3px solid ${strategy.color}` }}>
                  <p style={{ color: "#e2e8f0", fontSize: "0.85rem", fontStyle: "italic" }}>{strategy.analogy}</p>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: 700, marginTop: 4, letterSpacing: "1px" }}>DATOS DE LA MISIÓN</div>
                {strategy.notes.map((note, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <span style={{ fontSize: "1.2rem" }}>{note.icon}</span>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>{note.text}</p>
                  </div>
                ))}
              </div>
              <button onClick={runSimulation} className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)", color: "white", fontSize: "1rem", letterSpacing: "1px", border: "none", boxShadow: "0 10px 20px -5px rgba(124, 58, 237, 0.4)" }}>
                <span>INICIAR SIMULACIÓN</span><span style={{ fontSize: "1.2rem" }}>🚀</span>
              </button>
            </motion.div>
          )}

          {testState === 'simulating' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10">
              <Loader2 className="animate-spin mb-4" size={48} color={strategy.color} />
              <p style={{ color: "white", fontWeight: "bold", fontSize: "1.1rem", letterSpacing: "1px" }}>Calculando trayectorias...</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginTop: "8px" }}>Evaluando física del asteroide</p>
            </motion.div>
          )}

          {testState === 'results' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="p-5 rounded-2xl text-center flex flex-col items-center justify-center mb-5" style={{ background: `${verdictColor}11`, border: `2px solid ${verdictColor}` }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>{emojiVerdict}</div>
                <p style={{ color: "white", fontSize: "1.1rem", fontWeight: "bold", marginBottom: "12px" }}>{verdict}</p>
                <div style={{ background: "rgba(0,0,0,0.4)", padding: "10px 14px", borderRadius: "10px", width: "100%" }}>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.85rem", fontStyle: "italic", lineHeight: 1.4 }}>{reasonText}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="flex justify-between items-center mb-2">
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px" }}>PROBABILIDAD DE ÉXITO</span>
                  <span style={{ color: verdictColor, fontWeight: "bold", fontSize: "1.2rem" }}>{viability.overallScore}%</span>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)", height: 16 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${viability.overallScore}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full rounded-full" style={{ background: verdictColor }} />
                </div>
              </div>
              <button onClick={onClose} className="w-full py-3 rounded-xl font-bold mt-2 hover:bg-white/10 transition-colors" style={{ background: "transparent", border: `1px solid ${strategy.color}`, color: strategy.color, fontSize: "1rem" }}>
                Cerrar Reporte
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function DefensaPlanetaria() {
  const location = useLocation();
  const navigate = useNavigate();
  const { inputParameters: inputs } = location.state || {};

  const [leadTimeYears, setLeadTimeYears] = useState(25);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => { document.body.style.overflowX = ""; };
  }, []);

  const isMetallic = inputs?.composition === "metallic" || inputs?.composition === "Metálico" || inputs?.composition === "Metálica";
  const diameterM = inputs?.diameter_km != null ? Math.round(inputs.diameter_km * 1000) : (inputs?.diameter_m ?? 2500);
  const velocityKms = inputs?.velocity_kms ?? inputs?.velocity_km_s ?? 10;
  const angleDeg = inputs?.angle_deg ?? 45;

  const asteroidImg = isMetallic ? asteroidMetalico : asteroidRoca;

  const viabilities = useMemo(() => {
    return STRATEGIES.reduce((acc, s) => {
      acc[s.id] = calcViability(s, { diameterM, leadTimeYears, isMetallic, velocityKms });
      return acc;
    }, {});
  }, [diameterM, leadTimeYears, isMetallic, velocityKms]);

  const selectedStrategy = STRATEGIES.find((s) => s.id === selectedId);

  if (!inputs) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-black">
        <div className="text-center p-8">
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📡</div>
          <p className="text-white text-lg mb-6">No hay lecturas en el radar espacial.</p>
          <button onClick={() => navigate("/skyfallx-game")} className="px-6 py-3 rounded-xl bg-blue-500 text-white font-bold hover:scale-105 transition-transform">
            ← Rastrear nuevo asteroide
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-screen bg-black" style={{ zoom: 1.25 }}>
        
        {/* Cabecera compacta */}
        <div className="px-6 pt-14 pb-8 flex justify-between items-start">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: "#ffffff", fontSize: "2.5rem", fontWeight: 800 }}
            >
              Defensa Planetaria
            </motion.h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginTop: 2 }}>
              Checa las estrategias disponibles para salvar la Tierra.
            </p>
          </div>
          
          <div className="flex gap-2 flex-shrink-0 mt-1">
            <button
              onClick={() => navigate(-1)}
              style={{
                display: "flex", alignItems: "center", gap: "0.25rem",
                background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.15)",
                color: "#ffffff", borderRadius: "8px",
                padding: "0.35rem 0.6rem", fontSize: "0.65rem", fontWeight: 700,
                letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer",
                transition: "background 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.background="#1a1a1a"}
              onMouseLeave={e => e.currentTarget.style.background="#0f0f0f"}
            >
              <span style={{ fontSize: "0.9rem", paddingBottom: "1px" }}>←</span> Resultados
            </button>
            <button
              onClick={() => navigate("/skyfallx-game")}
              style={{
                display: "flex", alignItems: "center", gap: "0.25rem",
                background: "linear-gradient(90deg, #7c3aed 0%, #4f46e5 100%)",
                border: "none",
                color: "#ffffff", borderRadius: "8px",
                padding: "0.35rem 0.6rem", fontSize: "0.65rem", fontWeight: 700,
                letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer",
                transition: "opacity 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.opacity="0.9"}
              onMouseLeave={e => e.currentTarget.style.opacity="1"}
            >
              Nuevo asteroide <span style={{ fontSize: "0.9rem" }}>→</span>
            </button>
          </div>
        </div>

        {/* Contenedor principal con espacio vertical entre secciones (space-y-8) */}
        <div className="px-6 pb-12 space-y-8">

          {/* Panel de Parámetros de la Amenaza */}
          <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
              FICHA DEL ASTEROIDE ☄️
            </div>
            
            <div className="flex flex-row gap-4 items-center">
              {/* ¡Imagen a la izquierda, de 140px! */}
              <div style={{ 
                width: "140px", height: "140px", flexShrink: 0, 
                display: "flex", alignItems: "center", justifyContent: "center" 
              }}>
                <img
                  src={asteroidImg}
                  alt={isMetallic ? "Asteroide metálico" : "Asteroide rocoso"}
                  style={{
                    width: "100%", height: "100%", objectFit: "contain",
                    filter: "drop-shadow(0 0 20px rgba(255,255,255,0.2))",
                  }}
                />
              </div>
              
              {/* Cuadrícula de datos a la derecha, ¡AHORA CON LA ANALOGÍA DE VELOCIDAD! */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                {[
                  { value: `${diameterM} m`, label: "Diámetro", extra: getComparativeText(diameterM) },
                  { value: `${velocityKms} km/s`, label: "Velocidad", extra: getSpeedAnalogy(velocityKms) },
                  { value: isMetallic ? "Metálico" : "Roca", label: "Composición" },
                  { value: `${angleDeg}°`, label: "Ángulo" }
                ].map((item, idx) => (
                  <div key={idx} className="text-center p-2 rounded-lg flex flex-col justify-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", height: "100%" }}>
                    <div style={{ color: "rgba(255,255,255,0.85)", fontWeight: 800, fontSize: "0.95rem" }}>{item.value}</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.6rem", marginTop: 2, textTransform: "uppercase" }}>{item.label}</div>
                    {item.extra && (
                      <div style={{ color: "#4ade80", fontSize: "0.6rem", marginTop: "4px", fontWeight: "bold" }}>
                        {item.extra}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reloj del fin del mundo con color índigo/morado */}
          <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="flex justify-between items-center mb-3">
              <div className="text-white/50 font-bold text-[0.65rem] tracking-widest">TIEMPO HASTA EL IMPACTO</div>
              <span style={{ color: "#a78bfa" }} className="font-bold text-xl">{leadTimeYears} años</span>
            </div>
            <input type="range" min={1} max={50} value={leadTimeYears}
              onChange={(e) => setLeadTimeYears(Number(e.target.value))}
              className="w-full cursor-pointer" style={{ accentColor: "#7c3aed" }} />
            <div className="flex justify-between mt-1" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem" }}>
              <span>1 año</span><span>25 años</span><span>50 años</span>
            </div>
          </div>

          {/* Grid de estrategias */}
          <div>
            <div className="text-white/50 font-bold text-[0.65rem] tracking-widest mb-3">ESTRATEGIAS DISPONIBLES</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {STRATEGIES.map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  onClick={() => setSelectedId(strategy.id)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {selectedStrategy && (
          <AssessmentModal
            strategy={selectedStrategy}
            viability={viabilities[selectedStrategy.id]}
            leadTimeYears={leadTimeYears}
            diameterM={diameterM}
            isMetallic={isMetallic}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

