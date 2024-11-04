import { useState, useEffect, useCallback } from "react";
import { soundManager } from "../utils/sound";

export default function Block({ block, handleInteraction, isInTutorial }) {
  const [isTapped, setIsTapped] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  useEffect(() => {
    if (isInTutorial) return;

    const blockAge = (Date.now() - block.createdAt) / 1000;
    if (blockAge > 0.1) return; // Don't start timer if block is already aged

    const shakeDelay =
      block.type === "avoid" ||
      block.type === "extraLive" ||
      block.type === "coins"
        ? 2000 // 2 seconds
        : 4000; // 4 seconds

    const timer = setTimeout(() => {
      setShouldShake(true);
    }, shakeDelay);

    return () => clearTimeout(timer);
  }, [block.type, block.createdAt, isInTutorial]);

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

  const getStyles = useCallback(
    () => ({
      width: "80vw",
      maxWidth: "550px",
      height: "7vh",
      backgroundColor: block.color,
      touchAction: "none",
      userSelect: "none",
      position: "relative",
      transform: block.isBeingSwiped
        ? getSwipeAnimation(block.type)
        : isTapped
        ? "scale(0.95)"
        : "none",
      transition: block.isBeingSwiped
        ? "transform 0.15s ease-out"
        : "transform 0.1s ease-out",
      opacity: block.isBeingSwiped ? 0.8 : 1,
    }),
    [block.isBeingSwiped, block.type, isTapped]
  );

  const handleTouchStart = (e) => {
    if (
      block.type === "tap" ||
      block.type === "doubleTap" ||
      block.type === "extraLive" ||
      block.type === "coins"
    ) {
      setIsTapped(true);
      // soundManager.play("tap");
    }
    handleInteraction(e, "start", block);
  };

  const handleTouchEnd = (e) => {
    setIsTapped(false);
    handleInteraction(e, "end", block);
  };

  return (
    <div
      className={`rounded-lg shadow-lg flex items-center justify-center ${
        shouldShake ? "animate-shake" : ""
      }`}
      style={getStyles()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <block.icon size={"6vh"} color="white" />
    </div>
  );
}
