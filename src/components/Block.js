import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { Heart, CircleDollarSign, Coins } from "lucide-react";
import { soundManager } from "../utils/sound";
import { colors, hexA, glowFor, blockGlow } from "../config/designTokens";

export default function Block({
  block,
  handleInteraction,
  isInTutorial,
  isTransitioning,
  isFrozen,
  currentTheme,
}) {
  const [isTapped, setIsTapped] = useState(false);
  const [showShatter, setShowShatter] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isHandled, setIsHandled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [blockPosition, setBlockPosition] = useState(null);
  const interactionTimeoutRef = useRef(null);
  const [coinAnimations, setCoinAnimations] = useState([]);
  const [isInteracting, setIsInteracting] = useState(false);

  // Gesture bookkeeping kept in refs so the handlers read/write it
  // synchronously — as React state, a fast press's "up" saw a stale value and
  // was dropped. swipeStartRef: pointer origin; isMouseDownRef: mouse press
  // state; lastTouchTimeRef: timestamp used to ignore the compatibility mouse
  // events the browser emits after a real touch (which otherwise double-fire).
  const swipeStartRef = useRef(null);
  const isMouseDownRef = useRef(false);
  const lastTouchTimeRef = useRef(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const previousThemeRef = useRef(currentTheme);
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);

  useEffect(() => {
    if (previousThemeRef.current?.threshold !== currentTheme.threshold) {
      setIsThemeTransitioning(true);
      const timer = setTimeout(() => {
        setIsThemeTransitioning(false);
      }, 300);

      previousThemeRef.current = currentTheme;
      return () => clearTimeout(timer);
    }
  }, [currentTheme]);

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
      setIsHandled(false);
      setIsAnimating(false);
      x.set(0);
      y.set(0);
    }
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, [block?.id, x, y]);

  const addCoinAnimation = useCallback((rect) => {
    const animationId = Date.now();
    setCoinAnimations((prev) => [
      ...prev,
      {
        id: animationId,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      },
    ]);

    setTimeout(() => {
      setCoinAnimations((prev) =>
        prev.filter((anim) => anim.id !== animationId)
      );
    }, 2000);
  }, []);

  const handleBlockInteraction = useCallback(
    (e, interactionType) => {
      // console.log("Interaction Attempted:", interactionType, block.type);
      // console.log("Current States:", {
      //   isTransitioning,
      //   isFrozen,
      //   isHandled,
      //   isAnimating,
      // });

      if (
        isTransitioning ||
        (isFrozen && block.type !== "avoid") ||
        isHandled ||
        isAnimating
      ) {
        console.log("Interaction blocked due to state.");
        return;
      }

      setIsTapped(false);
      swipeStartRef.current = null;

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

        if (block.type === "coins") {
          addCoinAnimation(rect);
        }

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
        soundManager.play("avoidtap", { volume: 0.6 });

        setTimeout(() => {
          soundManager.setMuffled(true, {
            frequency: 200,
            volume: 0.2,
          });
        }, 100);

        setIsHandled(true);
        setShowShatter(true);
        setIsAnimating(true);
        setIsVisible(false);

        handleInteraction(e, "end", block);

        setTimeout(() => {
          setIsAnimating(false);
          setShowShatter(false);
          setBlockPosition(null);
          setIsHandled(false);
        }, 1500);
      } else {
        handleInteraction(e, interactionType, block);
      }
    },
    [
      block,
      isTransitioning,
      isFrozen,
      isHandled,
      isAnimating,
      handleInteraction,
      addCoinAnimation,
    ]
  );

  const handleTouchStart = (e) => {
    lastTouchTimeRef.current = Date.now();
    if (isTransitioning || (isFrozen && block.type !== "avoid")) return;
    setIsInteracting(true);
    if (["tap", "doubleTap", "extraLive", "coins"].includes(block.type)) {
      setIsTapped(true);
    }
    const touch = e.touches[0];
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
    handleInteraction(e, "start", block);
  };

  const handleTouchMove = (e) => {
    if (
      !swipeStartRef.current ||
      isTransitioning ||
      (isFrozen && block.type !== "avoid") ||
      isHandled ||
      isAnimating
    )
      return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeStartRef.current.x;
    const deltaY = touch.clientY - swipeStartRef.current.y;

    if (block.type === "swipeLeft" || block.type === "swipeRight") {
      x.set(deltaX);
    } else if (block.type === "swipeUp" || block.type === "swipeDown") {
      y.set(deltaY);
    }
  };

  const handleTouchEnd = (e) => {
    lastTouchTimeRef.current = Date.now();
    setIsInteracting(false);
    handleBlockInteraction(e, "end");
  };

  const handleMouseDown = (e) => {
    // Ignore the synthetic mouse events the browser fires right after a touch.
    if (Date.now() - lastTouchTimeRef.current < 700) return;
    if (isTransitioning || (isFrozen && block.type !== "avoid")) return;
    isMouseDownRef.current = true;
    setIsInteracting(true);
    if (["tap", "doubleTap", "extraLive", "coins"].includes(block.type)) {
      setIsTapped(true);
    }
    swipeStartRef.current = { x: e.clientX, y: e.clientY };
    handleInteraction(e, "start", block);
  };

  const handleMouseMove = (e) => {
    if (
      !isMouseDownRef.current ||
      !swipeStartRef.current ||
      isTransitioning ||
      (isFrozen && block.type !== "avoid") ||
      isHandled ||
      isAnimating
    )
      return;
    const deltaX = e.clientX - swipeStartRef.current.x;
    const deltaY = e.clientY - swipeStartRef.current.y;

    if (block.type === "swipeLeft" || block.type === "swipeRight") {
      x.set(deltaX);
    } else if (block.type === "swipeUp" || block.type === "swipeDown") {
      y.set(deltaY);
    }
  };

  const handleMouseUp = (e) => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    setIsInteracting(false);
    handleBlockInteraction(e, "end");
  };

  const handleMouseLeave = (e) => {
    if (isMouseDownRef.current) {
      handleMouseUp(e);
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

  // Neon glow: avoid blocks are a dark tile that glows danger-red; every other
  // block glows in its own accent color. Intensity rises with the score tier.
  const glowColor = glowFor(block.type, block.color);
  const glowIntensity = currentTheme.glow ?? 0.8;
  const glowShadow = blockGlow(glowColor, glowIntensity);

  const animateProps = {
    x,
    y,
    backgroundColor: block.color || "#000000",
    transition: {
      x: {
        type: "spring",
        stiffness: isThemeTransitioning ? 2000 : 1000,
        damping: 20,
        duration: 0.2,
      },
      y: {
        type: "spring",
        stiffness: isThemeTransitioning ? 2000 : 1000,
        damping: 20,
        duration: 0.2,
      },
      backgroundColor: {
        duration: isThemeTransitioning ? 0.3 : 1.5,
        ease: "easeInOut",
      },
    },
  };

  const blockStyle = {
    width: "90vw",
    maxWidth: "550px",
    height: "8.5vh",
    backgroundColor: block.color || colors.blocks.avoid,
    borderRadius: 16,
    border: `1.5px solid ${hexA(glowColor, 0.9)}`,
    boxShadow: glowShadow,
    opacity: isFrozen && block.type !== "avoid" ? 0.5 : 1,
    pointerEvents:
      (isFrozen && block.type !== "avoid") || isAnimating ? "none" : "auto",
    willChange: "transform, opacity",
    color: glowColor,
    transition: isThemeTransitioning ? "background-color 0.3s ease" : "none",
    transform: "translateZ(0)",
    backfaceVisibility: "hidden",
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
              className={`flex items-center justify-center ${
                shouldShake && !isInteracting ? "animate-shake" : ""
              }`}
              style={blockStyle}
              animate={animateProps}
              initial={false}
              drag={
                !isThemeTransitioning &&
                (["swipeLeft", "swipeRight"].includes(block.type)
                  ? "x"
                  : ["swipeUp", "swipeDown"].includes(block.type)
                  ? "y"
                  : false)
              }
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.1}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {block.icon && (
                <block.icon
                  size="6vh"
                  color={block.type === "avoid" ? colors.danger : "#ffffff"}
                  style={{
                    filter: `drop-shadow(0 0 6px ${hexA(glowColor, 0.9)})`,
                  }}
                />
              )}
              <div
                className="absolute top-2 right-2 text-sm font-numeric font-bold"
                style={{ color: "#ffffff" }}
              >
                {Math.ceil(block.remainingTime || 0)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coin Animations */}
      {coinAnimations.map((anim) => (
        <div
          key={anim.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: anim.x,
            top: anim.y,
            transform: "translate(-50%, -50%)",
            animation: "blockCoinFloat 2s ease-out forwards",
          }}
        >
          <div className="flex items-center text-yellow-400 font-bold text-lg">
            +15 <Coins className="w-5 h-5 ml-1" />
          </div>
        </div>
      ))}

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
