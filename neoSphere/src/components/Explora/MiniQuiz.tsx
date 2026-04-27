import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Trophy, ChevronRight, RotateCcw } from "lucide-react";

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface MiniQuizProps {
  questions: QuizQuestion[];
  color: string;
  onPass: () => void;
}

export function MiniQuiz({ questions, color, onPass }: MiniQuizProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [passed, setPassed] = useState(false);
  const [answered, setAnswered] = useState(false);

  const q = questions[current];

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      const finalScore = score + (selected === q.correct ? 1 : 0);
      const pass = finalScore >= 2;
      setPassed(pass);
      setDone(true);
      if (pass) onPass();
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setDone(false);
    setPassed(false);
  };

  const finalScore = done ? score : score + (selected === q?.correct ? 1 : 0);

  return (
    <div
      className="mt-6 rounded-2xl p-5"
      style={{
        background: "rgba(0,0,0,0.3)",
        border: `1px solid ${color}44`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <span
          className="flex items-center gap-2 px-3 py-1 rounded-full"
          style={{
            background: `${color}22`,
            border: `1px solid ${color}55`,
            color,
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          🎯 MINI QUIZ
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background:
                  i < current
                    ? color
                    : i === current && !done
                    ? `${color}88`
                    : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            <p
              className="mb-4"
              style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.5 }}
            >
              {current + 1}. {q.question}
            </p>

            <div className="space-y-2">
              {q.options.map((opt, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === q.correct;
                let bg = "rgba(255,255,255,0.05)";
                let border = "rgba(255,255,255,0.12)";
                let textColor = "rgba(255,255,255,0.75)";

                if (answered) {
                  if (isCorrect) {
                    bg = "rgba(34,197,94,0.15)";
                    border = "rgba(34,197,94,0.6)";
                    textColor = "#4ade80";
                  } else if (isSelected && !isCorrect) {
                    bg = "rgba(239,68,68,0.15)";
                    border = "rgba(239,68,68,0.6)";
                    textColor = "#f87171";
                  }
                } else if (isSelected) {
                  bg = `${color}22`;
                  border = `${color}88`;
                  textColor = color;
                }

                return (
                  <motion.button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    whileHover={!answered ? { scale: 1.01 } : {}}
                    whileTap={!answered ? { scale: 0.99 } : {}}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                    style={{
                      background: bg,
                      border: `1px solid ${border}`,
                      color: textColor,
                      cursor: answered ? "default" : "pointer",
                    }}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: answered
                          ? isCorrect
                            ? "rgba(34,197,94,0.3)"
                            : isSelected
                            ? "rgba(239,68,68,0.3)"
                            : "rgba(255,255,255,0.08)"
                          : "rgba(255,255,255,0.08)",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: textColor,
                      }}
                    >
                      {answered ? (
                        isCorrect ? (
                          <Check size={12} />
                        ) : isSelected ? (
                          <X size={12} />
                        ) : (
                          String.fromCharCode(65 + idx)
                        )
                      ) : (
                        String.fromCharCode(65 + idx)
                      )}
                    </span>
                    <span style={{ fontSize: "0.85rem" }}>{opt}</span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 rounded-xl"
                  style={{
                    background: selected === q.correct ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    border: `1px solid ${selected === q.correct ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                  }}
                >
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem", lineHeight: 1.5 }}>
                    {selected === q.correct ? "✅ " : "💡 "}
                    {q.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {answered && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl ml-auto"
                style={{
                  background: `linear-gradient(135deg, ${color}88, ${color}55)`,
                  border: `1px solid ${color}66`,
                  color: "white",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                {current + 1 >= questions.length ? "Ver resultado" : "Siguiente"}
                <ChevronRight size={16} />
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div style={{ fontSize: "2.5rem" }}>
              {passed ? "🏆" : "💪"}
            </div>
            <p
              className="mt-2"
              style={{
                color: passed ? "#fbbf24" : "rgba(255,255,255,0.7)",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              {passed
                ? `¡Genial! ${finalScore}/${questions.length} correctas`
                : `${finalScore}/${questions.length} correctas — ¡Casi!`}
            </p>
            <p className="mt-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
              {passed
                ? "¡Ganaste una estrella! ⭐"
                : "Necesitas 2 o más para ganar la estrella. ¡Inténtalo de nuevo!"}
            </p>
            {!passed && (
              <button
                onClick={restart}
                className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl mx-auto"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.82rem",
                }}
              >
                <RotateCcw size={14} />
                Intentar de nuevo
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
