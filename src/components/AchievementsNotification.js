import React, { useState, useEffect } from "react";
import { Star, Coins, Trophy } from "lucide-react";

const AchievementsNotification = ({
  show,
  onHide,
  achievement,
  level,
  coins,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showStars, setShowStars] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setShowStars(true);

      const displayTimer = setTimeout(() => {
        setIsVisible(false);
        const hideTimer = setTimeout(onHide, 300); // Wait for fade out animation
        return () => clearTimeout(hideTimer);
      }, 3000); // Reduced to 3 seconds to make multiple notifications feel smoother

      return () => clearTimeout(displayTimer);
    }
  }, [show, onHide]);

  if (!show && !isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes star-burst {
          0% { transform: rotate(var(--star-angle)) translateY(0px) scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: rotate(var(--star-angle)) translateY(-20px) scale(1); opacity: 0; }
        }
        .animate-star-burst { animation: star-burst 1s ease-out forwards; }
        .animate-ping-short { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; animation-duration: 1.5s; }
        .animate-bounce-short { animation: bounce 1s infinite; animation-duration: 1.5s; }
      `}</style>

      <div
        className={`
        fixed bottom-0 left-1/2 -translate-x-1/2 mb-8 z-50
        transition-all duration-300 ease-out
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}
      `}
      >
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-4 shadow-lg shadow-purple-500/20">
          {showStars && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-star-burst"
                  style={{
                    "--star-angle": `${i * 45}deg`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="relative">
              <Trophy className="w-8 h-8 text-yellow-300" />
              <Star
                className={`
                absolute -top-1 -right-1 w-4 h-4 text-yellow-300 fill-yellow-300
                ${showStars ? "animate-ping-short" : ""}
              `}
              />
            </div>

            <div>
              <div className="font-bold mb-0.5 flex items-center gap-2">
                Achievement Completed!
              </div>
              <div className="text-sm text-white/90">
                {achievement} - Level {level}
              </div>
            </div>

            <div className="ml-4 pl-4 border-l border-white/20 flex items-center gap-1">
              <Coins
                className={`w-5 h-5 text-yellow-300 ${
                  showStars ? "animate-bounce-short" : ""
                }`}
              />
              <span className="font-bold">+{coins}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AchievementsNotification;
