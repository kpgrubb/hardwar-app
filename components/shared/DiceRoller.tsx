"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DiceRoller() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);

  const roll = useCallback(() => {
    setRolling(true);
    // Brief animation delay
    setTimeout(() => {
      const rolls = Array.from({ length: count }, () =>
        Math.floor(Math.random() * 12) + 1
      );
      setResults(rolls);
      setRolling(false);
    }, 150);
  }, [count]);

  const total = results.reduce((a, b) => a + b, 0);

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-accent text-dark flex items-center justify-center cursor-pointer hover:bg-accent-dark transition-colors shadow-lg border-none"
        aria-label="Dice Roller"
      >
        <span className="text-display-card">D12</span>
      </button>

      {/* Roller panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 z-40 w-64 bg-bg-card border border-dark-20 shadow-lg"
          >
            {/* Header */}
            <div className="bg-dark px-4 py-2 flex items-center justify-between">
              <span className="text-display-section text-white">Dice Roller</span>
              <button
                onClick={() => setOpen(false)}
                className="text-micro text-dark-50 hover:text-white bg-transparent border-none cursor-pointer"
              >
                X
              </button>
            </div>

            <div className="p-4">
              {/* Count selector */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-micro text-dark-50">DICE</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => setCount(n)}
                      className={`w-7 h-7 text-micro border cursor-pointer transition-colors ${
                        count === n
                          ? "bg-accent text-dark border-accent"
                          : "bg-transparent text-dark-50 border-dark-20 hover:border-dark-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roll button */}
              <button
                onClick={roll}
                disabled={rolling}
                className="w-full text-display-section bg-accent text-dark py-2.5 border-none cursor-pointer hover:bg-accent-dark transition-colors disabled:opacity-50 mb-4"
              >
                {rolling ? "ROLLING..." : `ROLL ${count}D12`}
              </button>

              {/* Results */}
              {results.length > 0 && (
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {results.map((r, i) => (
                      <motion.div
                        key={`${i}-${r}`}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`w-10 h-10 flex items-center justify-center border ${
                          r === 12
                            ? "bg-accent text-dark border-accent"
                            : r >= 11
                            ? "bg-accent-glow text-dark border-accent"
                            : "bg-surface text-dark border-dark-20"
                        }`}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "18px",
                            fontWeight: 700,
                          }}
                        >
                          {r}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  {results.length > 1 && (
                    <div className="text-micro text-dark-50">
                      TOTAL: <span className="text-dark">{total}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
