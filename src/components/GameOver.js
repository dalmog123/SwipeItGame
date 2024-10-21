import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { BsFillBalloonHeartFill } from 'react-icons/bs'; // Import the balloon icon
import swipeItLogo from '../swipeitlogo.png'; // Adjust the path based on your folder structure

export default function GameOver({ score, resetGame }) {
  const [showScore, setShowScore] = useState(false);
  const [floatingElements, setFloatingElements] = useState([
    { icon: <BsFillBalloonHeartFill color="#FF6B6B" size={'6vh'} />, delay: 0, popped: false },  // Red balloon
    { icon: <BsFillBalloonHeartFill color="#FF006E" size={'6vh'} />, delay: 0.5, popped: false }, // Teal balloon
    { icon: <BsFillBalloonHeartFill color="#FFBE0B" size={'6vh'} />, delay: 1, popped: false },   // Yellow balloon
    { icon: <BsFillBalloonHeartFill color="#000000" size={'6vh'} />, delay: 1.5, popped: false },  // Black balloon
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setShowScore(true), 1000);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    return () => clearTimeout(timer);
  }, []);

  // Handle popping a balloon
  const handlePopBalloon = (index) => {
    const newBalloons = [...floatingElements];
    newBalloons[index].popped = true; // Mark the balloon as popped
    setFloatingElements(newBalloons); // Update the state
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-teal-300 to-green-500 p-4 sm:p-8 overflow-hidden">
      <div className="relative bg-gradient-to-br from-blue-300 via-teal-200 to-green-300 rounded-3xl shadow-2xl p-4 sm:p-8 mb-8 sm:mb-12 max-w-xs sm:max-w-md w-full text-center">
        <img
          src={swipeItLogo}
          alt="Swipe It Game Logo"
          className="mx-auto mb-4 sm:mb-6"
          style={{
            width: '50%',
            height: 'auto',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.3s ease',
          }}
        />

        <motion.h1
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 10 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600 mb-4 sm:mb-8"
        >
          Game Over!
        </motion.h1>

        <AnimatePresence>
          {showScore && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="bg-gradient-to-r from-green-500 to-green-600 p-2 sm:p-4 rounded-xl mb-4 sm:mb-8"
            >
              <span className="text-lg sm:text-xl font-bold text-white">Score: {score}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="px-6 py-2 sm:px-8 sm:py-3 bg-gradient-to-r from-green-500 to-blue-700 text-white rounded-full text-lg sm:text-2xl font-bold shadow-lg hover:shadow-xl transition duration-30 ease-in-out mb-4 sm:mb-8"
          onClick={resetGame}
          style={{
            marginBottom: 'env(safe-area-inset-bottom)', // Add this to ensure button isn't hidden behind the bottom bar
          }}
        >
          Swipe Again!
        </motion.button>

        {floatingElements.map((el, index) => (
          !el.popped && (
            <motion.div
              key={index}
              className="absolute"
              initial={{ y: '100vh' }}
              animate={{ y: '-100vh' }}
              transition={{
                duration: 10,
                repeat: Infinity,
                delay: el.delay,
                ease: 'linear',
              }}
              style={{
                left: `${29 * index}%`,
                filter: 'blur(1px)',
              }}
              onClick={() => handlePopBalloon(index)}
            >
              {el.icon}
            </motion.div>
          )
        ))}
      </div>
    </div>
  );
}
