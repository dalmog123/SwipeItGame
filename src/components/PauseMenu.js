import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Home } from "lucide-react";
import { colors } from "../config/designTokens";

export default function PauseMenu({ onResume, onRestart, onHome, score = 0 }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center px-6"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="w-full max-w-[320px] rounded-3xl border border-line bg-bg-panel p-6 flex flex-col items-center gap-5 shadow-2xl"
        >
          <h2 className="font-display text-2xl font-bold uppercase tracking-[0.25em] text-ink-hi">
            Paused
          </h2>

          <div className="flex flex-col items-center">
            <span className="font-display text-5xl font-bold text-ink-hi text-glow">
              {(score || 0).toLocaleString()}
            </span>
            <span className="font-numeric text-xs uppercase tracking-widest text-ink-lo mt-1">
              Points
            </span>
          </div>

          <div className="flex w-full flex-col gap-3">
            <button
              onClick={onResume}
              className="flex items-center justify-center gap-2 rounded-full py-3 font-display uppercase tracking-widest text-ink-hi"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,46,147,0.2), rgba(56,189,248,0.2))",
                border: `2px solid ${colors.blocks.doubleTap}`,
                boxShadow: `0 0 16px ${colors.blocks.doubleTap}55`,
                textShadow: "0 0 8px rgba(245,247,255,0.5)",
              }}
            >
              <Play className="h-5 w-5 fill-current" /> Resume
            </button>
            <button
              onClick={onRestart}
              className="flex items-center justify-center gap-2 rounded-full py-3 font-numeric font-semibold uppercase tracking-wider text-ink-hi bg-white/5 border border-white/15 hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="h-5 w-5" /> Restart
            </button>
            <button
              onClick={onHome}
              className="flex items-center justify-center gap-2 rounded-full py-3 font-numeric font-semibold uppercase tracking-wider text-ink-lo bg-white/5 border border-white/15 hover:bg-white/10 transition-colors"
            >
              <Home className="h-5 w-5" /> Home
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
