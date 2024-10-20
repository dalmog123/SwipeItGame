// components/GameOver.js
import React from 'react';

export default function GameOverScreen({ score, resetGame }) {
  return (
    <div className="text-center">
      <div className="text-3xl mb-4">Game Over!</div>
      <div className="text-xl">Final Score: {score}</div>
      <button
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={resetGame}
      >
        Play Again
      </button>
    </div>
  );
}
