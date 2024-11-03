import { useState } from "react";

export default function Block({ block, handleInteraction, isInTutorial }) {
  // Helper function to determine the swipe animation
  const getSwipeAnimation = (type) => {
    switch (type) {
      case "swipeLeft":
        return "translateX(-100%)";
      case "swipeRight":
        return "translateX(100%)";
      case "swipeUp":
        return "translateY(-100%)";
      case "swipeDown":
        return "translateY(100%)";
      default:
        return "none";
    }
  };

  const shouldShake =
    block.type === "avoid"
      ? !isInTutorial && (Date.now() - block.createdAt) / 1000 >= 2
      : !isInTutorial && (Date.now() - block.createdAt) / 1000 >= 4;

  return (
    <div
      className={`rounded-lg shadow-lg flex items-center justify-center
      ${shouldShake ? "animate-shake" : ""}`}
      style={{
        width: "80vw",
        maxWidth: "550px",
        height: "7vh",
        backgroundColor: block.color,
        transition: "transform 0.3s ease-out",
        transform: block.isBeingSwiped ? getSwipeAnimation(block.type) : "none",
        pointerEvents: block.isBeingSwiped ? "none" : "auto",
        touchAction: "none",
        userSelect: "none",
      }}
      onTouchStart={(e) => handleInteraction(e, "start", block)}
      onTouchEnd={(e) => handleInteraction(e, "end", block)}
      onMouseDown={(e) => handleInteraction(e, "start", block)}
      onMouseUp={(e) => handleInteraction(e, "end", block)}
      onMouseLeave={(e) => handleInteraction(e, "end", block)}
    >
      <block.icon size={"6vh"} color="white" />
    </div>
  );
}
