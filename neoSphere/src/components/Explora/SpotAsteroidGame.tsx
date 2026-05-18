import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Target } from "lucide-react";

interface Dot {
  id: number;
  x: number;
  y: number;
  isAsteroid: boolean;
  clicked: boolean;
  size: number;
}

function generateDots(): Dot[] {
  const dots: Dot[] = [];
  const asteroidPositions: { x: number; y: number }[] = [];
  const ASTEROID_COUNT = 6;
  const STAR_COUNT = 22;

  // Generate asteroid positions first
  for (let i = 0; i < ASTEROID_COUNT; i++) {
    let x: number, y: number;
    let tooClose: boolean;
    let attempts = 0;
    do {
      x = 6 + Math.random() * 88;
      y = 6 + Math.random() * 88;
      tooClose = asteroidPositions.some(
        (p) => Math.abs(p.x - x) < 12 && Math.abs(p.y - y) < 12
      );
      attempts++;
    } while (tooClose && attempts < 30);
    asteroidPositions.push({ x, y });
    dots.push({
      id: i,
      x,
      y,
      isAsteroid: true,
      clicked: false,
      size: 8 + Math.random() * 5,
    });
  }

  // Generate star positions
  for (let i = 0; i < STAR_COUNT; i++) {
    let x: number, y: number;
    let tooClose: boolean;
    let attempts = 0;
    do {
      x = 3 + Math.random() * 94;
      y = 3 + Math.random() * 94;
      tooClose = dots.some(
        (d) => Math.abs(d.x - x) < 8 && Math.abs(d.y - y) < 8
      );
      attempts++;
    } while (tooClose && attempts < 30);
    dots.push({
      id: ASTEROID_COUNT + i,
      x,
      y,
      isAsteroid: false,
      clicked: false,
      size: 2 + Math.random() * 2,
    });
  }

  return dots;
}

export function SpotAsteroidGame() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "done">("idle");
  const [dots, setDots] = useState<Dot[]>([]);
  const [timeLeft, setTimeLeft] = useState(25);
  const [score, setScore] = useState(0);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [flash, setFlash] = useState<{ x: number; y: number; ok: boolean; id: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalAsteroids = 6;

  const startGame = () => {
    setDots(generateDots());
    setScore(0);
    setWrongClicks(0);
    setTimeLeft(25);
    setGameState("playing");
  };

  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            setGameState("done");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const handleDotClick = useCallback(
    (dot: Dot, e: React.MouseEvent) => {
      if (gameState !== "playing" || dot.clicked) return;
      e.stopPropagation();

      const rect = (e.currentTarget as HTMLElement)
        .closest(".game-field")!
        .getBoundingClientRect();
      const fx = ((e.clientX - rect.left) / rect.width) * 100;
      const fy = ((e.clientY - rect.top) / rect.height) * 100;

      setFlash({ x: fx, y: fy, ok: dot.isAsteroid, id: Date.now() });
      setTimeout(() => setFlash(null), 600);

      if (dot.isAsteroid) {
        setDots((prev) =>
          prev.map((d) => (d.id === dot.id ? { ...d, clicked: true } : d))
        );
        const newScore = score + 1;
        setScore(newScore);
        if (newScore >= totalAsteroids) {
          clearInterval(timerRef.current!);
          setGameState("done");
        }
      } else {
        setWrongClicks((w) => w + 1);
      }
    },
    [gameState, score]
  );

  const pct = (timeLeft / 25) * 100;
  const timerColor =
    pct > 50 ? "#4ade80" : pct > 25 ? "#fbbf24" : "#f87171";

  const getRating = () => {
    if (score === totalAsteroids && wrongClicks === 0) return { emoji: "🌟", text: "¡Perfecto! Eres un astrónomo experto.", color: "#fbbf24" };
    if (score >= 5) return { emoji: "🏆", text: "¡Excelente! Encontraste casi todos.", color: "#a78bfa" };
    if (score >= 3) return { emoji: "⭐", text: "¡Bien! Sigue practicando.", color: "#60a5fa" };
    return { emoji: "🔭", text: "¡Sigue intentando! Los asteroides son difíciles de encontrar.", color: "#94a3b8" };
  };

  return (
    <div>
      <div className="mb-3 flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
        <span style={{ fontSize: "1.2rem" }}>🔭</span>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.82rem", lineHeight: 1.6 }}>
          Los astrónomos detectan asteroides buscando objetos que se mueven en el cielo. En este juego, los <strong style={{ color: "#f97316" }}>asteroides naranja brillan y pulsan</strong> — las estrellas son blancas y quietas. ¡Encuéntralos todos!
        </p>
      </div>

      {gameState === "idle" && (
        <div className="text-center py-6">
          <div style={{ fontSize: "3rem" }}>🌌</div>
          <p className="mt-2 mb-4" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
            Tienes <strong style={{ color: "#fbbf24" }}>25 segundos</strong> para encontrar los <strong style={{ color: "#f97316" }}>6 asteroides</strong> escondidos entre las estrellas.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={startGame}
            className="px-6 py-3 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "white",
              fontWeight: 700,
              fontSize: "0.95rem",
              boxShadow: "0 0 24px rgba(139,92,246,0.4)",
            }}
          >
            🚀 ¡Comenzar!
          </motion.button>
        </div>
      )}

      {gameState === "playing" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock size={14} style={{ color: timerColor }} />
              <span style={{ color: timerColor, fontWeight: 700, fontSize: "0.9rem" }}>
                {timeLeft}s
              </span>
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: timerColor, width: `${pct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target size={14} style={{ color: "#f97316" }} />
              <span style={{ color: "#f97316", fontWeight: 700, fontSize: "0.9rem" }}>
                {score}/{totalAsteroids}
              </span>
              {wrongClicks > 0 && (
                <span style={{ color: "#f87171", fontSize: "0.78rem" }}>
                  ❌ ×{wrongClicks}
                </span>
              )}
            </div>
          </div>

          <div
            className="game-field relative rounded-2xl overflow-hidden cursor-crosshair"
            style={{
              height: 260,
              background: "radial-gradient(ellipse at center, #0a1628 0%, #000814 100%)",
              border: "1px solid rgba(139,92,246,0.3)",
            }}
          >
            {/* Stars / Asteroids */}
            {dots.map((dot) => (
              <motion.button
                key={dot.id}
                onClick={(e) => handleDotClick(dot, e)}
                initial={{ opacity: 0 }}
                animate={
                  dot.clicked
                    ? { opacity: 0, scale: 2 }
                    : dot.isAsteroid
                    ? {
                        opacity: 1,
                        x: [0, 2, -2, 1, -1, 0],
                        y: [0, -1, 2, -2, 1, 0],
                      }
                    : { opacity: 0.8 }
                }
                transition={
                  dot.isAsteroid && !dot.clicked
                    ? { repeat: Infinity, duration: 6 + Math.random() * 4, ease: "easeInOut" }
                    : { duration: 0.3 }
                }
                style={{
                  position: "absolute",
                  left: `${dot.x}%`,
                  top: `${dot.y}%`,
                  transform: "translate(-50%, -50%)",
                  width: dot.isAsteroid ? dot.size + 6 : dot.size + 4,
                  height: dot.isAsteroid ? dot.size + 6 : dot.size + 4,
                  borderRadius: "50%",
                  background: dot.isAsteroid
                    ? "radial-gradient(circle, #fb923c, #ea580c)"
                    : `rgba(255,255,255,${0.5 + Math.random() * 0.5})`,
                  boxShadow: dot.isAsteroid
                    ? "0 0 8px rgba(251,146,60,0.8), 0 0 16px rgba(251,146,60,0.4)"
                    : "none",
                  border: "none",
                  padding: 0,
                  cursor: "crosshair",
                  zIndex: dot.isAsteroid ? 2 : 1,
                  pointerEvents: dot.clicked ? "none" : "auto",
                }}
              />
            ))}

            {/* Click flash */}
            <AnimatePresence>
              {flash && (
                <motion.div
                  key={flash.id}
                  initial={{ opacity: 1, scale: 0.5 }}
                  animate={{ opacity: 0, scale: 2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    position: "absolute",
                    left: `${flash.x}%`,
                    top: `${flash.y}%`,
                    transform: "translate(-50%, -50%)",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: flash.ok
                      ? "rgba(34,197,94,0.5)"
                      : "rgba(239,68,68,0.5)",
                    pointerEvents: "none",
                  }}
                />
              )}
            </AnimatePresence>

            {/* Hint */}
            <div
              className="absolute bottom-2 left-0 right-0 text-center"
              style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.68rem", pointerEvents: "none" }}
            >
              Haz clic en los puntos naranja que brillan
            </div>
          </div>
        </div>
      )}

      {gameState === "done" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4"
        >
          {(() => {
            const r = getRating();
            return (
              <>
                <div style={{ fontSize: "3rem" }}>{r.emoji}</div>
                <p className="mt-2" style={{ color: r.color, fontWeight: 700, fontSize: "1rem" }}>
                  {score}/{totalAsteroids} asteroides encontrados
                </p>
                <p className="mt-1" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                  {r.text}
                </p>
                {wrongClicks > 0 && (
                  <p className="mt-1" style={{ color: "rgba(248,113,113,0.7)", fontSize: "0.78rem" }}>
                    {wrongClicks} clic{wrongClicks > 1 ? "s" : ""} en estrella{wrongClicks > 1 ? "s" : ""}
                  </p>
                )}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={startGame}
                  className="mt-4 px-5 py-2 rounded-xl"
                  style={{
                    background: "rgba(139,92,246,0.2)",
                    border: "1px solid rgba(139,92,246,0.4)",
                    color: "#a78bfa",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  🔄 Jugar de nuevo
                </motion.button>
              </>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
