export const scoreThemes = [
  {
    threshold: 0,
    background: "#f8f9fa", // Soft light gray
    blocks: {
      swipeLeft: "#FF6B6B", // Original red
      swipeRight: "#4ECDC4", // Original teal
      swipeUp: "#45B7D1", // Original blue
      swipeDown: "#96CEB4", // Original green
      tap: "#FFBE0B", // Original yellow
      doubleTap: "#FF006E", // Original pink
      avoid: "#000000", // Original black
      extraLive: "#ff0000", // Original red
      coins: "#22d65e", // Original green
    },
  },
  {
    threshold: 1000,
    background: "#1a1d3f", // Deep navy
    blocks: {
      swipeLeft: "#ff7eb9", // Soft pink
      swipeRight: "#7afdd6", // Turquoise
      swipeUp: "#6eb4f7", // Ocean blue
      swipeDown: "#b4e9d6", // Seafoam
      tap: "#ffd495", // Peach
      doubleTap: "#df7599", // Rose
      avoid: "#ffffff", // White
      extraLive: "#ff9eaa", // Coral
      coins: "#98f6e4", // Mint
    },
  },
  {
    threshold: 3000,
    background: "#2d1b36", // Deep purple
    blocks: {
      swipeLeft: "#c8b6ff", // Lavender
      swipeRight: "#bbd0ff", // Baby blue
      swipeUp: "#ffd6ff", // Light pink
      swipeDown: "#b8c0ff", // Periwinkle
      tap: "#ffebb3", // Cream
      doubleTap: "#e7c6ff", // Light purple
      avoid: "#ffffff", // White
      extraLive: "#ffb3c6", // Soft pink
      coins: "#b8f7d4", // Mint green
    },
  },
  {
    threshold: 5000,
    background: "#2c3639", // Dark slate
    blocks: {
      swipeLeft: "#a5c9ca", // Sage
      swipeRight: "#e7f6f2", // Mint cream
      swipeUp: "#deb6ab", // Dusty rose
      swipeDown: "#a5c0dd", // Steel blue
      tap: "#e6d5ac", // Sand
      doubleTap: "#c7b7a3", // Taupe
      avoid: "#ffffff", // White
      extraLive: "#dba39a", // Dusty pink
      coins: "#b5d5c5", // Sage green
    },
  },
  {
    threshold: 10000,
    background: "#3f0d12", // Deep burgundy
    blocks: {
      swipeLeft: "#f8b195", // Peach
      swipeRight: "#f67280", // Salmon
      swipeUp: "#c06c84", // Mauve
      swipeDown: "#6c5b7b", // Purple gray
      tap: "#ffeaa7", // Soft yellow
      doubleTap: "#f8c4b4", // Light coral
      avoid: "#ffffff", // White
      extraLive: "#ffb5b5", // Light pink
      coins: "#bee5b0", // Mint
    },
  },
];

export const getThemeForScore = (score) => {
  return scoreThemes
    .slice()
    .reverse()
    .find((theme) => score >= theme.threshold);
};
