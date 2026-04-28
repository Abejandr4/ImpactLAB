import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface AsteroidType {
  id: string;
  name: string;
  icon: string;
  color: string;
  pct: number;
  props: { label: string; value: number; unit: string; color: string }[];
  fact: string;
  examples: string[];
}

const types: AsteroidType[] = [
  {
    id: "C",
    name: "Tipo C — Carbonáceo",
    icon: "🌑",
    color: "#94a3b8",
    pct: 75,
    props: [
      { label: "Abundancia", value: 75, unit: "%", color: "#60a5fa" },
      { label: "Densidad", value: 40, unit: "baja", color: "#a78bfa" },
      { label: "Brillo (Albedo)", value: 5, unit: "%", color: "#fbbf24" },
      { label: "Contenido de agua", value: 80, unit: "%", color: "#34d399" },
    ],
    fact: "Son los más oscuros del sistema solar — reflejan menos luz que el asfalto. ¡Podrían haber traído agua y aminoácidos a la Tierra primitiva! 💧",
    examples: ["Ryugu", "Bennu", "Ceres"],
  },
  {
    id: "S",
    name: "Tipo S — Silíceo",
    icon: "🪨",
    color: "#f97316",
    pct: 17,
    props: [
      { label: "Abundancia", value: 17, unit: "%", color: "#60a5fa" },
      { label: "Densidad", value: 65, unit: "media", color: "#a78bfa" },
      { label: "Brillo (Albedo)", value: 25, unit: "%", color: "#fbbf24" },
      { label: "Contenido de agua", value: 5, unit: "%", color: "#34d399" },
    ],
    fact: "Son rocosos y brillantes. ¡Contienen olivino, piroxeno y metales! Son los más comunes entre los NEOs cercanos a la Tierra.",
    examples: ["Itokawa", "Eros", "Gaspra"],
  },
  {
    id: "M",
    name: "Tipo M — Metálico",
    icon: "⚙️",
    color: "#e2e8f0",
    pct: 8,
    props: [
      { label: "Abundancia", value: 8, unit: "%", color: "#60a5fa" },
      { label: "Densidad", value: 95, unit: "alta", color: "#a78bfa" },
      { label: "Brillo (Albedo)", value: 50, unit: "%", color: "#fbbf24" },
      { label: "Contenido de agua", value: 0, unit: "%", color: "#34d399" },
    ],
    fact: "¡Son los más valiosos! Principalmente hierro y níquel. Un asteroide M de 500 m contiene más metales preciosos que toda la producción humana de un siglo. 💎",
    examples: ["Psique (16 Psyche)", "Hermes", "Baco"],
  },
];

export function AsteroidTypeExplorer() {
  const [selected, setSelected] = useState<string | null>(null);
  const active = types.find((t) => t.id === selected);

  return (
    <div>
      <p className="mb-4" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem" }}>
        👇 Toca un tipo para explorar sus características:
      </p>
      <div className="grid grid-cols-3 gap-3">
        {types.map((t) => (
          <motion.button
            key={t.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelected(selected === t.id ? null : t.id)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200"
            style={{
              background: selected === t.id ? `${t.color}22` : "rgba(255,255,255,0.05)",
              border: `2px solid ${selected === t.id ? t.color : "rgba(255,255,255,0.1)"}`,
              boxShadow: selected === t.id ? `0 0 20px ${t.color}44` : "none",
            }}
          >
            <span style={{ fontSize: "2rem" }}>{t.icon}</span>
            <span
              style={{
                color: selected === t.id ? t.color : "rgba(255,255,255,0.7)",
                fontWeight: 700,
                fontSize: "0.8rem",
              }}
            >
              Tipo {t.id}
            </span>
            <div
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: `${t.color}22`,
                color: t.color,
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            >
              {t.pct}%
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className="p-4 rounded-2xl"
              style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${active.color}44` }}
            >
              <h4 className="mb-3" style={{ color: active.color, fontWeight: 700, fontSize: "0.9rem" }}>
                {active.icon} {active.name}
              </h4>

              <div className="space-y-3 mb-4">
                {active.props.map((p, i) => (
                  <div key={p.label}>
                    <div className="flex justify-between mb-1">
                      <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.75rem" }}>{p.label}</span>
                      <span style={{ color: p.color, fontSize: "0.75rem", fontWeight: 700 }}>
                        {p.value}{p.label === "Abundancia" || p.label === "Brillo (Albedo)" || p.label === "Contenido de agua" ? "%" : ""}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${p.value}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: p.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="p-3 rounded-xl mb-3"
                style={{ background: `${active.color}11`, border: `1px solid ${active.color}33` }}
              >
                <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.82rem", lineHeight: 1.6 }}>
                  💡 {active.fact}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem" }}>Ejemplos:</span>
                {active.examples.map((ex) => (
                  <span
                    key={ex}
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      background: `${active.color}22`,
                      border: `1px solid ${active.color}44`,
                      color: active.color,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                    }}
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
