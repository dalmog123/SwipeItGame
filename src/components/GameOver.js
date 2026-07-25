import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { BsFillBalloonHeartFill } from "react-icons/bs";
import { Trophy, ChevronRight, Coins, Share2 } from "lucide-react";
import ScoreBoard from "./ScoreBoard";
import Achievement from "./Achievements";
import FloatingBalloon from "./FloatingBalloons";
import AchievementsNotification from "./AchievementsNotification";
import {
  getUserData,
  updateUserData,
  listenToUserData,
  updateCoinsAndAchievements,
  setUserData,
} from "../api/gameoverAPI";
import { defaultAchievements } from "../config/achievements";
import ShareModal from "./ShareModal";
import { soundManager } from "../utils/sound";
import { colors } from "../config/designTokens";

export default function GameOver({
  score,
  resetGame,
  userId,
  isMuted,
  setIsMuted,
}) {
  const [showScore, setShowScore] = useState(false);
  const [scoreBoard, setScoreBoard] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [floatingElements, setFloatingElements] = useState([
    {
      icon: <BsFillBalloonHeartFill color="#FF5C72" size={"6vh"} />,
      delay: 0,
      popped: false,
    },
    {
      icon: <BsFillBalloonHeartFill color="#FF2E93" size={"6vh"} />,
      delay: 0.5,
      popped: false,
    },
    {
      icon: <BsFillBalloonHeartFill color="#FFD60A" size={"6vh"} />,
      delay: 1,
      popped: false,
    },
    {
      icon: <BsFillBalloonHeartFill color="#38BDF8" size={"6vh"} />,
      delay: 1.5,
      popped: false,
    },
  ]);
  const [balloonsPoppedCount, setBalloonsPoppedCount] = useState(0);
  const [coins, setCoins] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [achievements, setAchievements] = useState(defaultAchievements);
  const [interactionState, setInteractionState] = useState({ start: null });
  const [claimedRewards, setClaimedRewards] = useState({});
  const [achievementQueue, setAchievementQueue] = useState([]);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [coinAnimations, setCoinAnimations] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const checkAndAwardAchievements = useCallback(
    async (achievements) => {
      if (!userId || !achievements) return;
      try {
        const userData = await getUserData(userId);
        const currentClaimedRewards = userData?.claimedRewards || {};
        const newAchievements = [];
        let coinsToAdd = 0;

        // Ensure we have valid initial coin values
        const currentCoins = Number(userData?.coins || 0);
        const currentTotalCoins = Number(userData?.totalCoinsEarned || 0);

        for (const achievement of achievements) {
          if (!achievement || !achievement.levels) continue;

          for (let index = 0; index < achievement.levels.length; index++) {
            const level = achievement.levels[index];
            const rewardKey = `${achievement.id}-${index}`;
            
            // Check if this level should be awarded
            if (
              achievement.progress >= level &&
              !currentClaimedRewards[rewardKey] &&
              !claimedRewards[rewardKey]
            ) {
              // For each achievement type, verify the progress meets the level requirement
              let shouldAward = true;
              switch (achievement.id) {
                case "highScorer":
                  shouldAward = achievement.progress >= level;
                  break;
                case "balloonPopper":
                  shouldAward = achievement.progress >= level;
                  break;
                case "gamePlayer":
                  shouldAward = achievement.progress >= level;
                  break;
                case "coinCollector":
                  shouldAward = achievement.progress >= level;
                  break;
                default:
                  shouldAward = true;
              }

              if (shouldAward) {
                console.log(`Awarding achievement ${achievement.id} level ${index + 1}`, {
                  progress: achievement.progress,
                  level,
                  rewardKey
                });
                
                newAchievements.push({
                  id: achievement.id,
                  achievement: achievement.title,
                  level: index + 1,
                  coins: achievement.coinReward || 0,
                });
                coinsToAdd += Number(achievement.coinReward || 0);
                currentClaimedRewards[rewardKey] = true;
              }
            }
          }
        }

        if (newAchievements.length > 0) {
          console.log("New achievements to award:", newAchievements);
          
          // Ensure all numbers are valid
          const newTotalCoins = currentCoins + coinsToAdd;
          const newTotalEarned = currentTotalCoins + coinsToAdd;

          console.log("Updating coins:", {
            currentCoins,
            coinsToAdd,
            newTotalCoins,
            newTotalEarned,
          });

          // Update database with validated numbers
          const updates = {
            coins: Math.max(0, Math.floor(newTotalCoins)),
            totalCoinsEarned: Math.max(0, Math.floor(newTotalEarned)),
            claimedRewards: currentClaimedRewards,
          };

          // Update database
          await updateUserData(userId, updates);

          // Update local state
          setClaimedRewards(currentClaimedRewards);
          setCoins(updates.coins);
          setTotalCoinsEarned(updates.totalCoinsEarned);

          // Add each achievement to the queue one by one
          newAchievements.forEach((achievement) => {
            setAchievementQueue((prev) => {
              // Check if this achievement is already in the queue
              const isDuplicate = prev.some(
                (a) => a.id === achievement.id && a.level === achievement.level
              );
              return isDuplicate ? prev : [...prev, achievement];
            });
          });
        }
      } catch (error) {
        console.error("Error checking achievements:", error);
      }
    },
    [userId, claimedRewards]
  );

  useEffect(() => {
    setFloatingElements([
      {
        icon: <BsFillBalloonHeartFill color="#FF6B6B" size={"6vh"} />,
        delay: 0,
        popped: false,
      },
      {
        icon: <BsFillBalloonHeartFill color="#FF006E" size={"6vh"} />,
        delay: 0.5,
        popped: false,
      },
      {
        icon: <BsFillBalloonHeartFill color="#FFBE0B" size={"6vh"} />,
        delay: 1,
        popped: false,
      },
      {
        icon: <BsFillBalloonHeartFill color="#000000" size={"6vh"} />,
        delay: 1.5,
        popped: false,
      },
    ]);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = listenToUserData(userId, (userData) => {
      if (userData) {
        setHighScore(userData.highScore || 0);
        setBalloonsPoppedCount(userData.balloonsPoppedCount || 0);

        // Sync all achievements with their correct progress
        const syncedAchievements = (
          userData.achievements || defaultAchievements
        ).map((achievement) => {
          switch (achievement.id) {
            case "highScorer":
              return { ...achievement, progress: userData.highScore || 0 };
            case "coinCollector":
              return {
                ...achievement,
                progress: userData.totalCoinsEarned || 0,
              };
            case "balloonPopper":
              return {
                ...achievement,
                progress: userData.balloonsPoppedCount || 0,
              };
            default:
              return achievement;
          }
        });

        setAchievements(syncedAchievements);
        setClaimedRewards(userData.claimedRewards || {});
        setGamesPlayed(userData.gamesPlayed || 0);

        // Only update coins if they're different from the database
        if (userData.coins !== coins) {
          setCoins(userData.coins || 0);
        }
        if (userData.totalCoinsEarned !== totalCoinsEarned) {
          setTotalCoinsEarned(userData.totalCoinsEarned || 0);
        }
      }
    });

    return () => unsubscribe();
  }, [userId]); // Remove coins and totalCoinsEarned from dependencies

  useEffect(() => {
    if (!userId) return;

    const updateHighScore = async () => {
      try {
        const userData = await getUserData(userId);
        const currentHighScore = userData?.highScore || 0;
        const currentCoins = userData?.coins || 0;
        const currentTotalCoins = userData?.totalCoinsEarned || 0;

        // Only update if we have a new high score
        console.log(score, currentHighScore);
        if (score > currentHighScore) {
          setIsNewRecord(true);
          const highScoreReward = 100;
          const highScorerAchievement = defaultAchievements.find(
            (a) => a.id === "highScorer"
          );

          // Update achievements progress
          const updatedAchievements = achievements.map((achievement) => {
            switch (achievement.id) {
              case "highScorer":
                return { ...achievement, progress: score };
              case "coinCollector":
                return {
                  ...achievement,
                  progress: currentTotalCoins,
                };
              case "balloonPopper":
                return {
                  ...achievement,
                  progress: userData.balloonsPoppedCount || 0,
                };
              case "gamePlayer":
                return {
                  ...achievement,
                  progress: userData.gamesPlayed || 0,
                };
              default:
                return achievement;
            }
          });

          // Only give high score reward if the score meets the threshold
          const shouldAwardHighScoreReward = !userData.claimedRewards?.["highScorer-0"] && 
            score >= highScorerAchievement.levels[0];

          // Update database with high score and achievements
          const updates = {
            highScore: score,
            coins: currentCoins + (shouldAwardHighScoreReward ? highScoreReward : 0),
            totalCoinsEarned: currentTotalCoins + (shouldAwardHighScoreReward ? highScoreReward : 0),
            achievements: updatedAchievements,
            claimedRewards: {
              ...userData.claimedRewards,
              ...(shouldAwardHighScoreReward ? { "highScorer-0": true } : {}),
            },
          };

          await updateUserData(userId, updates);

          // Update local state
          setHighScore(score);
          setAchievements(updatedAchievements);

          // Check for all achievements
          await checkAndAwardAchievements(updatedAchievements);
        }
      } catch (error) {
        console.error("Error updating high score:", error);
      }
    };

    updateHighScore();
    setShowScore(true);
  }, [score, userId, achievements, checkAndAwardAchievements]);

  // Always reveal the final score on the results screen, even if there is no
  // userId / the backend is unreachable (the score is the centerpiece).
  useEffect(() => {
    const t = setTimeout(() => setShowScore(true), 250);
    return () => clearTimeout(t);
  }, []);

  const handleGameOver = useCallback(() => {
    if (!userId) return;

    const updateStats = async () => {
      try {
        // Get current user data to ensure accurate counts
        const userData = await getUserData(userId);
        const currentGamesPlayed = userData?.gamesPlayed || 0;
        const totalCoinsEarned = userData?.totalCoinsEarned || 0;
        const newGamesPlayed = currentGamesPlayed + 1;

        // Update both achievements at once
        const updatedAchievements = achievements.map((achievement) => {
          switch (achievement.id) {
            case "gamePlayer":
              return { ...achievement, progress: newGamesPlayed };
            // case "coinCollector":
            //   return { ...achievement, progress: totalCoinsEarned };
            default:
              return achievement;
          }
        });

        // Batch all updates together
        await updateUserData(userId, {
          gamesPlayed: newGamesPlayed,
          // totalCoinsEarned: totalCoinsEarned,
          achievements: updatedAchievements,
        });

        // Update local state
        setAchievements(updatedAchievements);

        // Check for new achievements
        checkAndAwardAchievements(updatedAchievements);
      } catch (error) {
        console.error("Error updating game stats:", error);
      }
    };

    updateStats();
  }, [userId, achievements, checkAndAwardAchievements]);

  useEffect(() => {
    handleGameOver();
  }, []); // Run only once on mount

  const handlePopBalloon = useCallback(
    async (index) => {
      if (!userId) return;

      // Check if the balloon is already popped
      const isAlreadyPopped = floatingElements[index]?.popped;
      if (isAlreadyPopped) return;

      try {
        // Get current user data first
        const userData = await getUserData(userId);
        const currentBalloonCount = userData?.balloonsPoppedCount || 0;
        
        // Update the state to mark the balloon as popped
        soundManager.play("balloon_pop", { volume: 0.5 });
        setFloatingElements((prev) =>
          prev.map((el, i) => (i === index ? { ...el, popped: true } : el))
        );

        // Update balloon count in database and local state with exact increment
        const updates = {
          balloonsPoppedCount: currentBalloonCount + 1,
          coins: (userData?.coins || 0) + 5,
          totalCoinsEarned: (userData?.totalCoinsEarned || 0) + 5,
        };

        await updateUserData(userId, updates);
        setBalloonsPoppedCount(currentBalloonCount + 1);

        // Update achievements for balloon popping and coin collection
        const updatedAchievements = achievements.map((achievement) => {
          switch (achievement.id) {
            case "balloonPopper":
              return { ...achievement, progress: currentBalloonCount + 1 };
            case "coinCollector":
              return { ...achievement, progress: updates.totalCoinsEarned };
            default:
              return achievement;
          }
        });

        setAchievements(updatedAchievements);
        await checkAndAwardAchievements(updatedAchievements);

      } catch (error) {
        console.error("Error handling balloon pop:", error);
      }
    },
    [userId, floatingElements, achievements, checkAndAwardAchievements]
  );

  const handleScoreBoard = () => {
    setScoreBoard(true);
  };

  const handleBackButton = () => {
    setScoreBoard(false);
  };

  const handleSwipe = useCallback(
    (e, type) => {
      if (type === "start") {
        setInteractionState((prev) => ({
          ...prev,
          start: {
            x: e.clientX,
            y: e.clientY,
            time: Date.now(),
          },
        }));
      } else if (type === "end") {
        const start = interactionState.start;
        if (!start) return;

        const deltaX = e.clientX - start.x;
        const deltaY = e.clientY - start.y;
        const deltaTime = Date.now() - start.time;

        if (deltaTime < 5000) {
          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);

          if (absX > absY && absX > 30) {
            setSwipeDirection(deltaX > 0 ? "right" : "left");
          } else if (absY > absX && absY > 30) {
            setSwipeDirection(deltaY > 0 ? "down" : "up");
          }
        }

        setInteractionState((prev) => ({ ...prev, start: null }));
      }
    },
    [interactionState.start]
  );

  useEffect(() => {
    if (swipeDirection) {
      const timer = setTimeout(() => {
        resetGame();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [swipeDirection, resetGame]);

  const handleCoinsChange = useCallback(
    async (newCoins) => {
      if (!userId) return;

      // Add strict validation and logging
      console.log("handleCoinsChange - input:", newCoins);

      // Ensure newCoins is a valid number
      const coinsToAdd = Number(newCoins);
      if (isNaN(coinsToAdd) || coinsToAdd === 0) {
        console.warn("Invalid coins value:", newCoins);
        return;
      }

      console.log("handleCoinsChange - validated coins:", coinsToAdd);
      await updateCoinsAndAchievements(userId, coinsToAdd);
    },
    [userId]
  );

  useEffect(() => {
    const initializeUserData = async () => {
      if (!userId) return;

      try {
        const userData = await getUserData(userId);
        if (!userData) {
          const initialData = {
            coins: 0,
            highScore: 0,
            totalCoinsEarned: 0,
            achievements: defaultAchievements,
            claimedRewards: {},
            balloonsPoppedCount: 0,
            gamesPlayed: 0,
            userId: userId,
            username: `Player${Math.floor(Math.random() * 9999999)}`,
            createdAt: new Date().toISOString(),
            lastPlayed: new Date().toISOString(),
          };
          console.log("Initializing user data:", initialData);
          await setUserData(userId, initialData);
        } else {
          const updates = {
            lastPlayed: new Date().toISOString(),
          };

          if (isNaN(userData.coins)) updates.coins = 0;
          if (isNaN(userData.totalCoinsEarned)) updates.totalCoinsEarned = 0;
          if (!userData.username)
            updates.username = `Player${Math.floor(Math.random() * 9999999)}`;

          if (Object.keys(updates).length > 0) {
            console.log("Updating user data:", updates);
            await updateUserData(userId, updates);
          }
        }
      } catch (error) {
        console.error("Error initializing user data:", error);
      }
    };

    initializeUserData();
  }, [userId]);

  // Make sure the listener useEffect properly sets the initial balloon count
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = listenToUserData(userId, (userData) => {
      if (userData) {
        // Make sure we set the initial balloon count correctly
        const currentBalloonCount = userData.balloonsPoppedCount || 0;
        setBalloonsPoppedCount(currentBalloonCount);

        // ... rest of the listener code ...
      }
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (achievementQueue.length > 0 && !currentAchievement) {
      const nextAchievement = achievementQueue[0];
      
      // Play achievement sound when showing notification
      try {
        console.log("Playing achievement sound");
        soundManager.play("achievement_unlock", { volume: 1.0 });
      } catch (error) {
        console.error("Error playing achievement sound:", error);
      }
      
      setCurrentAchievement(nextAchievement);
      setAchievementQueue((prev) => prev.slice(1));
    }
  }, [achievementQueue, currentAchievement]);

  useEffect(() => {
    if (currentAchievement) {
      // Play achievement sound when notification appears
      try {
        console.log("Playing achievement sound for:", currentAchievement.achievement);
        soundManager.play("achievement_unlock", { volume: 1.0 });
      } catch (error) {
        console.error("Error playing achievement sound:", error);
      }

      const timer = setTimeout(() => {
        setCurrentAchievement(null);
      }, 6000); // 6 seconds

      // Cleanup the timer if the component unmounts or currentAchievement changes
      return () => clearTimeout(timer);
    }
  }, [currentAchievement]);

  useEffect(() => {
    const saveData = async () => {
      if (!userId) return;

      try {
        const userData = await getUserData(userId);
        const updatedAchievements = achievements.map((achievement) => {
          switch (achievement.id) {
            case "highScorer":
              return { ...achievement, progress: highScore };
            case "balloonPopper":
              return { ...achievement, progress: balloonsPoppedCount };
            case "coinCollector":
              return { ...achievement, progress: userData.totalCoinsEarned || 0 };
            case "gamePlayer":
              return { ...achievement, progress: userData.gamesPlayed || 0 };
            default:
              return achievement;
          }
        });

        await updateUserData(userId, {
          highScore,
          achievements: updatedAchievements,
          claimedRewards,
          balloonsPoppedCount,
        });

        // Check for achievements after updating progress
        await checkAndAwardAchievements(updatedAchievements);
      } catch (error) {
        console.error("Error saving data:", error);
      }
    };

    const debounceTimeout = setTimeout(saveData, 500);
    return () => clearTimeout(debounceTimeout);
  }, [userId, highScore, achievements, claimedRewards, balloonsPoppedCount, checkAndAwardAchievements]);

  // Celebrate only a NEW HIGH SCORE (not every game over — confetti on a loss
  // was tonally confusing).
  useEffect(() => {
    if (!isNewRecord) return;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FF2E93", "#38BDF8", "#2EE6D6", "#FFC93D", "#6EE7B7"],
    });

    const t = setTimeout(() => {
      confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
      confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
    }, 150);

    return () => clearTimeout(t);
  }, [isNewRecord]);

  useEffect(() => {
    if (achievementQueue.length > 0 && !currentAchievement) {
      const nextAchievement = achievementQueue[0];
      // Check if this achievement notification has already been shown
      const achievementKey = `${nextAchievement.id}-${nextAchievement.level}`;

      setCurrentAchievement(nextAchievement);
      setAchievementQueue((prev) => prev.slice(1));
    }
  }, [achievementQueue, currentAchievement]);

  // console.log(coins, "in gameover");

  return (
    <>
      <div>
        {!scoreBoard ? (
          <>
            <div className="flex flex-col items-center justify-center min-h-screen bg-bg-base p-4 sm:p-8 overflow-hidden">
              <Achievement
                currentAchievements={achievements}
                coins={coins}
                onCoinsChange={handleCoinsChange}
                userId={userId}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
              />
              {currentAchievement && (
                <AchievementsNotification
                  show={true}
                  // onHide={() => setCurrentAchievement(null)}
                  achievement={currentAchievement.achievement}
                  level={currentAchievement.level}
                  coins={currentAchievement.coins}
                />
              )}
              <div className="relative bg-bg-panel border border-line rounded-3xl shadow-2xl p-4 sm:p-8 mb-8 sm:mb-12 max-w-xs sm:max-w-md w-full text-center">
                <motion.h1
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  className={`font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-wider mb-4 sm:mb-8 ${
                    isNewRecord ? "text-neon-coin text-glow" : "text-ink-hi"
                  }`}
                >
                  {isNewRecord ? "New Best!" : "Game Over"}
                </motion.h1>

                <AnimatePresence>
                  {showScore && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                      className="mb-6 flex items-center justify-center"
                    >
                      <div className="flex flex-col items-center mr-4">
                        <div
                          className={`font-display text-6xl font-bold text-glow ${
                            isNewRecord ? "text-neon-coin" : "text-ink-hi"
                          }`}
                        >
                          {score !== undefined ? score : 0}
                        </div>
                        <div className="font-numeric text-md text-ink-lo mt-1 uppercase tracking-widest">
                          {highScore > 0
                            ? `Best ${highScore.toLocaleString()}`
                            : "Points"}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-white/10 border border-white/15 text-neon-coin rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
                        onClick={handleScoreBoard}
                        aria-label="Go to Scoreboard"
                      >
                        <Trophy className="mr-1" size={24} />
                        <ChevronRight size={24} />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onTouchStart={(e) => handleSwipe(e.touches[0], "start")}
                  onTouchEnd={(e) => handleSwipe(e.changedTouches[0], "end")}
                  onMouseDown={(e) => handleSwipe(e, "start")}
                  onMouseUp={(e) => handleSwipe(e, "end")}
                  onMouseLeave={(e) => handleSwipe(e, "end")}
                  animate={
                    swipeDirection
                      ? {
                          x:
                            swipeDirection === "left"
                              ? "-100vw"
                              : swipeDirection === "right"
                              ? "100vw"
                              : 0,
                          y:
                            swipeDirection === "up"
                              ? "-100vh"
                              : swipeDirection === "down"
                              ? "100vh"
                              : 0,
                          opacity: swipeDirection ? 0 : 1,
                        }
                      : { scale: 1 }
                  }
                  transition={
                    swipeDirection ? { duration: 0.5 } : { duration: 0.2 }
                  }
                  whileTap={{ scale: 0.96 }}
                  className="font-display uppercase tracking-widest px-6 py-3 sm:px-8 sm:py-4 text-ink-hi rounded-full text-xl sm:text-3xl font-bold mb-4 sm:mb-8"
                  style={{
                    marginBottom: "env(safe-area-inset-bottom)",
                    width: "80%",
                    cursor: "pointer",
                    alignSelf: "center",
                    background:
                      "linear-gradient(90deg, rgba(255,46,147,0.2), rgba(56,189,248,0.2))",
                    border: `2px solid ${colors.blocks.doubleTap}`,
                    boxShadow: `0 0 18px ${colors.blocks.doubleTap}66, 0 0 40px ${colors.blocks.swipeUp}44`,
                    textShadow: "0 0 10px rgba(245,247,255,0.5)",
                  }}
                  onClick={() => resetGame()}
                >
                  Play Again
                </motion.button>

                {/* Coin Animations */}
                {coinAnimations.map((anim) => (
                  <div
                    key={anim.id}
                    className="fixed pointer-events-none"
                    style={{
                      left: anim.x,
                      top: anim.y,
                      transform: "translate(-50%, -50%)",
                      animation: "coinFloat 1s ease-out forwards",
                    }}
                  >
                    <div className="flex items-center text-neon-coin font-bold">
                      +5 <Coins className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                ))}

                {/* Floating Balloons */}
                {floatingElements.map(
                  (el, index) =>
                    !el.popped && (
                      <FloatingBalloon
                        key={index}
                        icon={el.icon}
                        delay={el.delay}
                        index={index}
                        onPop={() => handlePopBalloon(index)}
                        id={`balloon-${index}`}
                      />
                    )
                )}
              </div>
            </div>

            {/* Share button - Only shown when scoreBoard is false */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsShareModalOpen(true)}
              className="fixed bottom-6 right-6 p-3 bg-white/10 border border-white/15 text-ink-hi rounded-full hover:bg-white/20 transition-colors flex items-center justify-center gap-2 z-50 backdrop-blur-sm"
              aria-label="Share with friends"
            >
              <Share2 size={24} />
              <span className="inline text-sm sm:text-base">
                Invite Friends
              </span>
            </motion.button>
          </>
        ) : (
          <div>
            <ScoreBoard
              onBack={handleBackButton}
              currentUserId={userId}
            ></ScoreBoard>
          </div>
        )}
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareData={{
          title: "SwipeIt Game",
          text: `Hey! I just scored ${score} points in SwipeIt. Can you beat my score? 🎮`,
          url: window.location.origin,
        }}
        userId={userId}
      />
    </>
  );
}
