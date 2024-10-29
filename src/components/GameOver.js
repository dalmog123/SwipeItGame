import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { BsFillBalloonHeartFill } from "react-icons/bs";
import { Trophy, ChevronRight } from "lucide-react";
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

// Define default achievements
const defaultAchievements = [
  {
    id: "highScorer",
    title: "High Scorer",
    description: "Reach high scores",
    levels: [100, 1000, 5000],
    progress: 0,
    coinReward: 100,
  },
  {
    id: "coinCollector",
    title: "Coin Collector",
    description: "Collect coins",
    levels: [100, 500, 1000],
    progress: 0,
    coinReward: 50,
  },
  {
    id: "balloonPopper",
    title: "Balloon Popper",
    description: "Pop balloons",
    levels: [12, 40, 120],
    progress: 0,
    coinReward: 100,
  },
  {
    id: "gamePlayer",
    title: "Game Player",
    description: "Play multiple games",
    levels: [5, 20, 200],
    progress: 0,
    coinReward: 50,
  },
];

export default function GameOver({ score, resetGame, userId }) {
  const [showScore, setShowScore] = useState(false);
  const [scoreBoard, setScoreBoard] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [floatingElements, setFloatingElements] = useState([
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
  const [balloonsPoppedCount, setBalloonsPoppedCount] = useState(0);
  const [coins, setCoins] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [achievements, setAchievements] = useState(defaultAchievements);
  const [interactionState, setInteractionState] = useState({ start: null });
  // const [showAchievements, setShowAchievements] = useState(true);
  const [claimedRewards, setClaimedRewards] = useState({});
  const [achievementQueue, setAchievementQueue] = useState([]);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [gamesPlayed, setGamesPlayed] = useState(0);

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

  // Move updateAchievementProgress definition before it's used
  const updateAchievementProgress = useCallback((achievementId, increment) => {
    setAchievements((prevAchievements) =>
      prevAchievements.map((achievement) =>
        achievement.id === achievementId
          ? { ...achievement, progress: achievement.progress + increment }
          : achievement
      )
    );
  }, []);

  const checkAndAwardAchievements = useCallback(
    async (achievements) => {
      if (!userId) return;

      try {
        const userData = await getUserData(userId);
        const currentClaimedRewards = userData?.claimedRewards || {};
        const newAchievements = [];
        let coinsToAdd = 0;

        // Ensure we have valid initial coin values
        const currentCoins = Number(userData?.coins || 0);
        const currentTotalCoins = Number(userData?.totalCoinsEarned || 0);

        console.log("Current coin values:", {
          currentCoins,
          currentTotalCoins,
          userData: userData,
        });

        achievements.forEach((achievement) => {
          achievement.levels.forEach((level, index) => {
            const rewardKey = `${achievement.id}-${index}`;
            if (
              achievement.progress >= level &&
              !currentClaimedRewards[rewardKey] &&
              !claimedRewards[rewardKey]
            ) {
              newAchievements.push({
                id: achievement.id,
                achievement: achievement.title,
                level: index + 1,
                coins: achievement.coinReward,
              });
              coinsToAdd += Number(achievement.coinReward || 0);
              currentClaimedRewards[rewardKey] = true;
            }
          });
        });

        if (newAchievements.length > 0) {
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
          setAchievementQueue((prev) => [...prev, ...newAchievements]);
        }
      } catch (error) {
        console.error("Error checking achievements:", error);
      }
    },
    [userId, claimedRewards]
  );

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
    if (achievementQueue.length > 0 && !currentAchievement) {
      setCurrentAchievement(achievementQueue[0]);
      setAchievementQueue((prev) => prev.slice(1));
    }
  }, [achievementQueue, currentAchievement]);

  useEffect(() => {
    const saveData = async () => {
      if (!userId) return;

      await updateUserData(userId, {
        highScore,
        achievements,
        claimedRewards,
        balloonsPoppedCount,
      });
    };

    const debounceTimeout = setTimeout(saveData, 500);
    return () => clearTimeout(debounceTimeout);
  }, [userId, highScore, achievements, claimedRewards, balloonsPoppedCount]);

  useEffect(() => {
    if (!userId) return;
    // Remove the !score check since 0 is a valid score

    const updateHighScore = async () => {
      try {
        // Get current user data to check actual high score
        const userData = await getUserData(userId);
        const currentHighScore = userData?.highScore || 0;

        // Update achievements regardless of score
        const updatedAchievements = achievements.map((achievement) =>
          achievement.id === "highScorer"
            ? { ...achievement, progress: Math.max(currentHighScore, score) }
            : achievement
        );

        // Only update high score if it's higher than current
        if (score > currentHighScore) {
          // Update database first
          await updateUserData(userId, {
            highScore: score,
            achievements: updatedAchievements,
          });

          // Update local state
          setHighScore(score);
          setAchievements(updatedAchievements);

          // Check for achievement rewards only once after database is updated
          setTimeout(() => {
            checkAndAwardAchievements(updatedAchievements);
          }, 100);
        } else {
          // Still update achievements even if high score isn't beaten
          setAchievements(updatedAchievements);
        }
      } catch (error) {
        console.error("Error updating high score:", error);
      }
    };

    updateHighScore();
    setShowScore(true); // Always show score, even if it's 0
  }, [score, userId, achievements, checkAndAwardAchievements]);

  useEffect(() => {
    handleGameOver();
  }, []); // Run only once on mount

  const handlePopBalloon = useCallback(
    (index) => {
      const newBalloons = [...floatingElements];
      newBalloons[index].popped = true;
      setFloatingElements(newBalloons);

      // Update balloonsPoppedCount and achievements
      setBalloonsPoppedCount((prevCount) => {
        // Get the actual previous count
        const newCount = (prevCount || 0) + 1;

        // Update achievements with the new balloon count
        const updatedAchievements = achievements.map((achievement) =>
          achievement.id === "balloonPopper"
            ? { ...achievement, progress: newCount }
            : achievement
        );

        if (userId) {
          // Update database with both the count and achievements
          updateUserData(userId, {
            balloonsPoppedCount: newCount,
            achievements: updatedAchievements,
          });
        }

        setAchievements(updatedAchievements);
        checkAndAwardAchievements(updatedAchievements);
        return newCount;
      });
    },
    [userId, achievements, floatingElements, checkAndAwardAchievements]
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

        if (deltaTime < 250) {
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
            updates.username = `Player${Math.floor(Math.random() * 10000)}`;

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

  // Add a useEffect to handle the notification timeout
  useEffect(() => {
    if (currentAchievement) {
      const timer = setTimeout(() => {
        setCurrentAchievement(null);
      }, 6000); // 6 seconds

      // Cleanup the timer if the component unmounts or currentAchievement changes
      return () => clearTimeout(timer);
    }
  }, [currentAchievement]);

  return (
    <div>
      {!scoreBoard ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-teal-300 to-green-500 p-4 sm:p-8 overflow-hidden">
          <Achievement
            currentAchievements={achievements}
            coins={coins}
            onCoinsChange={handleCoinsChange}
            userId={userId}
          />
          {currentAchievement && (
            <AchievementsNotification
              show={true}
              onHide={() => setCurrentAchievement(null)}
              achievement={currentAchievement.achievement}
              level={currentAchievement.level}
              coins={currentAchievement.coins}
            />
          )}
          <div className="relative bg-gradient-to-br from-blue-300 via-teal-200 to-green-300 rounded-3xl shadow-2xl p-4 sm:p-8 mb-8 sm:mb-12 max-w-xs sm:max-w-md w-full text-center">
            <motion.h1
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600 mb-4 sm:mb-8"
            >
              Game Over!
            </motion.h1>

            <AnimatePresence>
              {showScore && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="mb-6 flex items-center justify-center"
                >
                  <div className="flex flex-col items-center mr-4">
                    <div className="text-6xl font-bold text-yellow-400 drop-shadow-glow animate-pulse">
                      {score !== undefined ? score : 0}
                    </div>
                    <div className="text-md text-white mt-1">Points</div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out flex items-center justify-center"
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
                  : { scale: [1, 1.2, 1] }
              }
              transition={
                swipeDirection
                  ? { duration: 0.5 }
                  : { repeat: Infinity, duration: 2 }
              }
              className="px-6 py-2 sm:px-8 sm:py-3 bg-gradient-to-r from-green-500 to-blue-700 text-white rounded-full text-lg sm:text-4xl font-bold shadow-lg hover:shadow-xl transition duration-300 ease-in-out mb-4 sm:mb-8"
              style={{
                marginBottom: "env(safe-area-inset-bottom)",
                width: "80%",
                cursor: "grab",
                alignSelf: "center",
              }}
              onClick={() => resetGame()}
            >
              Swipe Again!
            </motion.button>

            {floatingElements.map(
              (el, index) =>
                !el.popped && (
                  <FloatingBalloon
                    key={index}
                    icon={el.icon}
                    delay={el.delay}
                    index={index}
                    onPop={() => handlePopBalloon(index)}
                  />
                )
            )}
          </div>
        </div>
      ) : (
        <div>
          <ScoreBoard
            onBack={handleBackButton}
            currentUserId={userId}
          ></ScoreBoard>
        </div>
      )}
    </div>
  );
}
