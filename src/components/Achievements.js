import React, { useState, useEffect } from "react";
import {
  Trophy,
  Store,
  Settings,
  Star,
  Coins,
  Gamepad2,
  Crown,
  Heart,
  VolumeX,
  User,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { purchaseShopItem, listenToShopItems } from "../api/shopAPI";
import { getUserData, listenToUserData } from "../api/gameoverAPI";
import { defaultAchievements } from "../config/achievements";

const Achievements = ({
  coins = 1250,
  currentAchievements = [],
  onCoinsChange,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [purchasedItems, setPurchasedItems] = useState({});
  const [localAchievements, setLocalAchievements] =
    useState(currentAchievements);

  const toggleTab = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderStars = (achievement) => {
    const totalStars = 3;
    let completedStars = 0;

    if (achievement.levels && Array.isArray(achievement.levels)) {
      completedStars = achievement.levels.findIndex(
        (level) => achievement.progress < level
      );
      if (completedStars === -1) completedStars = totalStars;
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[...Array(totalStars)].map((_, index) => (
            <Star
              key={index}
              className={`w-4 h-4 ${
                index < completedStars
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-yellow-600 flex items-center gap-0.5">
          <Coins className="w-3 h-3" />
          {achievement.coinReward}
        </span>
      </div>
    );
  };

  const getAchievementIcon = (id) => {
    switch (id) {
      case "balloon-popper":
        return <Heart className="w-4 h-4" />;
      case "elite-swiper":
        return <Crown className="w-4 h-4" />;
      case "games-played":
        return <Gamepad2 className="w-4 h-4" />;
      case "coin-collector":
        return <Coins className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  const getNextLevel = (achievement) => {
    if (
      !achievement ||
      !achievement.levels ||
      !Array.isArray(achievement.levels)
    ) {
      return 0;
    }

    return (
      achievement.levels.find((level) => level > (achievement.progress || 0)) ||
      achievement.levels[achievement.levels.length - 1] ||
      0
    );
  };

  const getProgress = (achievement) => {
    if (
      !achievement ||
      !achievement.levels ||
      !Array.isArray(achievement.levels)
    ) {
      return 0;
    }

    const nextLevel = getNextLevel(achievement);
    const levelIndex = achievement.levels.indexOf(nextLevel);
    const previousLevel =
      levelIndex > 0 ? achievement.levels[levelIndex - 1] : 0;
    const progressInCurrentLevel = (achievement.progress || 0) - previousLevel;
    const currentLevelSize = nextLevel - previousLevel;

    if (currentLevelSize === 0) return 0;

    return (progressInCurrentLevel / currentLevelSize) * 100;
  };

  // Define shop items
  const shopItems = [
    {
      id: "extra-lives",
      name: "Extra Lives",
      description: "Get a second chance when you miss a block",
      price: 300,
      icon: <Heart className="w-4 h-4" />,
    },
    {
      id: "double-score",
      name: "Double Score",
      description: "Double your points for the next game",
      price: 2500,
      icon: <Zap className="w-4 h-4" />,
    },
  ];

  // Handle Purchase
  const handlePurchase = async (item) => {
    if (!userId) {
      console.error("No user ID available");
      return;
    }

    if (coins >= item.price) {
      const success = await purchaseShopItem(userId, item.id, item.price);
      if (success) {
        console.log(`Successfully purchased ${item.name}`);
      } else {
        console.error(`Failed to purchase ${item.name}`);
      }
    } else {
      console.log("Not enough coins");
    }
  };

  // Add listener for shop items
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = listenToShopItems(userId, (data) => {
      setPurchasedItems(data.shopItems || {});
    });

    return () => unsubscribe?.();
  }, [userId]);

  // Add real-time listener for user data
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = listenToUserData(userId, (userData) => {
      if (userData) {
        // Create properly synced achievements array
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
            case "gamePlayer":
              return { ...achievement, progress: userData.gamesPlayed || 0 };
            default:
              return achievement;
          }
        });

        console.log("Achievements synced:", syncedAchievements); // Debug log
        setLocalAchievements(syncedAchievements);
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [userId]);

  // Add validation when displaying coins
  const displayCoins = isNaN(coins) ? 0 : Number(coins);

  return (
    <>
      {/* Overlay */}
      {activeTab && (
        <div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setActiveTab(null)}
        />
      )}

      {/* Main container - fixed positioning and full width */}
      <div className="fixed top-0 left-0 right-0 z-20">
        {/* Header with coins and navigation */}
        <div className="bg-gradient-to-r from-blue-400 to-green-500 p-2 shadow-lg w-full">
          <div className="flex justify-between items-center max-w-md mx-auto">
            {/* Coins Display */}
            <div className="flex items-center bg-black/20 px-2 py-1 rounded-full">
              <Coins className="text-yellow-400 w-3 h-3 mr-1" />
              <span className="text-white font-bold text-sm">
                {displayCoins}
              </span>
            </div>

            {/* Navigation Icons */}
            <div className="flex gap-2">
              {[
                { id: "achievements", icon: <Trophy />, label: "Achievements" },
                { id: "shop", icon: <Store />, label: "Shop" },
                { id: "settings", icon: <Settings />, label: "Settings" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleTab(item.id)}
                  className={`flex flex-col items-center transition-all ${
                    activeTab === item.id
                      ? "text-white bg-white/20"
                      : "text-white/80 hover:text-white hover:bg-white/20"
                  } px-2 py-1 rounded-lg`}
                >
                  <div className="w-5 h-5">{item.icon}</div>
                  <span className="text-xs mt-0.5">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Expandable Content Area */}
        {activeTab && (
          <div className="bg-gradient-to-br from-blue-300 via-teal-200 to-green-300 shadow-xl w-full">
            <div className="max-w-md mx-auto p-3">
              {activeTab === "achievements" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                      <Trophy className="w-5 h-5" /> Achievements
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                    {" "}
                    {/* Added max-height and overflow */}
                    {localAchievements?.map((achievement) => (
                      <div
                        key={achievement?.id || Math.random()}
                        className="p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                              {getAchievementIcon(achievement.id)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">
                                {achievement.title}
                              </p>
                              <p className="text-xs text-gray-600">
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                          {renderStars(achievement)}
                        </div>
                        <div className="mt-2">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                              style={{
                                width: `${Math.min(
                                  getProgress(achievement) || 0,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-600">
                              {achievement?.progress || 0} /{" "}
                              {getNextLevel(achievement) || 0}
                            </span>
                            <span className="text-xs text-gray-600">
                              {Math.round(getProgress(achievement) || 0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "shop" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-purple-600 flex items-center gap-2">
                    <Store className="w-5 h-5" /> Shop
                  </h3>

                  {/* Special Items Section */}
                  <div className="border border-purple-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection("specialItems")}
                      className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 transition-colors"
                    >
                      <span className="font-medium text-purple-800">
                        Special Items
                      </span>
                      {expandedSection === "specialItems" ? (
                        <ChevronUp className="w-5 h-5 text-purple-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-purple-600" />
                      )}
                    </button>
                    {expandedSection === "specialItems" && (
                      <div className="p-4 bg-white space-y-3">
                        {shopItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                {item.icon}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800">
                                  {item.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handlePurchase(item)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors
                                ${
                                  coins >= item.price
                                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                              disabled={coins < item.price}
                            >
                              <Coins className="w-4 h-4" />
                              <span>{item.price}</span>
                              {purchasedItems[item.id] > 0 && (
                                <span className="ml-2 bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded-full">
                                  x{purchasedItems[item.id]}
                                </span>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Themes Section */}
                  <div className="border border-purple-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection("themes")}
                      className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 transition-colors"
                    >
                      <span className="font-medium text-purple-800">
                        Themes
                      </span>
                      {expandedSection === "themes" ? (
                        <ChevronUp className="w-5 h-5 text-purple-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-purple-600" />
                      )}
                    </button>
                    {expandedSection === "themes" && (
                      <div className="p-4 bg-white">
                        <p className="text-gray-600 text-sm italic">
                          Coming Soon!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-purple-600 flex items-center gap-2">
                    <Settings className="w-5 h-5" /> Settings
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      {
                        name: "Mute Sound",
                        icon: <VolumeX className="w-4 h-4" />,
                      },
                      {
                        name: "Change Username",
                        icon: <User className="w-4 h-4" />,
                      },
                      {
                        name: "Information",
                        icon: <Info className="w-4 h-4" />,
                      },
                    ].map((item, index) => (
                      <button
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                            {item.icon}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">
                            {item.name}
                          </span>
                        </div>
                        <div className="text-gray-400">
                          <Settings className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Achievements;