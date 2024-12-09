import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Circle,
  CircleDot,
  X,
  Heart,
  CircleDollarSign,
  Volume2,
  VolumeX,
} from "lucide-react";
import Header from "./components/Header";
import GameOver from "./components/GameOver";
import Block from "./components/Block";
import "./App.css";
import {
  getShopItems,
  consumeExtraLife,
  consumeDoubleScore,
  addShopItems,
  listenToShopItems,
} from "./api/shopAPI";
import {
  getUserData,
  setUserData,
  updateCoinsAndAchievements,
  checkAndProcessReferral,
} from "./api/gameoverAPI";
import { defaultAchievements } from "./config/achievements";
import { soundManager } from "./utils/sound";
import { scoreThemes, getThemeForScore } from "./config/themes";
import { motion, AnimatePresence } from "framer-motion";

const actions = [
  { type: "swipeLeft", icon: ArrowLeft, color: "#FF6B6B" },
  { type: "swipeRight", icon: ArrowRight, color: "#4ECDC4" },
  { type: "swipeUp", icon: ArrowUp, color: "#45B7D1" },
  { type: "swipeDown", icon: ArrowDown, color: "#96CEB4" },
  { type: "tap", icon: Circle, color: "#FFBE0B" },
  { type: "doubleTap", icon: CircleDot, color: "#FF006E" },
  { type: "avoid", icon: X, color: "#000000" },
  { type: "extraLive", icon: Heart, color: "#ff0000" }, // Pink color for Extra Live
  { type: "coins", icon: CircleDollarSign, color: "#22d65e" },
];

const tutorialBlocks = [
  { type: "tap", icon: Circle, color: "#FFBE0B" },
  { type: "swipeLeft", icon: ArrowLeft, color: "#FF6B6B" },
  { type: "doubleTap", icon: CircleDot, color: "#FF006E" },
  // { type: "avoid", icon: X, color: "#000000" },
  // { type: "extraLive", icon: Heart, color: "#ff0000" },
  // { type: "coins", icon: CircleDollarSign, color: "#22d65e" },
];

const checkAndConsumeExtraLife = async (userId) => {
  try {
    console.log("Checking for extra lives...");
    const shopItems = await getShopItems(userId);
    console.log("Shop items:", shopItems);

    if (shopItems?.shopItems && shopItems.shopItems["extra-lives"] > 0) {
      console.log("Found extra life, attempting to consume...");
      const success = await consumeExtraLife(userId);
      console.log("Consume extra life result:", success);
      return success;
    }
    console.log("No extra lives available");
    return false;
  } catch (error) {
    console.error("Error checking extra lives:", error);
    return false;
  }
};

// Add this helper function for rounding to nearest 5
const roundToNearest5 = (num) => {
  // Make sure we're working with the absolute value
  const absNum = Math.abs(num);
  // Round to nearest 5
  const rounded = Math.round(absNum / 5) * 5;
  // Return with original sign
  return num < 0 ? -rounded : rounded;
};

export default function SwipeGame() {
  const [userId, setUserId] = useState(null);
  const [gameState, setGameState] = useState({
    blocks: [],
    score: 0,
    pageTimer: 6,
    isGameOver: false,
    isInTutorial: true,
    tutorialIndex: 0,
    transitioning: false,
    isFrozen: false,
  });

  // Initialize coins from localStorage
  const [coins, setCoins] = useState(0);

  // New state for Double Score activation
  const [doubleScoreActive, setDoubleScoreActive] = useState(false);

  // Add state for extra lives
  const [extraLives, setExtraLives] = useState(0);

  // Add listener for shop items
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = listenToShopItems(userId, (data) => {
      // Add null check and default values
      const shopData = data || { coins: 0, shopItems: {} };

      // Force a re-render when coins become zero
      if (shopData.coins === 0) {
        setCoins(0);
      } else {
        setCoins(Number(shopData.coins || 0));
      }

      // Ensure shopItems exists before accessing
      const shopItems = shopData.shopItems || {};
      setExtraLives(shopItems["extra-lives"] || 0);
      const doubleScoreCount = shopItems["double-score"] || 0;

      if (doubleScoreCount > 0 && !doubleScoreActive) {
        setDoubleScoreActive(true);
      } else if (doubleScoreCount === 0 && doubleScoreActive) {
        setDoubleScoreActive(false);
      }
    });

    return () => unsubscribe?.();
  }, [userId, doubleScoreActive]);

  useEffect(() => {
    // Check if the user ID is already stored
    const storedUserId = localStorage.getItem("userId");

    const initializeNewUser = async (newUserId) => {
      try {
        // Initialize user data in Firebase with default values
        await setUserData(newUserId, {
          coins: 0,
          totalCoinsEarned: 0,
          highScore: 0,
          balloonsPoppedCount: 0,
          shopItems: {},
          claimedRewards: {},
          achievements: defaultAchievements,
        });
        setUserId(newUserId);
        localStorage.setItem("userId", newUserId);
      } catch (error) {
        console.error("Error initializing new user:", error);
      }
    };

    if (storedUserId) {
      // If exists, set it in the state
      setUserId(storedUserId);
    } else {
      // Generate a new user ID and initialize their data
      const newUserId = Math.random().toString(36).substr(2, 9);
      initializeNewUser(newUserId);
    }
  }, []);

  const [interactionState, setInteractionState] = useState({
    start: null,
    lastTapTime: 0,
    tapCount: 0,
  });

  const [nextRareScore, setNextRareScore] = useState(200);

  const resetGame = useCallback(() => {
    setGameState({
      blocks: [],
      score: 0,
      pageTimer: 6,
      isGameOver: false,
      isInTutorial: false,
      tutorialIndex: 0,
      transitioning: false,
      isFrozen: false,
    });
    setInteractionState({
      start: null,
      lastTapTime: 0,
      tapCount: 0,
    });

    // Only play sounds if not muted
    if (!soundManager.getMuteState()) {
      // First unmute with a longer transition
      soundManager.setMuffled(false);

      // Then after a short delay, play the background music
      setTimeout(() => {
        soundManager.play("background", {
          muffled: false,
          volume: 0.3, // Start at lower volume
        });
      }, 100);

      // Gradually increase volume to normal
      setTimeout(() => {
        soundManager.setMuffled(false);
      }, 500);
    }

    // Rest of your reset logic
    if (userId) {
      getShopItems(userId)
        .then((data) => {
          const shopItems = data?.shopItems || {};
          if (shopItems["double-score"] > 0) {
            setDoubleScoreActive(true);
          } else {
            setDoubleScoreActive(false);
          }
        })
        .catch((error) => {
          console.error("Error getting shop items:", error);
          setDoubleScoreActive(false);
        });
    }

    setNextRareScore(200);
  }, [userId]);

  // Update handleCoinsChange to handle zero explicitly
  const handleCoinsChange = useCallback((newCoins) => {
    const coinsValue = Number(newCoins) || 0;
    setCoins(coinsValue);
  }, []);

  const getRandomBlock = useCallback(() => {
    const currentScore = gameState.score;

    // Very high probabilities for testing the disappearing bug
    const coinsBlockChance = 1 / 100; // 2.5% chance for coins
    const extraLiveChance = 1 / 450; // 0.2% chance for extra lives

    // Lower threshold for testing
    if (currentScore >= 200 && currentScore >= nextRareScore) {
      // First check for extra live
      if (Math.random() < extraLiveChance) {
        const extraLiveAction = actions.find(
          (action) => action.type === "extraLive"
        );
        setNextRareScore((prev) => prev + 200); // Small increment for frequent spawns
        return {
          type: "extraLive",
          icon: extraLiveAction.icon,
          color: extraLiveAction.color,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: Date.now(),
        };
      }

      // Then check for coins (more common)
      if (Math.random() < coinsBlockChance) {
        const coinsAction = actions.find((action) => action.type === "coins");
        setNextRareScore((prev) => prev + 200); // Reduced increment for testing
        return {
          type: "coins",
          icon: coinsAction.icon,
          color: coinsAction.color,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: Date.now(),
        };
      }
    }

    // Return regular block if no rare blocks were selected
    return {
      ...actions[Math.floor(Math.random() * (actions.length - 2))],
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
  }, [gameState.score, nextRareScore]);

  const spawnBlocks = useCallback(() => {
    const {
      blocks = [],
      score,
      isGameOver,
      isInTutorial,
      tutorialIndex,
      transitioning,
    } = gameState;

    if (isGameOver) return;

    // console.log("SpawnBlocks called with state:", {
    //   isInTutorial,
    //   tutorialIndex,
    //   blocksLength: blocks.length,
    //   transitioning,
    //   score,
    // });

    if (!blocks || blocks.length === 0) {
      if (isInTutorial) {
        // console.log("Spawning tutorial block:", tutorialIndex);
        const tutorialBlock = {
          ...tutorialBlocks[tutorialIndex],
          id: `tutorial-${tutorialIndex}`,
          createdAt: Date.now(),
        };
        setGameState((prev) => ({
          ...prev,
          blocks: [tutorialBlock],
          pageTimer: 6,
          transitioning: false,
        }));
      } else {
        // Regular game mode - always spawn if no blocks
        const targetBlockCount = Math.min(9, 1 + Math.floor(score / 75));
        // console.log("Attempting to spawn regular blocks:", {
        //   targetBlockCount,
        //   score,
        //   transitioning,
        // });

        const newBlocks = Array(targetBlockCount)
          .fill(null)
          .map(() => getRandomBlock());

        // console.log("Created new blocks:", newBlocks.length);

        setGameState((prev) => {
          // console.log("Setting new game state with blocks:", {
          //   currentScore: prev.score,
          //   newBlockCount: newBlocks.length,
          // });
          return {
            ...prev,
            blocks: newBlocks,
            pageTimer: 6,
            transitioning: false,
          };
        });
      }
    } else {
      // console.log("Blocks exist, not spawning:", blocks.length);
    }
  }, [gameState, getRandomBlock]);

  useEffect(() => {
    if (!gameState) return;

    // console.log("Block watch effect triggered:", {
    //   blocksLength: gameState.blocks?.length || 0,
    //   isInTutorial: gameState.isInTutorial,
    //   tutorialIndex: gameState.tutorialIndex,
    //   transitioning: gameState.transitioning,
    //   score: gameState.score,
    // });

    // Remove the timeout to make spawning more immediate
    spawnBlocks();
  }, [
    spawnBlocks,
    gameState?.blocks?.length,
    gameState?.isInTutorial,
    gameState?.transitioning,
  ]); // Added transitioning to dependencies

  // Update the timer effect to properly handle avoid blocks
  useEffect(() => {
    if (gameState.isGameOver || gameState.isInTutorial || gameState.isFrozen)
      return;

    console.log("Timer effect running, gameState:", {
      isGameOver: gameState.isGameOver,
      isInTutorial: gameState.isInTutorial,
      isFrozen: gameState.isFrozen,
      pageTimer: gameState.pageTimer,
    });

    const interval = setInterval(() => {
      setGameState((prev) => {
        if (!prev.blocks || prev.blocks.length === 0) {
          return {
            ...prev,
            pageTimer: 6,
          };
        }

        const currentBlocks = Array.isArray(prev.blocks) ? prev.blocks : [];
        const SPECIAL_BLOCK_LIFETIME = 2.5;

        // Handle special blocks first
        const updatedBlocks = currentBlocks.filter((block) => {
          const blockAge = (Date.now() - block.createdAt) / 1000;

          // If it's a special block that has exceeded its lifetime
          if (
            (block.type === "avoid" ||
              block.type === "extraLive" ||
              block.type === "coins") &&
            blockAge >= SPECIAL_BLOCK_LIFETIME
          ) {
            // For avoid blocks, add points when they disappear successfully
            if (block.type === "avoid") {
              prev.score += prev.doubleScoreActive ? 20 : 10;
            }
            return false; // Remove the block
          }
          return true; // Keep other blocks
        });

        const newTimer = Math.max(0, prev.pageTimer - 0.1);
        // console.log("Timer update:", newTimer);

        // Handle regular timer reaching 0
        if (newTimer === 0) {
          const remainingRegularBlocks = updatedBlocks.filter(
            (block) => !["avoid", "extraLive", "coins"].includes(block.type)
          ).length;

          // If there are remaining blocks but user has enough extra lives
          if (
            remainingRegularBlocks > 0 &&
            extraLives >= remainingRegularBlocks
          ) {
            consumeMultipleExtraLives(userId, remainingRegularBlocks);
            return {
              ...prev,
              blocks: [], // Clear all blocks
              pageTimer: 6, // Reset timer
              transitioning: false,
            };
          }

          // If not enough extra lives, game over
          if (remainingRegularBlocks > 0) {
            return {
              ...prev,
              isGameOver: true,
              blocks: [],
              transitioning: false,
            };
          }
        }

        return {
          ...prev,
          blocks: updatedBlocks,
          pageTimer: newTimer,
          score: prev.score, // This will include any points from avoided blocks
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [
    gameState.isGameOver,
    gameState.isInTutorial,
    gameState.isFrozen,
    extraLives,
    userId,
  ]);

  // Add this helper function to consume multiple extra lives
  const consumeMultipleExtraLives = async (userId, count) => {
    try {
      for (let i = 0; i < count; i++) {
        await consumeExtraLife(userId);
      }
      return true;
    } catch (error) {
      console.error("Error consuming multiple extra lives:", error);
      return false;
    }
  };

  // Update handleBlockSuccess for tutorial end
  const handleBlockSuccess = useCallback(
    (blockId, blockType) => {
      soundManager.initialize();

      setGameState((prev) => {
        const currentBlocks = Array.isArray(prev.blocks) ? prev.blocks : [];

        if (prev.isInTutorial) {
          if (prev.tutorialIndex < tutorialBlocks.length - 1) {
            return {
              ...prev,
              blocks: [],
              tutorialIndex: prev.tutorialIndex + 1,
              transitioning: true,
            };
          } else {
            // End of tutorial, transition to regular game
            console.log("Ending tutorial, starting game");
            soundManager.play("background");
            return {
              ...prev,
              blocks: [],
              isInTutorial: false,
              tutorialIndex: 0,
              transitioning: false, // Set to false immediately
              score: 0,
              pageTimer: 6,
            };
          }
        } else {
          if (blockType === "extraLive") {
            addShopItems(userId, "extra-lives", 1);
            return {
              ...prev,
              blocks: currentBlocks.filter((b) => b.id !== blockId),
            };
          } else if (blockType === "coins") {
            // Ensure the user exists before adding coins
            getUserData(userId)
              .then((userData) => {
                if (!userData) {
                  // If user doesn't exist, initialize them first
                  setUserData(userId, {
                    coins: 15,
                    totalCoinsEarned: 15,
                    highScore: 0,
                    balloonsPoppedCount: 0,
                    shopItems: {},
                    claimedRewards: {},
                    achievements: defaultAchievements,
                  });
                } else {
                  // User exists, update coins normally
                  updateCoinsAndAchievements(userId, 15);
                }
              })
              .catch((error) => {
                console.error("Error handling coins:", error);
              });

            return {
              ...prev,
              blocks: currentBlocks.filter((b) => b.id !== blockId),
            };
          } else {
            const scoreIncrement = doubleScoreActive ? 20 : 10;
            const newBlocks = currentBlocks.filter((b) => b.id !== blockId);

            // Get the current max blocks based on score (this is what we use for bonus calculation)
            const currentMaxBlocks = Math.min(
              9,
              1 + Math.floor(prev.score / 75)
            );

            // Count remaining regular blocks (excluding special blocks)
            const remainingRegularBlocks = newBlocks.filter(
              (b) => !["avoid", "extraLive", "coins"].includes(b.type)
            ).length;

            // Count total regular blocks in current page (before removing the current block)
            const totalRegularBlocks = currentBlocks.filter(
              (b) => !["avoid", "extraLive", "coins"].includes(b.type)
            ).length;

            // Check if this was the last regular block
            if (remainingRegularBlocks === 0 && totalRegularBlocks > 0) {
              const timeLeft = prev.pageTimer;

              // Calculate bonus using current max blocks (not the actual blocks on screen)
              const rawBonus = timeLeft * currentMaxBlocks;
              const timerBonus = roundToNearest5(rawBonus);

              console.log("Timer bonus calculation:", {
                currentMaxBlocks,
                timeLeft,
                rawBonus,
                roundedBonus: timerBonus,
              });

              return {
                ...prev,
                blocks: newBlocks, // Keep special blocks on the page
                score: prev.score + scoreIncrement + timerBonus,
                lastTimerBonus: {
                  amount: timerBonus,
                  timestamp: Date.now(),
                },
                transitioning: false,
              };
            }

            return {
              ...prev,
              score: prev.score + scoreIncrement,
              blocks: newBlocks,
              transitioning: false,
            };
          }
        }
      });
    },
    [userId, doubleScoreActive]
  );

  const handleInteraction = useCallback(
    async (e, type, block) => {
      // Only call preventDefault if it exists (for touch events)
      if (e.type.startsWith("touch") && e.preventDefault) {
        e.preventDefault();
      }

      if (gameState.isGameOver) return;

      // Handle both touch and mouse events
      const point = e.type.startsWith("touch")
        ? e.touches[0] || e.changedTouches[0]
        : e;

      if (type === "start") {
        setInteractionState((prev) => ({
          ...prev,
          start: {
            x: point.clientX,
            y: point.clientY,
            time: Date.now(),
          },
        }));
      } else if (type === "end") {
        const start = interactionState.start;
        if (!start) return;

        const deltaX = point.clientX - start.x;
        const deltaY = point.clientY - start.y;
        const deltaTime = Date.now() - start.time;

        // Helper function to handle successful swipes with animation
        const handleSwipeSuccess = (blockId, blockType) => {
          // soundManager.play("tap");

          setGameState((prev) => ({
            ...prev,
            blocks: prev.blocks.map((b) =>
              b.id === blockId
                ? {
                    ...b,
                    isBeingSwiped: true,
                  }
                : b
            ),
          }));

          requestAnimationFrame(() => {
            setTimeout(() => {
              handleBlockSuccess(blockId, blockType);
            }, 150);
          });
        };

        if (block.type === "avoid") {
          // Special handling for avoid block in tutorial
          if (gameState.isInTutorial) {
            handleBlockSuccess(block.id, block.type);
            return;
          }

          // First check for extra life
          const hasExtraLife = await checkAndConsumeExtraLife(userId);

          // Always freeze first
          setGameState((prev) => ({ ...prev, isFrozen: true }));

          if (hasExtraLife) {
            // If user has extra life, remove the block after animation
            setTimeout(() => {
              setGameState((prev) => ({
                ...prev,
                blocks: prev.blocks.filter((b) => b.id !== block.id),
                isFrozen: false, // Unfreeze after animation
              }));
            }, 1000);
          } else {
            // No extra life available, proceed to game over after animation
            setTimeout(() => {
              setGameState((prev) => ({
                ...prev,
                isGameOver: true,
                blocks: [],
                transitioning: false,
                isFrozen: false,
              }));
            }, 1000);
          }
          return;
        }

        if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
          const now = Date.now();

          if (block.type === "doubleTap") {
            if (now - interactionState.lastTapTime < 300) {
              handleBlockSuccess(block.id, block.type);
              setInteractionState((prev) => ({
                ...prev,
                lastTapTime: 0,
                tapCount: 0,
              }));
            } else {
              setInteractionState((prev) => ({
                ...prev,
                lastTapTime: now,
                tapCount: prev.tapCount + 1,
              }));
            }
          } else if (
            block.type === "tap" ||
            block.type === "extraLive" ||
            block.type === "coins"
          ) {
            handleBlockSuccess(block.id, block.type);
          }
        } else if (deltaTime < 5000) {
          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);

          if (absX > absY && absX > 30) {
            if (
              (deltaX > 0 && block.type === "swipeRight") ||
              (deltaX < 0 && block.type === "swipeLeft")
            ) {
              handleSwipeSuccess(block.id, block.type);
            }
          } else if (absY > absX && absY > 30) {
            if (
              (deltaY > 0 && block.type === "swipeDown") ||
              (deltaY < 0 && block.type === "swipeUp")
            ) {
              handleSwipeSuccess(block.id, block.type);
            }
          }
        }

        setInteractionState((prev) => ({ ...prev, start: null }));
      }
    },
    [
      gameState.isGameOver,
      interactionState.start,
      interactionState.lastTapTime,
      handleBlockSuccess,
      userId,
    ]
  );

  // Update the effect that consumes double score
  useEffect(() => {
    const handleDoubleScoreEnd = async () => {
      // Only consume double score when the game transitions from active to game over
      if (gameState.isGameOver && doubleScoreActive) {
        const success = await consumeDoubleScore(userId);
        if (success) {
          setDoubleScoreActive(false);
        }
      }
    };

    handleDoubleScoreEnd();
  }, [gameState.isGameOver]);

  // Add cleanup when game ends
  useEffect(() => {
    if (gameState.isGameOver) {
      // Instead of stopping, muffle the background music
      soundManager.setMuffled(true);
    } else {
      // Normal background music during gameplay
      soundManager.setMuffled(false);
    }
  }, [gameState.isGameOver]);

  // Add cleanup when component unmounts
  useEffect(() => {
    return () => {
      soundManager.stopAll();
    };
  }, []);

  // Add state for mute
  const [isMuted, setIsMuted] = useState(soundManager.getMuteState());

  // Add mute toggle handler
  const handleMuteToggle = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  // Add new state for current theme
  const [currentTheme, setCurrentTheme] = useState(scoreThemes[0]);

  // Add effect to handle theme changes based on score
  useEffect(() => {
    const newTheme = getThemeForScore(gameState.score);
    if (newTheme && newTheme.threshold !== currentTheme.threshold) {
      setCurrentTheme(newTheme);
    }
  }, [gameState.score]);

  // Add this effect after your other useEffects
  useEffect(() => {
    // if (gameState.score === 1000) {
    //   soundManager.play("super", {
    //     volume: 0.4, // Reduced from default volume
    //   });
    // }
    // if (gameState.score === 3000) {
    //   soundManager.play("wow", {
    //     volume: 0.4, // Reduced from default volume
    //   });
    // }
    // if (gameState.score === 5000) {
    //   soundManager.play("amazing", {
    //     volume: 0.4, // Reduced from default volume
    //   });
    // }
    // if (gameState.score === 10000) {
    //   soundManager.play("extreme", {
    //     volume: 0.4, // Reduced from default volume
    //   });
    // }
    // if (gameState.score === 500) {
    //   soundManager.play("fantastic", {
    //     volume: 0.4, // Reduced from default volume
    //   });
    // }
  }, [gameState.score]);

  useEffect(() => {
    // Unlock audio on first user interaction
    const unlockAudio = async () => {
      await soundManager.unlockAudio();
      document.removeEventListener("touchstart", unlockAudio);
      document.removeEventListener("click", unlockAudio);
    };

    document.addEventListener("touchstart", unlockAudio);
    document.addEventListener("click", unlockAudio);

    return () => {
      document.removeEventListener("touchstart", unlockAudio);
      document.removeEventListener("click", unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (userId) {
      checkAndProcessReferral(userId);
    }
  }, [userId]);

  // Add these near your other state declarations
  const [pendingInteractions, setPendingInteractions] = useState([]);
  const [isProcessingInteraction, setIsProcessingInteraction] = useState(false);

  const queueInteraction = useCallback((e, type, block) => {
    setPendingInteractions((prev) => [...prev, { e, type, block }]);
  }, []);

  useEffect(() => {
    if (pendingInteractions.length > 0 && !isProcessingInteraction) {
      setIsProcessingInteraction(true);
      const { e, type, block } = pendingInteractions[0];

      handleInteraction(e, type, block).finally(() => {
        setIsProcessingInteraction(false);
        setPendingInteractions((prev) => prev.slice(1));
      });
    }
  }, [pendingInteractions, isProcessingInteraction, handleInteraction]);

  return (
    <motion.div
      className="flex flex-col min-h-screen touch-none select-none"
      animate={{
        backgroundColor: currentTheme.background,
      }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      {!gameState.isGameOver && (
        <div className="flex">
          <Header
            score={gameState.score}
            pageTimer={gameState.pageTimer}
            isInTutorial={gameState.isInTutorial}
            extraLives={extraLives}
            doubleScoreActive={doubleScoreActive}
          />
        </div>
      )}

      {/* Updated Timer Bonus Display */}
      <AnimatePresence>
        {gameState.lastTimerBonus &&
          Date.now() - gameState.lastTimerBonus.timestamp < 1000 && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 5 }}
              exit={{ opacity: 0 }}
              className="fixed top-[7vh] left-[16px] z-40" // Align with score position
              transition={{ duration: 0.2 }}
            >
              <div className="text-lg font-bold text-green-400 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
                +{gameState.lastTimerBonus.amount}
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Add Mute Button - Only show when not in tutorial */}
      {!gameState.isInTutorial && !gameState.isGameOver && (
        <button
          onClick={handleMuteToggle}
          className="fixed top-[10vh] right-[2%] z-50 p-1.5 sm:p-2 md:p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors min-w-[24px] min-h-[24px] max-w-[40px] max-h-[40px] flex items-center justify-center"
        >
          {soundManager.getMuteState() ? (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 text-gray-600 min-w-[16px] min-h-[16px] max-w-[20px] max-h-[20px]" />
          ) : (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 text-gray-600 min-w-[16px] min-h-[16px] max-w-[20px] max-h-[20px]" />
          )}
        </button>
      )}

      <div>
        {gameState.isGameOver && (
          <div>
            <GameOver
              score={gameState.score}
              resetGame={resetGame}
              userId={userId}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
            />
          </div>
        )}
      </div>

      {!gameState.isGameOver && (
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
          <div>
            <div className="flex flex-col gap-4 px-4 pt-4 overflow-hidden">
              {(gameState.blocks || []).map((block) => (
                <Block
                  key={block.id}
                  block={{
                    ...block,
                    color: currentTheme.blocks[block.type],
                  }}
                  handleInteraction={queueInteraction}
                  isInTutorial={gameState.isInTutorial}
                  isTransitioning={gameState.transitioning}
                  isFrozen={gameState.isFrozen && block.type !== "avoid"}
                  currentTheme={currentTheme}
                />
              ))}
            </div>
          </div>
          <div className="pt-4">
            {gameState.isInTutorial && gameState.blocks?.[0] && (
              <div className="flex text-xl text-gray-600">
                {gameState.blocks[0].type === "doubleTap"
                  ? "Double Tap"
                  : gameState.blocks[0].type === "tap"
                  ? "Tap"
                  : gameState.blocks[0].type === "avoid"
                  ? "Avoid"
                  : gameState.blocks[0].type === "extraLive"
                  ? "Gives Extra Life"
                  : gameState.blocks[0].type === "coins"
                  ? "Gives 15 Coins"
                  : `Swipe ${gameState.blocks[0].type.replace("swipe", "")}`}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
