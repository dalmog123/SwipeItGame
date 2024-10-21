export default function Block({ block, handleInteraction, isInTutorial }) {
  // Check if the block should shake
  const shouldShake = block.type === "avoid"
    ? !isInTutorial && (Date.now() - block.createdAt) / 1000 >= 2
    : !isInTutorial && (Date.now() - block.createdAt) / 1000 >= 4;

  return (
    <div
      key={block.id}
      className={`rounded-lg shadow-lg flex items-center justify-center transition-all cursor-pointer
        ${shouldShake ? 'animate-shake' : ''}
        ${!isInTutorial && (Date.now() - block.createdAt) / 1000 >= 4.5 ? 'scale-105 bg-opacity-90' : ''}`}
      style={{
        width: '80vw',  // Set width as 20% of viewport width
        maxWidth: '550px', 
        height: '7vh', // Set height as 10% of viewport height
        backgroundColor: block.color,
      }}
      onTouchStart={(e) => handleInteraction(e, 'start', block)}
      onTouchEnd={(e) => handleInteraction(e, 'end', block)}
      onMouseDown={(e) => handleInteraction(e, 'start', block)}
      onMouseUp={(e) => handleInteraction(e, 'end', block)}
      onMouseLeave={(e) => handleInteraction(e, 'end', block)}
    >
      <block.icon size={'6vh'} color="white" />
    </div>
  );
}
