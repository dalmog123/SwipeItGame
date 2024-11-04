import { useState, useEffect, useCallback } from "react";
import { soundManager } from "../utils/sound";
import { motion, AnimatePresence } from "framer-motion";

export default function Block({
  block,
  handleInteraction,
  isInTutorial,
  isTransitioning,
}) {
  const [isTapped, setIsTapped] = useState(false);
  const [showShatter, setShowShatter] = useState(false);
  const [particles, setParticles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (showShatter) {
      const particleCount = 16;
      const newParticles = Array.from({ length: particleCount }).map(
        (_, i) => ({
          id: i,
          angle: (i * 360) / particleCount,
          color: block.type === "extraLive" ? "#ff6b6b" : "#ffd700",
        })
      );
      setParticles(newParticles);
    }
  }, [showShatter, block.type]);

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
    [block.isBeingSwiped, block.type, isTapped, block.color]
  );

  const handleTouchStart = (e) => {
    if (isTransitioning || isProcessing) return;
    if (
      block.type === "tap" ||
      block.type === "doubleTap" ||
      block.type === "extraLive" ||
      block.type === "coins"
    ) {
      setIsTapped(true);
    }
    handleInteraction(e, "start", block);
  };

  const handleTouchEnd = (e) => {
    if (isTransitioning || isProcessing) return;
    setIsTapped(false);
    if (block.type === "extraLive" || block.type === "coins") {
      setIsProcessing(true);
      setShowShatter(true);
      soundManager.play("collect");
      setTimeout(() => {
        handleInteraction(e, "end", block);
        setIsProcessing(false);
      }, 250);
    } else if (block.type === "avoid") {
      setShowShatter(true);
      soundManager.play("collect");
      handleInteraction(e, "end", block);
    } else {
      handleInteraction(e, "end", block);
    }
  };

  const shouldShake =
    block.type === "avoid" ||
    block.type === "extraLive" ||
    block.type === "coins"
      ? !isInTutorial && (Date.now() - block.createdAt) / 1000 >= 2
      : !isInTutorial && (Date.now() - block.createdAt) / 1000 >= 4;

  // Heart SVG path
  const heartPath =
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

  return (
    <div className="relative">
      <div
        className={`rounded-lg shadow-lg flex items-center justify-center ${
          shouldShake ? "animate-shake" : ""
        }`}
        style={{
          ...getStyles(),
          opacity:
            showShatter &&
            (block.type === "extraLive" || block.type === "avoid")
              ? 0
              : 1,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        <block.icon size={"6vh"} color="white" />
      </div>

      <AnimatePresence>
        {showShatter && block.type === "extraLive" && (
          <>
            {[...Array(12)].map((_, i) => (
              <motion.svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="absolute w-8 h-8"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fill: "#ff6b6b",
                }}
                initial={{
                  opacity: 1,
                  scale: 1,
                  x: "-50%",
                  y: "-50%",
                }}
                animate={{
                  opacity: 0,
                  scale: 0,
                  x: `calc(-50% + ${(Math.random() - 0.5) * 500}px)`,
                  y: `calc(-50% + ${(Math.random() - 0.5) * 500}px)`,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                }}
              >
                <path d={heartPath} />
              </motion.svg>
            ))}
          </>
        )}

        {/* Keep original particle effect for coins */}
        {showShatter && block.type === "coins" && (
          <div
            className="absolute inset-0 pointer-events-none overflow-visible"
            style={{ zIndex: 50 }}
          >
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{
                  scale: 1,
                  x: "50%",
                  y: "50%",
                  opacity: 1,
                }}
                animate={{
                  scale: 0,
                  x: `calc(50% + ${
                    Math.cos((particle.angle * Math.PI) / 180) * 150
                  }px)`,
                  y: `calc(50% + ${
                    Math.sin((particle.angle * Math.PI) / 180) * 150
                  }px)`,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                style={{
                  position: "absolute",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: particle.color,
                }}
              />
            ))}
          </div>
        )}

        {showShatter && block.type === "avoid" && (
          <>
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: block.color,
                  clipPath: `polygon(${Math.random() * 100}% ${
                    Math.random() * 100
                  }%, ${Math.random() * 100}% ${Math.random() * 100}%, ${
                    Math.random() * 100
                  }% ${Math.random() * 100}%)`,
                  width: "150px",
                  height: "150px",
                  borderRadius: "6px",
                }}
                initial={{
                  scale: 1,
                  x: "-50%",
                  y: "-50%",
                  opacity: 1,
                }}
                animate={{
                  scale: 0,
                  x: `calc(-50% + ${(Math.random() - 0.5) * 600}px)`,
                  y: `calc(-50% + ${(Math.random() - 0.5) * 600}px)`,
                  rotate: Math.random() * 540,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.2, 0.8, 0.2, 1],
                  opacity: { duration: 0.8 },
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
