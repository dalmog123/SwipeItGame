// Importing necessary React features
import { useState, useEffect, useCallback } from "react";
// Importing icons from lucide-react
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
} from "lucide-react";
// Importing your custom components
import Header from "./components/Header";
import GameOver from "./components/GameOver";
import Block from "./components/Block";
import "./App.css";
// Importing shop-related API functions
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
} from "./api/gameoverAPI";
import { defaultAchievements } from "./config/achievements";
// Defining the game actions
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

// Tutorial blocks
const tutorialBlocks = [
  { type: "tap", icon: Circle, color: "#FFBE0B" },
  { type: "swipeLeft", icon: ArrowLeft, color: "#FF6B6B" },
  { type: "doubleTap", icon: CircleDot, color: "#FF006E" },
  // { type: "avoid", icon: X, color: "#000000" },
  // { type: "extraLive", icon: Heart, color: "#ff0000" },
  // { type: "coins", icon: CircleDollarSign, color: "#22d65e" },
];

// Update the checkAndConsumeExtraLife function
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

export default function SwipeGame() {
  const [userId, setUserId] = useState(null);
  const [gameState, setGameState] = useState({
    blocks: [],
    score: 0,
    timer: 0,
    isGameOver: false,
    isInTutorial: true,
    tutorialIndex: 0,
    transitioning: false,
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
      timer: 0,
      isGameOver: false,
      isInTutorial: false,
      tutorialIndex: 0,
      transitioning: false,
    });
    setInteractionState({
      start: null,
      lastTapTime: 0,
      tapCount: 0,
    });

    // Check double score availability from database with proper error handling
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
          setDoubleScoreActive(false); // Default to false on error
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
    const coinsBlockChance = 1 / 80; // 2.5% chance for coins
    const extraLiveChance = 1 / 500; // 0.2% chance for extra lives

    // Lower threshold for testing
    if (currentScore >= 200 && currentScore >= nextRareScore) {
      // First check for extra live
      if (Math.random() < extraLiveChance) {
        const extraLiveAction = actions.find(
          (action) => action.type === "extraLive"
        );
        setNextRareScore((prev) => prev + 50); // Small increment for frequent spawns
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

    if (isGameOver || transitioning) return;

    if (!blocks || blocks.length === 0) {
      if (isInTutorial) {
        const tutorialBlock = {
          ...tutorialBlocks[tutorialIndex],
          id: `tutorial-${tutorialIndex}`,
          createdAt: Date.now(),
        };
        setGameState((prev) => ({ ...prev, blocks: [tutorialBlock] }));
      } else {
        const targetBlockCount = Math.min(9, 1 + Math.floor(score / 50));
        const newBlocks = Array(targetBlockCount)
          .fill(null)
          .map(() => getRandomBlock());
        setGameState((prev) => ({ ...prev, blocks: newBlocks }));
      }
    }
  }, [gameState, getRandomBlock]);

  useEffect(() => {
    if (!gameState?.blocks) return;
    spawnBlocks();
  }, [spawnBlocks, gameState?.blocks?.length]);

  // Update the timer effect to properly handle the extra life check
  useEffect(() => {
    if (gameState.isGameOver || gameState.isInTutorial) return;

    let isProcessingExtraLife = false;

    const interval = setInterval(async () => {
      if (isProcessingExtraLife) return;

      const currentBlocks = Array.isArray(gameState.blocks)
        ? gameState.blocks
        : [];
      const timeLimit = gameState.score >= 500 ? 5 : 5.5;

      const timedOutBlock = currentBlocks.find(
        (block) =>
          !["avoid", "extraLive", "coins"].includes(block.type) &&
          (Date.now() - block.createdAt) / 1000 >= timeLimit
      );

      if (timedOutBlock) {
        try {
          isProcessingExtraLife = true;
          console.log("Block timed out, checking for extra life...");
          const hasExtraLife = await checkAndConsumeExtraLife(userId);
          console.log("Extra life check result:", hasExtraLife);

          setGameState((prev) => {
            if (hasExtraLife) {
              console.log("Extra life used, continuing game");
              return {
                ...prev,
                blocks: prev.blocks.filter((b) => b.id !== timedOutBlock.id),
              };
            } else {
              console.log("No extra life available, game over");
              return {
                ...prev,
                isGameOver: true,
                blocks: [],
                transitioning: false,
              };
            }
          });

          setTimeout(() => {
            isProcessingExtraLife = false;
          }, 200);

          if (hasExtraLife) return;
        } catch (error) {
          console.error("Error handling extra life:", error);
          setGameState((prev) => ({
            ...prev,
            isGameOver: true,
            blocks: [],
            transitioning: false,
          }));
          isProcessingExtraLife = false;
          return;
        }
      }

      // Only update other blocks if we haven't handled a timed out block
      setGameState((prev) => {
        if (prev.isGameOver) return prev;

        const currentBlocks = Array.isArray(prev.blocks) ? prev.blocks : [];
        const timeLimit = prev.score >= 500 ? 5 : 5.5;

        // Separate time limits for different block types
        const updatedBlocks = currentBlocks.filter((block) => {
          const blockAge = (Date.now() - block.createdAt) / 1000;

          if (block.type === "avoid") {
            return blockAge < timeLimit - 2.5; // Avoid blocks disappear earlier
          } else if (block.type === "extraLive" || block.type === "coins") {
            return blockAge < timeLimit - 2.5; // Special blocks stay less
          }
          return blockAge < timeLimit; // Normal blocks use standard time
        });

        return {
          ...prev,
          timer: prev.timer + 0.1,
          blocks: updatedBlocks,
        };
      });
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [
    gameState.isGameOver,
    gameState.isInTutorial,
    userId,
    gameState.score,
    gameState.blocks,
  ]);

  const handleSuccess = useCallback(
    (blockId, blockType) => {
      setGameState((prev) => {
        // Ensure we have valid blocks array
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
            return {
              ...prev,
              blocks: [],
              isInTutorial: false,
              transitioning: true,
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
            return {
              ...prev,
              score: prev.score + scoreIncrement,
              blocks: currentBlocks.filter((b) => b.id !== blockId),
            };
          }
        }
      });

      if (gameState.isInTutorial) {
        setTimeout(() => {
          setGameState((prev) => ({ ...prev, transitioning: false }));
        }, 100);
      }
    },
    [gameState.isInTutorial, userId, doubleScoreActive]
  );

  const handleInteraction = useCallback(
    async (e, type, block) => {
      e.preventDefault();
      if (gameState.isGameOver) return;
      const point = e.touches?.[0] || e.changedTouches?.[0] || e;

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
          // First set the block as "being swiped" in the state
          setGameState((prev) => ({
            ...prev,
            blocks: prev.blocks.map((b) =>
              b.id === blockId ? { ...b, isBeingSwiped: true } : b
            ),
          }));

          // Wait for animation to complete before removing the block
          setTimeout(() => {
            handleSuccess(blockId, blockType);
          }, 300); // Match this with your animation duration
        };

        if (block.type === "avoid") {
          // Special handling for avoid block in tutorial
          if (gameState.isInTutorial) {
            handleSuccess(block.id, block.type);
            return;
          }

          // Normal game avoid block handling
          const hasExtraLife = await checkAndConsumeExtraLife(userId);
          if (hasExtraLife) {
            setGameState((prev) => ({
              ...prev,
              blocks: prev.blocks.filter((b) => b.id !== block.id),
            }));
          } else {
            setGameState((prev) => ({
              ...prev,
              isGameOver: true,
              blocks: [],
              transitioning: false,
            }));
          }
          return;
        }

        if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
          const now = Date.now();

          if (block.type === "doubleTap") {
            if (now - interactionState.lastTapTime < 300) {
              handleSuccess(block.id, block.type);
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
            handleSuccess(block.id, block.type);
          }
        } else if (deltaTime < 250) {
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
      handleSuccess,
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

  return (
    <div className="flex flex-col min-h-screen touch-none select-none">
      {!gameState.isGameOver && (
        <div className="flex">
          <Header
            score={gameState.score}
            timer={gameState.timer}
            isInTutorial={gameState.isInTutorial}
            extraLives={extraLives}
            doubleScoreActive={doubleScoreActive}
          />
        </div>
      )}

      <div>
        {gameState.isGameOver && (
          <div>
            <GameOver
              score={gameState.score}
              resetGame={resetGame}
              userId={userId}
            />
          </div>
        )}
      </div>

      {!gameState.isGameOver && (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 overflow-hidden">
          <div>
            <div className="flex flex-col gap-4 px-4 pt-4 overflow-hidden">
              {(gameState.blocks || []).map((block) => (
                <Block
                  key={block.id}
                  block={block}
                  gameState={gameState}
                  handleInteraction={handleInteraction}
                  isInTutorial={gameState.isInTutorial}
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
    </div>
  );
}
