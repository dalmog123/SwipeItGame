import React, { useState, useEffect, useRef } from "react";
import {
  Tap,
  Circle,
  CircleDot,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Heart,
  Coins,
  X,
  Youtube,
  Linkedin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const Information = ({ onClose }) => {
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      setIsScrolledDown(isNearBottom);
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll);
      // Initial check
      handleScroll();
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const blocks = [
    {
      icon: <Circle className="w-4 h-4 text-black" />,
      name: "Tap",
      description: "Tap once to score",
      bgColor: "bg-[#FFBE0B]",
      textColor: "text-black",
    },
    {
      icon: <CircleDot className="w-4 h-4 text-white" />,
      name: "Double Tap",
      description: "Tap twice quickly to score",
      bgColor: "bg-[#FF006E]",
      textColor: "text-white",
    },
    {
      icon: <ArrowUp className="w-4 h-4 text-white" />,
      name: "Swipe Up",
      description: "Swipe upward to score",
      bgColor: "bg-[#45B7D1]",
      textColor: "text-white",
    },
    {
      icon: <ArrowDown className="w-4 h-4 text-white" />,
      name: "Swipe Down",
      description: "Swipe downward to score",
      bgColor: "bg-[#96CEB4]",
      textColor: "text-white",
    },
    {
      icon: <ArrowLeft className="w-4 h-4 text-white" />,
      name: "Swipe Left",
      description: "Swipe left to score",
      bgColor: "bg-[#FF6B6B]",
      textColor: "text-white",
    },
    {
      icon: <ArrowRight className="w-4 h-4 text-white" />,
      name: "Swipe Right",
      description: "Swipe right to score",
      bgColor: "bg-[#4ECDC4]",
      textColor: "text-white",
    },
    {
      icon: <Heart className="w-4 h-4 text-white" />,
      name: "Extra Life",
      description: "Gives one extra life",
      bgColor: "bg-[#ff0000]",
      textColor: "text-white",
    },
    {
      icon: <Coins className="w-4 h-4 text-yellow-500" />,
      name: "Coins",
      description: "Gives 15 gold coins",
      bgColor: "bg-[#22d65e]",
      textColor: "text-yellow-900",
    },
    {
      icon: <X className="w-4 h-4 text-white" />,
      name: "Avoid",
      description: "Avoid this block or lose a life",
      bgColor: "bg-black",
      textColor: "text-white",
    },
  ];

  const developers = [
    {
      name: "Yuval Chen",
      linkedin: "https://www.linkedin.com/in/yuval-chen/",
      primary: false,
    },
    {
      name: "Almog Dror",
      linkedin: "https://www.linkedin.com/in/almogdror/",
      primary: false,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-md w-full">
        <div
          className="bg-white rounded-lg w-full max-h-[80vh] overflow-y-auto"
          ref={contentRef}
        >
          <div className="p-6 space-y-6">
            {/* Developers Section */}
            <div>
              <h3 className="text-lg font-bold text-purple-600 mb-3">
                Developers:
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {developers.map((dev, index) => (
                  <a
                    key={index}
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 ${
                      dev.primary
                        ? "text-blue-600 hover:text-blue-800"
                        : "text-blue-500 hover:text-blue-700"
                    } transition-colors`}
                  >
                    <Linkedin className="w-4 h-4" />
                    <span className={dev.primary ? "font-medium" : ""}>
                      {dev.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Sound Credits Section */}
            <div>
              <h3 className="text-lg font-bold text-purple-600 mb-3">
                Sound Effects:
              </h3>
              <div className="space-y-2">
                <a
                  href="https://www.youtube.com/@itayfux1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                  <span>Itay Fux</span>
                </a>
              </div>
            </div>

            {/* Game Blocks Section */}
            <div>
              <h3 className="text-lg font-bold text-purple-600 mb-3">
                Game Blocks:
              </h3>
              <div className="grid gap-3">
                {blocks.map((block, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`p-2 rounded-lg shadow-sm ${block.bgColor}`}
                    >
                      {block.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {block.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {block.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="border-t p-4">
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Scroll Indicator - Changed from fixed to absolute */}
        <div className="absolute -bottom-0 right-2 animate-bounce-gentle">
          <div className="bg-purple-600 rounded-full p-2 shadow-lg">
            {isScrolledDown ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Information;
