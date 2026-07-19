// Neon-arcade design tokens — the single source of truth for colors, radii and
// motion used from JavaScript (inline styles / framer-motion). Tailwind mirrors
// these in tailwind.config.js; the live theme values are mirrored into CSS
// custom properties in index.css so the score-tier background can crossfade
// without re-rendering React.

export const colors = {
  bg: {
    base: "#0E1117", // app base, splash, home
    panel: "#161B27", // cards, panels
    panel2: "#1E2533", // raised rows
  },
  line: "#2A3346", // hairline borders
  text: {
    hi: "#F5F7FF", // primary text
    lo: "#9AA6C0", // secondary text
  },

  // Block accent colors — kept constant across every score tier so players
  // keep their learned color→gesture mapping. Retuned to glow on dark.
  blocks: {
    swipeLeft: "#FF5C72", // coral-red
    swipeRight: "#2EE6D6", // teal
    swipeUp: "#38BDF8", // sky
    swipeDown: "#6EE7B7", // mint
    tap: "#FFD60A", // amber
    doubleTap: "#FF2E93", // magenta
    avoid: "#141824", // dark "danger" tile (glows red, see glowFor)
    extraLive: "#FF3B5C", // heart red
    coins: "#FFC93D", // gold (was green — disambiguates from swipeDown)
  },

  // Semantic
  danger: "#FF3B5C",
  success: "#6EE7B7",
  coin: "#FFC93D",
  life: "#FF3B5C",
  timer: "#38BDF8",
  timerLow: "#FFB020",
  timerCritical: "#FF3B5C",
};

// One radius scale (replaces the ad-hoc lg/xl/2xl/3xl/full mix).
export const radius = {
  xs: 8,
  sm: 12,
  md: 16, // blocks
  lg: 24, // cards / panels
  pill: 999,
};

export const motion = {
  tap: 0.12, // 120ms press feedback
  screen: 0.3, // 300ms screen transitions
  screenEase: [0.22, 1, 0.36, 1],
  spring: { type: "spring", stiffness: 300, damping: 24 },
};

// hex (#RRGGBB) → rgba() string at the given alpha. Used to build glow shadows.
export const hexA = (hex, alpha) => {
  const h = (hex || "").replace("#", "");
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// The color a block should glow with (avoid is a dark tile that glows danger-red).
export const glowFor = (blockType, blockColor) =>
  blockType === "avoid" ? colors.danger : blockColor;

// Build a static (non-animated) 2-layer glow for a block, scaled by the tier's
// glow intensity. Static box-shadow is cheap; animating it is what kills fps.
export const blockGlow = (glowColor, intensity = 0.8) => {
  const near = Math.round(8 * intensity);
  const far = Math.round(24 * intensity);
  return `0 0 ${near}px ${hexA(glowColor, 0.6)}, 0 0 ${far}px ${hexA(
    glowColor,
    0.35
  )}`;
};
