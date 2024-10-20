import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { BsFillBalloonHeartFill } from 'react-icons/bs'; // Import the balloon icon
import swipeItLogo from '../swipeitlogo.png'; // Adjust the path based on your folder structure

export default function GameOver({ score, resetGame }) {
  const [showScore, setShowScore] = useState(false);
  const [floatingElements, setFloatingElements] = useState([
    { icon: <BsFillBalloonHeartFill color="#FF6B6B" size={50} />, delay: 0, popped: false },  // Red balloon
    { icon: <BsFillBalloonHeartFill color="#FF006E" size={50} />, delay: 0.5, popped: false }, // Teal balloon
    { icon: <BsFillBalloonHeartFill color="#FFBE0B" size={50} />, delay: 1, popped: false },   // Yellow balloon
    { icon: <BsFillBalloonHeartFill color="#000000" size={50} />, delay: 1.5, popped: false },  // Black balloon
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-teal-300 to-green-500 p-6 overflow-hidden">
      <div className="relative bg-gradient-to-br from-blue-300 via-teal-200 to-green-300 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <img
          src={swipeItLogo}
          alt="Swipe It Game Logo"
          width={200}
          height={100}
          style={{
            borderRadius: '15px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.3s ease',
          }}
          className="mx-auto mb-6"
        />

        <motion.h1
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 10 }}
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600 mb-8"
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
              className="bg-gradient-to-r from-green-400 to-green-500 p-2 rounded-xl mb-8"
            >
              <span className="text-xl font-bold text-white">Score: {score}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="px-8 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full text-2xl font-bold shadow-lg hover:shadow-xl transition duration-30 ease-in-out"
          onClick={resetGame}
        >
          Swipe Again!
        </motion.button>

        {floatingElements.map((el, index) => (
          !el.popped && ( // Only render the balloon if it hasn't been popped
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
                left: `${25 * index}%`,
                filter: 'blur(1px)',
              }}
              onClick={() => handlePopBalloon(index)} // Add click handler
            >
              {el.icon} {/* Use the balloon icon here */}
            </motion.div>
          )
        ))}
      </div>
    </div>
  );
}
