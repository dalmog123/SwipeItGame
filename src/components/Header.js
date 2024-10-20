// components/Header.js
import React from 'react';

export default function Header({ score, timer, isInTutorial }) {
  return (
    <div className="w-full bg-white shadow-md p-2 sticky top-0 z-50">
      <div className="flex justify-between max-w-md mx-auto">
        <div className="text-xl">Score: {score}</div>
        {!isInTutorial && (
          <div className="text-xl">Time: {timer.toFixed(1)}s</div>
        )}
      </div>
    </div>
  );
}
