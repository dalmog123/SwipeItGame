// components/Header.js
import React from "react";
import { motion } from "framer-motion";
import { Trophy, Clock, X } from "lucide-react";
import { FaHeart } from "react-icons/fa";

export default function Header({
  score,
  pageTimer,
  isInTutorial,
  extraLives,
  doubleScoreActive,
}) {
  // Calculate potential bonus (only for non-tutorial)
  const getPotentialBonus = () => {
    if (isInTutorial) return null;
    const targetBlockCount = Math.min(9, 1 + Math.floor(score / 75));
    const potentialBonus = roundToNearest5(pageTimer * targetBlockCount);
    return potentialBonus;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-bg-panel/70 backdrop-filter backdrop-blur-md border-b border-line p-3 sticky top-0 z-50"
      style={{ height: "7vh", maxHeight: "70px" }}
    >
      <div className="flex justify-between items-center max-w-md mx-auto h-full">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 h-full"
        >
          <Trophy className="text-neon-coin" size={22} />
          <span className="font-numeric text-xl font-bold text-ink-hi">
            {(score || 0).toLocaleString()}
          </span>
          {doubleScoreActive && (
            <div className="flex items-center text-neon-coin text-glow">
              <X size={16} />
              <span className="font-numeric text-lg font-bold">2</span>
            </div>
          )}
        </motion.div>

        {!isInTutorial && (
          <>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 h-full"
            >
              <FaHeart className="text-neon-danger" size={20} />
              <span className="font-numeric text-xl font-bold text-ink-hi">
                {extraLives || 0}
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              animate={pageTimer < 2 ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={
                pageTimer < 2
                  ? { duration: 0.5, repeat: Infinity }
                  : { duration: 0.2 }
              }
              className={`flex items-center space-x-2 bg-white/5 border rounded-full px-4 py-2 h-full ${
                pageTimer < 2 ? "border-neon-danger/60" : "border-white/10"
              }`}
            >
              <Clock
                className={pageTimer < 2 ? "text-neon-danger" : "text-neon-up"}
                size={20}
              />
              <span
                className={`font-numeric text-xl font-bold ${
                  pageTimer < 2 ? "text-neon-danger text-glow" : "text-ink-hi"
                }`}
              >
                {pageTimer.toFixed(1)}
              </span>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}

// Add this helper function
const roundToNearest5 = (num) => {
  return Math.round(num / 5) * 5;
};
