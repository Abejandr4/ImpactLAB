import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, X, AlertTriangle } from "lucide-react";

// ─── Estrategias ─────────────────────────────────────────────────────────────
const STRATEGIES = [
  {
    id: "kinetic",
    emoji: "🚀",
    name: "Impacto Cinético",
    subtitle: "Colisión directa para desviar la trayectoria",
    color: "#60a5fa",
    glowColor: "rgba(96,165,250,0.18)",
    img: "https://images-assets.nasa.gov/image/PIA25329/PIA25329~medium.jpg",
    minLeadYears: 5,
    maxDiameterM: 1000,
    baseSucessRate: 75,
    baseEffectiveness: 80,
    cost: "$300M – $500M USD",
    techReadiness: "Alta",
    metalPenalty: 20,
    description:
      "Colisionar una nave espacial a alta velocidad contra el asteroide para alterar su trayectoria mediante transferencia de momento lineal. Es la única estrategia probada en la práctica (NASA DART, 2022).",
    notes: [
      { icon: "✅", text: "Tecnología demostrada exitosamente en misión NASA DART (2022)" },
      { icon: "⚠️", text: "Efectividad reducida en asteroides metálicos por su mayor densidad" },
      { icon: "📦", text: "Puede requerir múltiples impactores para objetos de gran tamaño" },
    ],
  },
  {
    id: "coating",
    emoji: "🎨",
    name: "Recubrimiento",
    subtitle: "Modifica el Efecto Yarkovsky gradualmente",
    color: "#22d3ee",
    glowColor: "rgba(34,211,238,0.18)",
    img: "https://ciencia.nasa.gov/wp-content/uploads/sites/2/2023/06/921_683_bennu_carousel_5-jpg.webp?resize=1200,900",
    minLeadYears: 15,
    maxDiameterM: 400,
    baseSucessRate: 55,
    baseEffectiveness: 60,
    cost: "$200M – $400M USD",
    techReadiness: "Media",
    metalPenalty: 45,
    description:
      "Aplicar una capa reflectante o absorbente sobre la superficie del asteroide para modificar el Efecto Yarkovsky — la presión de radiación solar que altera lentamente la órbita de un cuerpo rocoso.",
    notes: [
      { icon: "☀️", text: "Aprovecha el Efecto Yarkovsky: diferencia de temperatura entre el lado iluminado y oscuro" },
      { icon: "📏", text: "Solo viable para asteroides de menos de ~400 m de diámetro" },
      { icon: "⏳", text: "Requiere el mayor tiempo de todos los métodos pasivos para ser efectivo" },
    ],
  },
  {
    id: "gravity",
    emoji: "🛰️",
    name: "Tractor de Gravedad",
    subtitle: "Atracción gravitacional sostenida",
    color: "#4ade80",
    glowColor: "rgba(74,222,128,0.18)",
    img: "https://images-assets.nasa.gov/image/NHQ202111230012/NHQ202111230012~medium.jpg",
    minLeadYears: 12,
    maxDiameterM: 500,
    baseSucessRate: 65,
    baseEffectiveness: 70,
    cost: "$500M – $1B USD",
    techReadiness: "Media",
    metalPenalty: 0,
    description:
      "Estacionar una nave espacial masiva cerca del asteroide durante años. La atracción gravitacional mutua altera lentamente la órbita del objeto sin necesidad de contacto físico.",
    notes: [
      { icon: "🎯", text: "Muy preciso y controlable — sin riesgo de fragmentar el asteroide" },
      { icon: "🤝", text: "No requiere aterrizaje ni contacto directo con la superficie" },
      { icon: "⚖️", text: "Impráctico para asteroides grandes: se necesitaría una nave de masa enorme" },
    ],
  },
  {
    id: "laser",
    emoji: "⚡",
    name: "Ablación Láser",
    subtitle: "Vaporización de superficie para propulsión",
    color: "#facc15",
    glowColor: "rgba(250,204,21,0.18)",
    img: "https://images-assets.nasa.gov/image/PIA26711/PIA26711~medium.jpg",
    minLeadYears: 8,
    maxDiameterM: 600,
    baseSucessRate: 60,
    baseEffectiveness: 65,
    cost: "$1B – $2B USD",
    techReadiness: "Baja",
    metalPenalty: 35,
    description:
      "Vaporizar material de la superficie del asteroide con láseres de alta potencia. El material expulsado actúa como propulsor reactivo que desvía gradualmente la trayectoria del cuerpo.",
    notes: [
      { icon: "🔭", text: "Puede operar desde distancia segura sin necesidad de aterrizaje" },
      { icon: "🪙", text: "Ineficaz en asteroides metálicos por alta reflectividad y conductividad térmica" },
      { icon: "⚡", text: "Requiere fuente de energía nuclear o paneles solares de enorme área" },
    ],
  },
  {
    id: "nuclear",
    emoji: "💥",
    name: "Explosión Nuclear",
    subtitle: "Mayor poder de deflexión disponible",
    color: "#fb923c",
    glowColor: "rgba(251,146,60,0.18)",
    img: "https://images-assets.nasa.gov/image/jsc2008e027179/jsc2008e027179~medium.jpg",
    minLeadYears: 2,
    maxDiameterM: 10000,
    baseSucessRate: 90,
    baseEffectiveness: 95,
    cost: "$2B – $5B USD",
    techReadiness: "Alta",
    metalPenalty: 5,
    description:
      "Detonar un dispositivo nuclear cerca o sobre la superficie del asteroide. La energía liberada vaporiza material y genera una fuerza de propulsión que altera la trayectoria del cuerpo.",
    notes: [
      { icon: "💪", text: "Opción de último recurso con el mayor poder de deflexión de todas las estrategias" },
      { icon: "⚠️", text: "Riesgo de fragmentar el asteroide en múltiples impactores igualmente peligrosos" },
      { icon: "🌐", text: "Requiere coordinación internacional y es políticamente muy complejo" },
    ],
  },
  {
    id: "solar",
    emoji: "☀️",
    name: "Vela Solar",
    subtitle: "Presión de radiación solar continua",
    color: "#f472b6",
    glowColor: "rgba(244,114,182,0.18)",
    img: "https://images-assets.nasa.gov/image/PIA03212/PIA03212~orig.jpg",
    minLeadYears: 18,
    maxDiameterM: 200,
    baseSucessRate: 50,
    baseEffectiveness: 55,
    cost: "$100M – $300M USD",
    techReadiness: "Baja",
    metalPenalty: 30,
    description:
      "Desplegar una vela reflectante unida al asteroide para aprovechar la presión de radiación solar. El efecto es continuo y no requiere combustible, pero es extremadamente lento.",
    notes: [
      { icon: "💰", text: "La opción más económica si se cuenta con tiempo suficiente (18+ años)" },
      { icon: "🪐", text: "Solo viable para asteroides muy pequeños de menos de 200 m de diámetro" },
      { icon: "🔬", text: "Tecnología experimental — probada solo en misiones pequeñas como IKAROS" },
    ],
  },
];

// ─── Cálculo de viabilidad ────────────────────────────────────────────────────
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

// ─── Barra de progreso ────────────────────────────────────────────────────────
function ProgressBar({ value, color }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)", height: 5 }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

// ─── Tarjeta de estrategia ────────────────────────────────────────────────────
function StrategyCard({ strategy, viability, isRecommended, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="rounded-2xl cursor-pointer overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${isRecommended ? strategy.color : "rgba(255,255,255,0.1)"}`,
        boxShadow: isRecommended ? `0 0 20px ${strategy.color}22` : "none",
      }}
    >
      <div style={{ height: 90, overflow: "hidden", position: "relative" }}>
        <img
          src={strategy.img}
          alt={strategy.name}
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.55)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.7))" }} />
        {isRecommended && (
          <div
            className="absolute top-2 right-2 rounded-full px-2 py-0.5"
            style={{ background: `${strategy.color}33`, border: `1px solid ${strategy.color}66`, fontSize: "0.6rem", fontWeight: 700, color: strategy.color, backdropFilter: "blur(4px)" }}
          >
            ⭐ RECOMENDADA
          </div>
        )}
        <div className="absolute bottom-2 left-3 flex items-center gap-2">
          <span style={{ fontSize: "1rem" }}>{strategy.emoji}</span>
          <span style={{ color: strategy.color, fontWeight: 700, fontSize: "0.82rem" }}>{strategy.name}</span>
        </div>
      </div>

      <div style={{ padding: "0.85rem" }}>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", lineHeight: 1.5, marginBottom: "0.65rem" }}>
          {strategy.subtitle}
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between" style={{ fontSize: "0.7rem" }}>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>Tasa de éxito</span>
            <span style={{ color: strategy.color, fontWeight: 700 }}>{viability.successRate}%</span>
          </div>
          <ProgressBar value={viability.successRate} color={strategy.color} />
          <div className="flex justify-between" style={{ fontSize: "0.7rem" }}>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>Efectividad</span>
            <span style={{ color: strategy.color, fontWeight: 700 }}>{viability.effectiveness}%</span>
          </div>
          <ProgressBar value={viability.effectiveness} color={strategy.color} />
        </div>
        {!viability.feasible && (
          <div className="flex items-center gap-1.5 mt-2.5 px-2.5 py-1.5 rounded-xl" style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)" }}>
            <AlertTriangle size={10} style={{ color: "#fb923c", flexShrink: 0 }} />
            <span style={{ color: "#fb923c", fontSize: "0.65rem" }}>Tiempo insuficiente</span>
          </div>
        )}
        <div style={{ color: "rgba(255,255,255,0.22)", fontSize: "0.65rem", marginTop: "0.5rem" }}>
          {strategy.cost}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Modal de evaluación ──────────────────────────────────────────────────────
function AssessmentModal({ strategy, viability, recommendedStrategy, leadTimeYears, diameterM, isRecommended, onClose }) {
  let verdict, verdictColor;
  if (viability.overallScore >= 70) {
    verdict = "Esta estrategia tiene alta probabilidad de éxito con los parámetros de esta amenaza.";
    verdictColor = "#4ade80";
  } else if (viability.overallScore >= 45) {
    verdict = "Viabilidad moderada. Presenta limitaciones importantes con estos parámetros específicos.";
    verdictColor = "#facc15";
  } else {
    verdict = "Baja viabilidad para esta amenaza. Se recomienda considerar otras estrategias disponibles.";
    verdictColor = "#f87171";
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.22 }}
        className="w-full rounded-2xl overflow-hidden flex flex-col"
        style={{
          maxWidth: 500,
          maxHeight: "88vh",
          background: "#0f0f0f",
          border: `1px solid ${strategy.color}44`,
          boxShadow: `0 0 60px ${strategy.color}1a, 0 30px 60px rgba(0,0,0,0.8)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen de cabecera */}
        <div style={{ height: 160, position: "relative", flexShrink: 0 }}>
          <img src={strategy.img} alt={strategy.name} className="w-full h-full object-cover" style={{ filter: "brightness(0.5)" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${strategy.color}22 0%, rgba(15,15,15,0.95) 100%)` }} />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 rounded-full p-1.5 transition-all hover:scale-110"
            style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)" }}
          >
            <X size={14} />
          </button>
          {isRecommended && (
            <div className="absolute top-3 left-3 rounded-full px-2.5 py-1" style={{ background: `${strategy.color}33`, border: `1px solid ${strategy.color}66`, backdropFilter: "blur(4px)" }}>
              <span style={{ color: strategy.color, fontSize: "0.65rem", fontWeight: 700 }}>⭐ MEJOR OPCIÓN</span>
            </div>
          )}
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <div className="flex items-center justify-center rounded-full" style={{ width: 44, height: 44, background: `${strategy.color}33`, border: `2px solid ${strategy.color}`, fontSize: "1.2rem" }}>
              {strategy.emoji}
            </div>
            <div>
              <div style={{ color: strategy.color, fontWeight: 800, fontSize: "1.05rem" }}>{strategy.name}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem" }}>Evaluación de misión</div>
            </div>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1" style={{ padding: "1.25rem" }}>
          <div className="space-y-3">

            {/* Probabilidad de éxito */}
            <div className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${strategy.color}22` }}>
              <div className="flex justify-between items-end mb-2">
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em" }}>PROBABILIDAD DE ÉXITO</span>
                <span style={{ color: strategy.color, fontWeight: 800, fontSize: "1.5rem", lineHeight: 1 }}>{viability.successRate}%</span>
              </div>
              <div className="w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)", height: 8 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${viability.successRate}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: strategy.color }}
                />
              </div>
            </div>

            {/* Tiempo y tamaño */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.08em" }}>TIEMPO DE ACCIÓN</div>
                <div style={{ color: viability.feasible ? "#4ade80" : "#f87171", fontWeight: 800, fontSize: "0.92rem", marginTop: 4 }}>
                  {viability.feasible ? "Suficiente" : "Insuficiente"}
                </div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", marginTop: 2 }}>
                  {viability.feasible ? `${leadTimeYears} años disponibles` : `Faltan ${strategy.minLeadYears - leadTimeYears} año(s)`}
                </div>
              </div>
              <div className="p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.08em" }}>TAMAÑO OBJETIVO</div>
                <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 800, fontSize: "0.92rem", marginTop: 4 }}>{diameterM} m</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", marginTop: 2 }}>
                  {diameterM <= strategy.maxDiameterM ? "Dentro del rango" : "Excede el límite"}
                </div>
              </div>
            </div>

            {/* Alerta tiempo insuficiente */}
            {!viability.feasible && (
              <div className="flex gap-2.5 p-3 rounded-2xl" style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.22)" }}>
                <AlertTriangle size={13} style={{ color: "#fb923c", flexShrink: 0, marginTop: 1 }} />
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.76rem", lineHeight: 1.55 }}>
                  Requiere mínimo {strategy.minLeadYears} años. Con {leadTimeYears} año(s) la probabilidad cae drásticamente.
                  Considera la <strong style={{ color: "#fb923c" }}>Explosión Nuclear</strong> (mínimo 2 años).
                </p>
              </div>
            )}

            {/* Retroalimentación */}
            <div className="p-3.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${verdictColor}33` }}>
              <div style={{ color: verdictColor, fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.08em", marginBottom: 6 }}>RETROALIMENTACIÓN</div>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.82rem", lineHeight: 1.65 }}>{verdict}</p>
            </div>

            {/* Mejor estrategia (si no es la recomendada) */}
            {!isRecommended && (
              <div className="flex gap-2.5 p-3.5 rounded-2xl" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.22)" }}>
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{recommendedStrategy.emoji}</span>
                <div>
                  <div style={{ color: "#10b981", fontWeight: 700, fontSize: "0.76rem" }}>Mejor estrategia para esta amenaza</div>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.74rem", marginTop: 2 }}>
                    <strong style={{ color: "rgba(255,255,255,0.85)" }}>{recommendedStrategy.name}</strong> ofrece el mejor
                    equilibrio de efectividad y viabilidad con tus parámetros actuales.
                  </div>
                </div>
              </div>
            )}

            {/* Métricas */}
            <div className="space-y-2 p-3.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>MÉTRICAS</div>
              <div className="flex justify-between" style={{ fontSize: "0.72rem" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Tasa de éxito</span>
                <span style={{ color: strategy.color, fontWeight: 700 }}>{viability.successRate}%</span>
              </div>
              <ProgressBar value={viability.successRate} color={strategy.color} />
              <div className="flex justify-between pt-1" style={{ fontSize: "0.72rem" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Efectividad</span>
                <span style={{ color: strategy.color, fontWeight: 700 }}>{viability.effectiveness}%</span>
              </div>
              <ProgressBar value={viability.effectiveness} color={strategy.color} />
            </div>

            {/* Cómo funciona */}
            <div className="p-3.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>¿CÓMO FUNCIONA?</div>
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.8rem", lineHeight: 1.65 }}>{strategy.description}</p>
            </div>

            {/* Notas técnicas */}
            <div className="space-y-2">
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.08em" }}>CONSIDERACIONES TÉCNICAS</div>
              {strategy.notes.map((note, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span style={{ fontSize: "0.88rem", flexShrink: 0 }}>{note.icon}</span>
                  <p style={{ color: "rgba(255,255,255,0.62)", fontSize: "0.77rem", lineHeight: 1.55 }}>{note.text}</p>
                </div>
              ))}
            </div>

            {/* Detalles */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "COSTO", value: strategy.cost },
                { label: "TECNOLOGÍA", value: strategy.techReadiness },
                { label: "TIEMPO MÍNIMO", value: `${strategy.minLeadYears} años` },
                { label: "DIÁMETRO MÁX.", value: `${strategy.maxDiameterM} m` },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ color: strategy.color, fontWeight: 800, fontSize: "0.76rem" }}>{item.value}</div>
                  <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.58rem", marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl font-bold transition-all hover:scale-[1.02]"
              style={{ background: `${strategy.color}18`, border: `1px solid ${strategy.color}44`, color: strategy.color, fontSize: "0.82rem" }}
            >
              Cerrar evaluación
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function DefensaPlanetaria() {
  const location = useLocation();
  const navigate = useNavigate();
  const { inputParameters: inputs } = location.state || {};

  const [leadTimeYears, setLeadTimeYears] = useState(10);
  const [selectedId, setSelectedId] = useState(null);

  // Elimina scroll horizontal causado por zoom: 1.25
  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => { document.body.style.overflowX = ""; };
  }, []);

  const isMetallic = inputs?.composition === "metallic" || inputs?.composition === "Metálico";
  const diameterM = inputs?.diameter_km != null ? Math.round(inputs.diameter_km * 1000) : (inputs?.diameter_m ?? 200);
  const velocityKms = inputs?.velocity_kms ?? inputs?.velocity_km_s ?? 15;

  const viabilities = useMemo(() => {
    return STRATEGIES.reduce((acc, s) => {
      acc[s.id] = calcViability(s, { diameterM, leadTimeYears, isMetallic, velocityKms });
      return acc;
    }, {});
  }, [diameterM, leadTimeYears, isMetallic, velocityKms]);

  const recommendedStrategy = useMemo(() => {
    const feasible = STRATEGIES.filter((s) => viabilities[s.id].feasible);
    const pool = feasible.length > 0 ? feasible : STRATEGIES;
    return pool.reduce((best, s) =>
      viabilities[s.id].overallScore > viabilities[best.id].overallScore ? s : best
    );
  }, [viabilities]);

  const selectedStrategy = STRATEGIES.find((s) => s.id === selectedId);

  if (!inputs) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ background: "#000000" }}>
        <div className="text-center p-8">
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🛡️</div>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", marginBottom: 24 }}>No hay datos de simulación disponibles.</p>
          <button
            onClick={() => navigate("/skyfallx-game")}
            className="px-6 py-3 rounded-2xl font-bold transition-all hover:scale-105"
            style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)", color: "#10b981" }}
          >
            ← Crear una simulación
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-screen" style={{ zoom: 1.25, background: "#000000" }}>

        {/* ── Header ── */}
        <div className="px-6 pt-10 pb-6 flex justify-between items-start">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: "#ffffff", fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.02em", textShadow: "0 0 24px rgba(16,185,129,0.4)" }}
            >
              Defensa Planetaria
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", marginTop: 4 }}>
              Evalúa las estrategias de mitigación según los parámetros de tu simulación.
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex gap-2 flex-shrink-0 mt-1">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", fontWeight: 600 }}
            >
              <ChevronLeft size={13} /> Resultados
            </button>
            <button
              onClick={() => navigate("/skyfallx-game")}
              className="px-3 py-2 rounded-xl transition-all hover:scale-105"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.28)", color: "#10b981", fontSize: "0.78rem", fontWeight: 600 }}
            >
              Nuevo asteroide →
            </button>
          </motion.div>
        </div>

        <div className="px-6 pb-12 space-y-5">

          {/* ── Parámetros de la amenaza ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>
              PARÁMETROS DE LA AMENAZA
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Diámetro", value: `${diameterM} m` },
                { label: "Velocidad", value: `${velocityKms} km/s` },
                { label: "Composición", value: isMetallic ? "Metálico" : "Roca" },
                { label: "Ángulo", value: `${inputs?.angle_deg ?? "?"}°` },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ color: "rgba(255,255,255,0.85)", fontWeight: 800, fontSize: "1rem" }}>{item.value}</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.66rem", marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Slider de tiempo ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <div className="flex justify-between items-center mb-3">
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em" }}>
                TIEMPO DISPONIBLE ANTES DEL IMPACTO
              </div>
              <span style={{ color: "#10b981", fontWeight: 800, fontSize: "1.15rem" }}>
                {leadTimeYears} {leadTimeYears === 1 ? "año" : "años"}
              </span>
            </div>
            <input type="range" min={1} max={20} value={leadTimeYears}
              onChange={(e) => setLeadTimeYears(Number(e.target.value))}
              className="w-full cursor-pointer" style={{ accentColor: "#10b981" }} />
            <div className="flex justify-between mt-1" style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.64rem" }}>
              <span>1 año</span><span>10 años</span><span>20 años</span>
            </div>
          </motion.div>

          {/* ── Estrategia recomendada ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-5" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{ width: 44, height: 44, background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.4)", fontSize: "1.2rem" }}>
                {recommendedStrategy.emoji}
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em" }}>
                  ESTRATEGIA RECOMENDADA PARA ESTA AMENAZA
                </div>
                <div style={{ color: "#10b981", fontWeight: 800, fontSize: "1.05rem", marginTop: 2 }}>{recommendedStrategy.name}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", marginTop: 2 }}>
                  Mejor equilibrio entre efectividad y viabilidad con tus parámetros actuales.
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Grid de estrategias ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>
              SELECCIONA UNA ESTRATEGIA PARA VER SU EVALUACIÓN
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {STRATEGIES.map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  viability={viabilities[strategy.id]}
                  isRecommended={strategy.id === recommendedStrategy.id}
                  onClick={() => setSelectedId(strategy.id)}
                />
              ))}
            </div>
          </motion.div>

          {/* ── Navegación inferior ── */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <button onClick={() => navigate(-1)} className="px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: "0.88rem" }}>
              ← Volver a resultados
            </button>
            <button onClick={() => navigate("/skyfallx-game")} className="px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontSize: "0.88rem" }}>
              Probar otro asteroide →
            </button>
          </div>
        </div>

        <p className="text-center pb-6" style={{ color: "rgba(255,255,255,0.18)", fontSize: "0.7rem" }}>
          Estrategias basadas en literatura científica de NASA, ESA y la comunidad de defensa planetaria.
        </p>
      </div>

      {/* Modal fuera del zoom */}
      <AnimatePresence>
        {selectedStrategy && (
          <AssessmentModal
            strategy={selectedStrategy}
            viability={viabilities[selectedStrategy.id]}
            recommendedStrategy={recommendedStrategy}
            leadTimeYears={leadTimeYears}
            diameterM={diameterM}
            isRecommended={selectedStrategy.id === recommendedStrategy.id}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

