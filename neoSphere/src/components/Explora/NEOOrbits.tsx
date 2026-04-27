import { useState } from "react";
import { motion } from "motion/react";

interface NEOFamily {
  id: string;
  name: string;
  color: string;
  orbitRx: number;
  orbitRy: number;
  desc: string;
  danger: number;
  count: string;
  icon: string;
}

const families: NEOFamily[] = [
  {
    id: "atiras",
    name: "Atiras",
    color: "#ef4444",
    orbitRx: 60,
    orbitRy: 22,
    desc: "Su órbita queda completamente dentro de la de la Tierra. ¡Son los más interiores! Muy raros y difíciles de detectar porque están cerca del Sol.",
    danger: 40,
    count: "~30",
    icon: "🔴",
  },
  {
    id: "atones",
    name: "Atones",
    color: "#f97316",
    orbitRx: 78,
    orbitRy: 30,
    desc: "Cruzan la órbita terrestre pero su 'casa' principal está dentro de ella. Son los más peligrosos potencialmente.",
    danger: 80,
    count: "~2,200",
    icon: "🟠",
  },
  {
    id: "apolos",
    name: "Apolos",
    color: "#fbbf24",
    orbitRx: 115,
    orbitRy: 38,
    desc: "Cruzan la órbita de la Tierra y su órbita es más grande. ¡Son los más numerosos de los NEOs! Incluye asteroides famosos como Apophis.",
    danger: 65,
    count: "~18,000",
    icon: "🟡",
  },
  {
    id: "amores",
    name: "Amores",
    color: "#34d399",
    orbitRx: 140,
    orbitRy: 48,
    desc: "Su órbita está entre la Tierra y Marte. No cruzan la órbita terrestre por ahora, pero su trayectoria puede cambiar con el tiempo.",
    danger: 25,
    count: "~12,000",
    icon: "🟢",
  },
];

export function NEOOrbits() {
  const [selected, setSelected] = useState<string | null>(null);
  const active = families.find((f) => f.id === selected);

  return (
    <div>
      <p className="mb-3" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem" }}>
        🌍 Selecciona una familia para ver su órbita y aprender sobre ella:
      </p>

      {/* Orbit diagram */}
      <div className="relative flex items-center justify-center mb-4" style={{ height: 200 }}>
        <svg width="100%" height="200" viewBox="0 0 320 200" style={{ overflow: "visible" }}>
          {/* Sun */}
          <circle cx="160" cy="100" r="12" fill="url(#sunGrad)" />
          <defs>
            <radialGradient id="sunGrad">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#f97316" />
            </radialGradient>
          </defs>
          {/* Glow */}
          <circle cx="160" cy="100" r="18" fill="none" stroke="#fbbf2455" strokeWidth="4" />

          {/* Earth orbit */}
          <ellipse cx="160" cy="100" rx="95" ry="35" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4 3" />

          {/* Earth */}
          <motion.circle
            cx="255"
            cy="100"
            r="7"
            fill="url(#earthGrad)"
            animate={{ cx: [255, 160, 65, 160, 255], cy: [100, 65, 100, 135, 100] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <defs>
            <radialGradient id="earthGrad">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </radialGradient>
          </defs>

          {/* NEO family orbits */}
          {families.map((f) => {
            const isSelected = selected === f.id;
            return (
              <g key={f.id}>
                <ellipse
                  cx="160"
                  cy="100"
                  rx={f.orbitRx}
                  ry={f.orbitRy}
                  fill="none"
                  stroke={isSelected ? f.color : `${f.color}44`}
                  strokeWidth={isSelected ? 2.5 : 1}
                  strokeDasharray={isSelected ? "none" : "3 3"}
                />
                {/* Animated asteroid dot */}
                {isSelected && (
                  <motion.circle
                    cx={160 + f.orbitRx}
                    cy={100}
                    r={5}
                    fill={f.color}
                    style={{ filter: `drop-shadow(0 0 4px ${f.color})` }}
                    animate={{
                      cx: [160 + f.orbitRx, 160, 160 - f.orbitRx, 160, 160 + f.orbitRx],
                      cy: [100, 100 - f.orbitRy, 100, 100 + f.orbitRy, 100],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </g>
            );
          })}

          {/* Labels */}
          <text x="160" y="116" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="bold">☀️</text>
          <text x="255" y="92" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">🌍</text>
        </svg>
      </div>

      {/* Family selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {families.map((f) => (
          <motion.button
            key={f.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelected(selected === f.id ? null : f.id)}
            className="flex flex-col items-center gap-1 p-3 rounded-xl"
            style={{
              background: selected === f.id ? `${f.color}22` : "rgba(255,255,255,0.05)",
              border: `1px solid ${selected === f.id ? f.color : "rgba(255,255,255,0.1)"}`,
              boxShadow: selected === f.id ? `0 0 14px ${f.color}44` : "none",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{f.icon}</span>
            <span style={{ color: selected === f.id ? f.color : "rgba(255,255,255,0.65)", fontWeight: 700, fontSize: "0.78rem" }}>
              {f.name}
            </span>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.65rem" }}>{f.count}</span>
          </motion.button>
        ))}
      </div>

      {/* Info panel */}
      {active && (
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl"
          style={{ background: `${active.color}11`, border: `1px solid ${active.color}44` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: active.color, fontWeight: 700, fontSize: "0.88rem" }}>
              {active.icon} Familia {active.name}
            </span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem" }}>
              ~{active.count} conocidos
            </span>
          </div>
          <p className="mb-3" style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.82rem", lineHeight: 1.6 }}>
            {active.desc}
          </p>
          <div>
            <div className="flex justify-between mb-1">
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem" }}>Nivel de peligro potencial</span>
              <span style={{ color: active.color, fontSize: "0.72rem", fontWeight: 700 }}>{active.danger}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${active.danger}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: active.color }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
