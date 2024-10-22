// components/Header.js
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock } from 'lucide-react';

export default function Header({ score, timer, isInTutorial }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-sm shadow-lg p-3 sticky top-0 z-50"
      style={{ height: '7vh', maxHeight:"70px" }} // Use vh for responsive height
    >
      <div className="flex justify-between items-center max-w-md mx-auto h-full"> {/* Ensure inner div takes full height */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2 h-full" // Full height to center content
        >
          <Trophy className="text-yellow-300" size={24} />
          <span className="text-xl font-bold text-white">
            {(score || 0).toLocaleString()}
          </span>
        </motion.div>
        {!isInTutorial && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2 h-full" // Full height for consistent alignment
          >
            <Clock className="text-green-300" size={24} />
            <span className="text-xl font-bold text-white">
              {(timer || 0).toFixed(1)}s
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
