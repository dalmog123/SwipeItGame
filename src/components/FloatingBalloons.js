// FloatingBalloon.js
import React from 'react';
import { motion } from 'framer-motion';

const FloatingBalloon = ({ icon, delay, index, onPop }) => {
  return (
    <motion.div
      className="absolute"
      initial={{ y: '100vh' }}
      animate={{ y: '-100vh' }}
      transition={{
        duration: 10,
        repeat: Infinity,
        delay: delay,
        ease: 'linear',
      }}
      style={{
        left: `${29 * index}%`,
        filter: 'blur(1px)',
      }}
      onClick={onPop}
    >
      {icon}
    </motion.div>
  );
};

export default FloatingBalloon;
