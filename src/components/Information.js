import React, { useState, useEffect, useRef } from "react";
import {
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

  const handleScrollTo = (position) => {
    if (!contentRef.current) return;
    contentRef.current.scrollTo({
      top: position === "top" ? 0 : contentRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 20;
      setIsScrolledDown(isNearBottom);
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll);
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
      icon: <Circle className="w-4 h-4 text-white" />,
      name: "Tap",
      description: "Tap once to score",
      bgColor: "bg-[#FFD60A]",
      textColor: "text-white",
    },
    {
      icon: <CircleDot className="w-4 h-4 text-white" />,
      name: "Double Tap",
      description: "Tap twice quickly to score",
      bgColor: "bg-[#FF2E93]",
      textColor: "text-white",
    },
    {
      icon: <ArrowUp className="w-4 h-4 text-white" />,
      name: "Swipe Up",
      description: "Swipe upward to score",
      bgColor: "bg-[#38BDF8]",
      textColor: "text-white",
    },
    {
      icon: <ArrowDown className="w-4 h-4 text-white" />,
      name: "Swipe Down",
      description: "Swipe downward to score",
      bgColor: "bg-[#6EE7B7]",
      textColor: "text-white",
    },
    {
      icon: <ArrowLeft className="w-4 h-4 text-white" />,
      name: "Swipe Left",
      description: "Swipe left to score",
      bgColor: "bg-[#FF5C72]",
      textColor: "text-white",
    },
    {
      icon: <ArrowRight className="w-4 h-4 text-white" />,
      name: "Swipe Right",
      description: "Swipe right to score",
      bgColor: "bg-[#2EE6D6]",
      textColor: "text-white",
    },
    {
      icon: <Heart className="w-4 h-4 text-white" />,
      name: "Extra Life",
      description: "Gives one extra life",
      bgColor: "bg-[#FF3B5C]",
      textColor: "text-white",
    },
    {
      icon: <Coins className="w-4 h-4 text-white" />,
      name: "Coins",
      description: "Gives 15 gold coins",
      bgColor: "bg-[#FFC93D]",
      textColor: "text-white",
    },
    {
      icon: <X className="w-4 h-4 text-[#FF3B5C]" />,
      name: "Avoid",
      description: "Avoid this block or lose a life",
      bgColor: "bg-[#141824] border border-[#FF3B5C]/50",
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
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-bg-panel border border-line rounded-2xl w-full max-h-[80vh] overflow-y-auto relative"
          ref={contentRef}
        >
          <div className="p-6 space-y-6">
            {/* Developers Section */}
            <div>
              <h3 className="text-lg font-bold text-ink-hi mb-3">
                Developers:
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {developers.map((dev, index) => (
                  <a
                    key={index}
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-neon-up hover:text-ink-hi transition-colors"
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
              <h3 className="text-lg font-bold text-ink-hi mb-3">
                Sound Effects:
              </h3>
              <div className="space-y-2">
                <a
                  href="https://www.youtube.com/@itayfux1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-neon-danger hover:text-ink-hi transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                  <span>Itay Fux</span>
                </a>
              </div>
            </div>

            {/* Game Blocks Section */}
            <div>
              <h3 className="text-lg font-bold text-ink-hi mb-3">
                Game Blocks:
              </h3>
              <div className="grid gap-3">
                {blocks.map((block, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div
                      className={`p-2 rounded-lg shadow-sm ${block.bgColor}`}
                    >
                      {block.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-ink-hi">
                        {block.name}
                      </h4>
                      <p className="text-sm text-ink-lo">
                        {block.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fixed Close Button Section */}
          <div className="sticky bottom-0 border-t border-line bg-bg-panel p-4">
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-neon-double hover:opacity-90 text-white rounded-lg transition-opacity"
            >
              Close
            </button>
          </div>
        </div>

        {/* Fixed Scroll Button */}
        <button
          onClick={() => handleScrollTo(isScrolledDown ? "top" : "bottom")}
          className="absolute bottom-[4.5rem] right-4 animate-bounce-gentle bg-white/10 border border-white/15 rounded-full p-2 shadow-lg hover:bg-white/20 transition-colors"
        >
          {isScrolledDown ? (
            <ChevronUp className="w-5 h-5 text-white" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Information;
