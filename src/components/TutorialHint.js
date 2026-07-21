import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { colors } from "../config/designTokens";

// Animated gesture demonstration shown under the block during the tutorial:
// an arrow that repeatedly travels in the swipe direction, or a pulsing ring
// for tap / double-tap. Purely presentational; hidden under reduced motion.
const SWIPE = {
  swipeLeft: { Icon: ArrowLeft, axis: "x", dir: -1 },
  swipeRight: { Icon: ArrowRight, axis: "x", dir: 1 },
  swipeUp: { Icon: ArrowUp, axis: "y", dir: -1 },
  swipeDown: { Icon: ArrowDown, axis: "y", dir: 1 },
};

export default function TutorialHint({ blockType }) {
  const swipe = SWIPE[blockType];

  if (swipe) {
    const { Icon, axis, dir } = swipe;
    const travel = axis === "x" ? { x: [0, dir * 26, 0] } : { y: [0, dir * 26, 0] };
    return (
      <motion.div
        className="motion-reduce:hidden"
        style={{ color: colors.text.lo }}
        animate={{ ...travel, opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon className="h-8 w-8" />
      </motion.div>
    );
  }

  // tap / double-tap → pulsing ring (double-tap pulses in quick pairs)
  const isDouble = blockType === "doubleTap";
  return (
    <motion.div
      className="motion-reduce:hidden"
      animate={{ scale: [1, 0.72, 1], opacity: [0.45, 1, 0.45] }}
      transition={{
        duration: isDouble ? 0.55 : 1,
        repeat: Infinity,
        repeatDelay: isDouble ? 0.2 : 0,
        ease: "easeInOut",
      }}
    >
      <div
        className="h-8 w-8 rounded-full border-2"
        style={{ borderColor: colors.text.lo }}
      />
    </motion.div>
  );
}
