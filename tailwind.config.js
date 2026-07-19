/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Neon-arcade tokens (mirror of src/config/designTokens.js)
        bg: {
          base: "#0E1117",
          panel: "#161B27",
          panel2: "#1E2533",
        },
        line: "#2A3346",
        ink: {
          hi: "#F5F7FF",
          lo: "#9AA6C0",
        },
        neon: {
          left: "#FF5C72",
          right: "#2EE6D6",
          up: "#38BDF8",
          down: "#6EE7B7",
          tap: "#FFD60A",
          double: "#FF2E93",
          danger: "#FF3B5C",
          coin: "#FFC93D",
        },
      },
      fontFamily: {
        display: ["Orbitron", "system-ui", "sans-serif"],
        numeric: ["Rajdhani", "system-ui", "sans-serif"],
      },
      borderRadius: {
        block: "16px",
        card: "24px",
      },
      animation: {
        shake: "shake 0.15s linear infinite",
        swipeIn: "swipeIn 0.5s ease-out forwards",
        swipeOut: "swipeOut 0.5s ease-out forwards",
        "bounce-gentle": "bounce 2s infinite ease-in-out",
        "glow-pulse": "glowPulse 1.4s ease-in-out infinite",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        swipeIn: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        swipeOut: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-25%)" },
        },
        // Cheap glow pulse: animates opacity only (GPU-friendly), used on a
        // pseudo/overlay layer rather than animating box-shadow directly.
        glowPulse: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
