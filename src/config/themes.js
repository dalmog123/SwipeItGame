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
    threshold: 500,
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
    threshold: 1000,
    background: "#2a3d45", // Dark teal
    blocks: {
      swipeLeft: "#ff9a8c", // Coral
      swipeRight: "#88d8b0", // Mint
      swipeUp: "#7eb2dd", // Steel blue
      swipeDown: "#b6c199", // Sage
      tap: "#ffd07b", // Marigold
      doubleTap: "#e6a4b4", // Dusty rose
      avoid: "#ffffff", // White
      extraLive: "#ff8fa3", // Light coral
      coins: "#a7d7c5", // Seafoam
    },
  },
  {
    threshold: 2500,
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
    threshold: 5000,
    background: "#3f0d12", // Deep burgundy
    blocks: {
      swipeLeft: "#f8b195", // Peach
      swipeRight: "#f67280", // Salmon
      swipeUp: "#c06c84", // Mauve
      swipeDown: "#6c5b7b", // Purple gray
      tap: "#f9d56e", // Golden yellow (changed from soft yellow)
      doubleTap: "#f8c4b4", // Light coral
      avoid: "#ffffff", // White
      extraLive: "#ffb5b5", // Light pink
      coins: "#bee5b0", // Mint
    },
  },
  {
    threshold: 10000,
    background: "#0d0d0d", // Very dark gray for contrast
    blocks: {
      swipeLeft: "transparent",
      swipeRight: "transparent",
      swipeUp: "transparent",
      swipeDown: "transparent",
      tap: "transparent",
      doubleTap: "transparent",
      avoid: "transparent",
      extraLive: "transparent",
      coins: "transparent",
    },
    originalColors: {
      swipeLeft: "#FF6B6B",
      swipeRight: "#4ECDC4",
      swipeUp: "#45B7D1",
      swipeDown: "#96CEB4",
      tap: "#FFBE0B",
      doubleTap: "#FF006E",
      avoid: "#000000",
      extraLive: "#ff0000",
      coins: "#22d65e",
    },
  },
  {
    threshold: 15000,
    background: "#0d0d0d", // Very dark gray for contrast
    blocks: {
      swipeLeft: "transparent",
      swipeRight: "transparent",
      swipeUp: "transparent",
      swipeDown: "transparent",
      tap: "transparent",
      doubleTap: "transparent",
      avoid: "transparent",
      extraLive: "transparent",
      coins: "transparent",
    },
  },
];

export const getThemeForScore = (score) => {
  return scoreThemes
    .slice()
    .reverse()
    .find((theme) => score >= theme.threshold);
};
