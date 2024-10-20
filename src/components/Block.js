import React from 'react';

export default function Block({ block, handleInteraction, isInTutorial }) {
  // Check if the block should shake
  const shouldShake = !isInTutorial && (Date.now() - block.createdAt) / 1000 >= 4;
//   const blockHeight = (window.innerHeight) / 10;
  return (
    <div
      key={block.id}
      className={`w-72 h-16 rounded-lg shadow-lg flex items-center justify-center transition-all cursor-pointer
        ${shouldShake ? 'animate-shake' : ''}
        ${!isInTutorial && (Date.now() - block.createdAt) / 1000 >= 4.5 ? 'scale-105 bg-opacity-90' : ''}`}
      style={{ backgroundColor: block.color }}
      onTouchStart={(e) => handleInteraction(e, 'start', block)}
      onTouchEnd={(e) => handleInteraction(e, 'end', block)}
      onMouseDown={(e) => handleInteraction(e, 'start', block)}
      onMouseUp={(e) => handleInteraction(e, 'end', block)}
      onMouseLeave={(e) => handleInteraction(e, 'end', block)}
    >
      <block.icon size={40} color="white" />
    </div>
  );
}
