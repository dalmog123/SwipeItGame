import { colors } from "./designTokens";

// Score tiers as ONE coherent progression rather than 7 unrelated palettes:
// the block hues stay constant (players keep their color→gesture mapping) while
// the background deepens and the glow intensity rises as the score climbs.
//
// `glow` is a 0–1.5 multiplier consumed by Block.js to scale each block's neon
// halo. (Previously 10000+ made blocks fully transparent — near-invisible; now
// the reward for a high score is *more* glow, never less visibility.)
const NEON_BLOCKS = colors.blocks;

const tier = (threshold, background, glow, name) => ({
  threshold,
  background,
  glow,
  name,
  blocks: NEON_BLOCKS,
});

export const scoreThemes = [
  tier(0, "#0E1117", 0.6, "Slate"),
  tier(500, "#0B1026", 0.75, "Indigo"),
  tier(1000, "#14082B", 0.9, "Violet"),
  tier(2500, "#1A0620", 1.05, "Magenta"),
  tier(5000, "#06121F", 1.2, "Abyssal"),
  tier(10000, "#030A14", 1.35, "Deep Void"),
  tier(15000, "#000000", 1.5, "Singularity"),
];

export const getThemeForScore = (score) => {
  return scoreThemes
    .slice()
    .reverse()
    .find((theme) => score >= theme.threshold);
};
