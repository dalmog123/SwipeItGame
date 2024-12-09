import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PauseMenu({ onResume, onQuit }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl p-6 flex flex-col gap-4 w-[80%] max-w-[300px]"
        >
          <button
            onClick={onResume}
            className="bg-green-500 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors"
          >
            Resume
          </button>
          <button
            onClick={onQuit}
            className="bg-red-500 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Quit
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
