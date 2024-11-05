import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, CircleDollarSign } from "lucide-react";
import { soundManager } from "../utils/sound";

export default function Block({
  block,
  handleInteraction,
  isInTutorial,
  isTransitioning,
  isFrozen,
}) {
  const [isTapped, setIsTapped] = useState(false);
  const [showShatter, setShowShatter] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [animationProps, setAnimationProps] = useState(null);
  const [isHandled, setIsHandled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [blockPosition, setBlockPosition] = useState(null);
  const interactionTimeoutRef = useRef(null);

  const getSwipeAnimation = useCallback((type) => {
    switch (type) {
      case "swipeLeft":
        return { x: "-100%" };
      case "swipeRight":
        return { x: "100%" };
      case "swipeUp":
        return { y: "-100%" };
      case "swipeDown":
        return { y: "100%" };
      default:
        return {};
    }
  }, []);

  useEffect(() => {
    if (block?.id) {
      setShowShatter(false);
      setIsVisible(true);
      setAnimationProps(null);
      setIsHandled(false);
      setIsAnimating(false);
    }
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, [block?.id]);

  const handleTouchStart = (e) => {
    if (isTransitioning || (isFrozen && block.type !== "avoid")) return;
    if (["tap", "doubleTap", "extraLive", "coins"].includes(block.type)) {
      setIsTapped(true);
    }
    handleInteraction(e, "start", block);
  };

  const handleTouchEnd = (e) => {
    if (
      isTransitioning ||
      (isFrozen && block.type !== "avoid") ||
      isHandled ||
      isAnimating
    )
      return;
    setIsTapped(false);

    const blockElement = e.currentTarget;
    const rect = blockElement.getBoundingClientRect();
    setBlockPosition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });

    if (block.type === "extraLive" || block.type === "coins") {
      setIsHandled(true);
      setShowShatter(true);
      setIsAnimating(true);
      setIsVisible(false);
      soundManager.play("collect");

      interactionTimeoutRef.current = setTimeout(() => {
        handleInteraction(e, "end", block);
      }, 400);

      setTimeout(() => {
        setIsAnimating(false);
        setShowShatter(false);
        setBlockPosition(null);
        setIsHandled(false);
      }, 1500);
    } else if (block.type === "avoid") {
      setIsHandled(true);
      setShowShatter(true);
      setIsAnimating(true);
      setIsVisible(false);
      soundManager.play("collect");

      handleInteraction(e, "end", block);

      setTimeout(() => {
        setIsAnimating(false);
        setShowShatter(false);
        setBlockPosition(null);
        setIsHandled(false);
      }, 1500);
    } else {
      handleInteraction(e, "end", block);
    }
  };

  const shouldShake =
    !isInTutorial &&
    (Date.now() - block?.createdAt) / 1000 >=
      (block?.type === "avoid" ||
      block?.type === "extraLive" ||
      block?.type === "coins"
        ? 2
        : 4);

  const renderShatterEffect = () => {
    if (!blockPosition) return null;

    const particleCount = block.type === "coins" ? 16 : 12;

    return (
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {Array.from({ length: particleCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: 0,
              x: (Math.random() - 0.5) * window.innerWidth,
              y: (Math.random() - 0.5) * window.innerHeight,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: block.type === "avoid" ? 2.5 : 1.5,
              ease: "easeOut",
            }}
          >
            {block.type === "extraLive" && (
              <Heart className="w-8 h-8 text-red-500" />
            )}
            {block.type === "coins" && (
              <CircleDollarSign className="w-8 h-8 text-yellow-400" />
            )}
            {block.type === "avoid" && (
              <div
                className="w-12 h-12"
                style={{
                  backgroundColor: block.color,
                  clipPath: `polygon(${Math.random() * 100}% ${
                    Math.random() * 100
                  }%, ${Math.random() * 100}% ${Math.random() * 100}%, ${
                    Math.random() * 100
                  }% ${Math.random() * 100}%)`,
                }}
              />
            )}
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && block && (
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={`rounded-lg shadow-lg flex items-center justify-center ${
                shouldShake ? "animate-shake" : ""
              }`}
              style={{
                width: "80vw",
                maxWidth: "550px",
                height: "7vh",
                backgroundColor: block.color || "#000000",
                opacity: block.isBeingSwiped ? 0.8 : isFrozen ? 0.5 : 1,
                pointerEvents:
                  (isFrozen && block.type !== "avoid") || isAnimating
                    ? "none"
                    : "auto",
              }}
              animate={block.isBeingSwiped ? getSwipeAnimation(block.type) : {}}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
            >
              {block.icon && <block.icon size="6vh" color="white" />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showShatter || isAnimating) && blockPosition && (
          <motion.div
            className="fixed pointer-events-none"
            style={{
              zIndex: 9999,
              top: blockPosition.top,
              left: blockPosition.left,
              width: blockPosition.width,
              height: blockPosition.height,
            }}
          >
            {renderShatterEffect()}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
