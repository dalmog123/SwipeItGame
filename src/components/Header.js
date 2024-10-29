// components/Header.js
import React from "react";
import { motion } from "framer-motion";
import { Trophy, Clock, Heart, X } from "lucide-react";

export default function Header({
  score,
  timer,
  isInTutorial,
  extraLives,
  doubleScoreActive,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-sm shadow-lg p-3 sticky top-0 z-50"
      style={{ height: "7vh", maxHeight: "70px" }}
    >
      <div className="flex justify-between items-center max-w-md mx-auto h-full">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2 h-full"
        >
          <Trophy className="text-yellow-300" size={24} />
          <span className="text-xl font-bold text-white">
            {(score || 0).toLocaleString()}
          </span>
          {doubleScoreActive && (
            <div className="flex items-center text-yellow-300">
              <X size={16} />
              <span className="text-lg font-bold">2</span>
            </div>
          )}
        </motion.div>

        {!isInTutorial && (
          <>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2 h-full"
            >
              <Heart className="text-red-500" size={24} />
              <span className="text-xl font-bold text-white">
                {extraLives || 0}
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2 h-full"
            >
              <Clock className="text-green-300" size={24} />
              <span className="text-xl font-bold text-white">
                {(timer || 0).toFixed(1)}s
              </span>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
