import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Strategy {
  id: string;
  icon: string;
  name: string;
  color: string;
  timeNeeded: string;
  effectiveness: number;
  risk: number;
  howItWorks: string;
  outcome: string;
  realExample?: string;
}

const strategies: Strategy[] = [
  {
    id: "kinetic",
    icon: "💥",
    name: "Impacto Cinético",
    color: "#f97316",
    timeNeeded: "10+ años",
    effectiveness: 85,
    risk: 20,
    howItWorks:
      "Lanzamos una nave espacial a máxima velocidad directo hacia el asteroide. El choque cambia ligeramente su velocidad, lo que con el tiempo desvía su trayectoria lo suficiente para evitar la Tierra.",
    outcome:
      "✅ ¡ÉXITO! La nave impacta y desacelera el asteroide 3.6 mm/s. En 10 años esto equivale a miles de kilómetros de diferencia. ¡La Tierra está a salvo!",
    realExample: "Misión DART (NASA, 2022) — ¡Probado y funcionó!",
  },
  {
    id: "nuclear",
    icon: "☢️",
    name: "Explosión Nuclear",
    color: "#a855f7",
    timeNeeded: "5+ años",
    effectiveness: 90,
    risk: 55,
    howItWorks:
      "Detonamos una bomba nuclear cerca del asteroide (sin tocarlo). El calor vaporiza parte de su superficie y esa vaporización actúa como un cohete natural que lo empuja en otra dirección.",
    outcome:
      "✅ ¡ÉXITO! La explosión desvía el asteroide pero lo fragmenta parcialmente. Algunos trozos pequeños llegan a la atmósfera y explotan como bólidos inofensivos. Riesgoso pero efectivo.",
    realExample: "Solo teórico hasta ahora. Último recurso.",
  },
  {
    id: "gravity",
    icon: "🛸",
    name: "Tractor Gravitacional",
    color: "#22d3ee",
    timeNeeded: "20+ años",
    effectiveness: 70,
    risk: 5,
    howItWorks:
      "Una nave espacial vuela muy cerca del asteroide durante años. La gravedad de la nave, aunque sea pequeñísima, va tirando del asteroide muy suavemente hasta desviar su curso.",
    outcome:
      "✅ ¡ÉXITO (muy lento)! Requiere mucho tiempo pero es el más seguro. La nave no toca el asteroide, no hay riesgo de fragmentación. Perfecto para amenazas detectadas con décadas de anticipación.",
    realExample: "Propuesto pero no implementado aún.",
  },
  {
    id: "evacuation",
    icon: "🚨",
    name: "Evacuación",
    color: "#4ade80",
    timeNeeded: "Semanas/meses",
    effectiveness: 45,
    risk: 30,
    howItWorks:
      "Si no podemos desviar el asteroide, al menos advertimos a las poblaciones de la zona de impacto para que evacúen. El área exacta puede calcularse con precisión.",
    outcome:
      "⚠️ El impacto ocurre pero se salvan muchas vidas. La destrucción material es enorme, pero al menos protegemos a las personas. Una detección temprana es clave.",
    realExample: "Chelyabinsk 2013: sin evacuación, 1,600 heridos. Con aviso, habrían sido pocos.",
  },
];

export function DefenseStrategy() {
  const [selected, setSelected] = useState<string | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const active = strategies.find((s) => s.id === selected);

  const handleSelect = (id: string) => {
    if (selected === id) {
      setSelected(null);
      setShowOutcome(false);
    } else {
      setSelected(id);
      setShowOutcome(false);
    }
  };

  return (
    <div>
      <p className="mb-4" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem" }}>
        🛡️ Un asteroide de 300m se dirige hacia la Tierra en 15 años. <strong style={{ color: "white" }}>¿Cuál estrategia eliges?</strong>
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {strategies.map((s) => (
          <motion.button
            key={s.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(s.id)}
            className="flex flex-col items-start gap-2 p-3 rounded-xl text-left"
            style={{
              background: selected === s.id ? `${s.color}18` : "rgba(255,255,255,0.04)",
              border: `2px solid ${selected === s.id ? s.color : "rgba(255,255,255,0.1)"}`,
              boxShadow: selected === s.id ? `0 0 16px ${s.color}33` : "none",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
            <span
              style={{
                color: selected === s.id ? s.color : "rgba(255,255,255,0.75)",
                fontWeight: 700,
                fontSize: "0.82rem",
              }}
            >
              {s.name}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: `${s.color}22`,
                color: s.color,
                fontSize: "0.68rem",
                fontWeight: 600,
              }}
            >
              ⏱ {s.timeNeeded}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${active.color}55` }}
          >
            <div className="p-4" style={{ background: `${active.color}11` }}>
              <h4 className="mb-2" style={{ color: active.color, fontWeight: 700, fontSize: "0.9rem" }}>
                {active.icon} {active.name} — ¿Cómo funciona?
              </h4>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.83rem", lineHeight: 1.6 }}>
                {active.howItWorks}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-3">
                {[
                  { label: "Efectividad", value: active.effectiveness, color: "#4ade80" },
                  { label: "Nivel de riesgo", value: active.risk, color: "#f87171" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between mb-1">
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem" }}>{m.label}</span>
                      <span style={{ color: m.color, fontSize: "0.72rem", fontWeight: 700 }}>{m.value}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.value}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: m.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {active.realExample && (
                <p className="mt-3" style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", fontStyle: "italic" }}>
                  📚 {active.realExample}
                </p>
              )}

              {!showOutcome ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowOutcome(true)}
                  className="mt-4 w-full py-2 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${active.color}44, ${active.color}22)`,
                    border: `1px solid ${active.color}66`,
                    color: active.color,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  🚀 ¡Ejecutar misión y ver resultado!
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-3 rounded-xl"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: `1px solid ${active.color}55`,
                  }}
                >
                  <p style={{ color: "white", fontSize: "0.85rem", lineHeight: 1.6, fontWeight: 500 }}>
                    {active.outcome}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
