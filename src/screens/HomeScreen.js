import { motion } from "framer-motion";
import { Play, Store, Trophy, BarChart3, Settings, Coins } from "lucide-react";
import { colors } from "../config/designTokens";

// Secondary navigation shown under the PLAY button. Each routes to a top-level
// screen handled by App.js.
const NAV = [
  { id: "leaderboard", icon: BarChart3, label: "Ranks", color: colors.blocks.swipeUp },
  { id: "shop", icon: Store, label: "Shop", color: colors.blocks.doubleTap },
  { id: "achievements", icon: Trophy, label: "Awards", color: colors.coin },
  { id: "settings", icon: Settings, label: "Settings", color: colors.blocks.swipeRight },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function HomeScreen({ coins = 0, highScore = 0, onPlay, onNavigate }) {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex flex-col items-center justify-between overflow-hidden"
      style={{ backgroundColor: colors.bg.base }}
    >
      {/* Ambient radial glow behind the title (opacity-only pulse — GPU cheap) */}
      <div
        className="pointer-events-none absolute left-1/2 top-[34%] h-[80vw] w-[80vw] max-h-[420px] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full animate-glow-pulse motion-reduce:animate-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,46,147,0.28) 0%, rgba(56,189,248,0.14) 45%, rgba(14,17,23,0) 70%)",
        }}
      />

      {/* Top bar: coins */}
      <div className="safe-area-padding relative z-10 flex w-full items-center justify-end px-5 pt-4">
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          <Coins className="h-4 w-4" style={{ color: colors.coin }} />
          <span className="font-numeric text-lg font-bold text-ink-hi">
            {(coins || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Center: wordmark + PLAY */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-1 flex-col items-center justify-center gap-10 px-6"
      >
        <motion.div variants={item} className="text-center leading-none">
          <div
            className="font-display text-6xl font-black tracking-tight text-ink-hi"
            style={{ textShadow: "0 0 12px rgba(245,247,255,0.35)" }}
          >
            SWIPE
          </div>
          <div
            className="font-display text-6xl font-black tracking-tight"
            style={{ color: colors.blocks.doubleTap, textShadow: `0 0 18px ${colors.blocks.doubleTap}` }}
          >
            IT!
          </div>
          {highScore > 0 && (
            <div className="mt-4 font-numeric text-sm uppercase tracking-widest text-ink-lo">
              Best&nbsp;
              <span className="text-ink-hi">{highScore.toLocaleString()}</span>
            </div>
          )}
        </motion.div>

        <motion.button
          variants={item}
          onClick={onPlay}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 rounded-full px-14 py-5"
          style={{
            background: "linear-gradient(90deg, rgba(255,46,147,0.18), rgba(56,189,248,0.18))",
            border: `2px solid ${colors.blocks.doubleTap}`,
            boxShadow: `0 0 18px ${colors.blocks.doubleTap}66, 0 0 40px ${colors.blocks.swipeUp}44`,
          }}
        >
          <Play className="h-7 w-7 fill-current text-ink-hi" />
          <span
            className="font-display text-2xl font-bold tracking-widest text-ink-hi"
            style={{ textShadow: "0 0 10px rgba(245,247,255,0.5)" }}
          >
            PLAY
          </span>
        </motion.button>
      </motion.div>

      {/* Bottom: secondary nav */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="safe-area-padding relative z-10 flex w-full items-center justify-center gap-4 px-6 pb-8"
      >
        {NAV.map(({ id, icon: Icon, label, color }) => (
          <motion.button
            key={id}
            variants={item}
            onClick={() => onNavigate(id)}
            whileTap={{ scale: 0.92 }}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-white/5"
              style={{ borderColor: `${color}55`, boxShadow: `0 0 10px ${color}33` }}
            >
              <Icon className="h-6 w-6" style={{ color }} />
            </span>
            <span className="font-numeric text-xs font-semibold uppercase tracking-wider text-ink-lo">
              {label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
