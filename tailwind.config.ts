import type { Config } from "tailwindcss";

export default {
  // Dark mode fully disabled — class strategy with no .dark on <html>
  darkMode: ["class", '[data-theme="disabled-dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F0",
        sand: "#F1ECE3",
        card: "#FFFDF9",
        forest: {
          DEFAULT: "#344E41",
          mid: "#A7B69A",
          soft: "#4A6354",
          muted: "#5C7364",
        },
        sage: "#A7B69A",
        terracotta: {
          DEFAULT: "#C9856B",
          soft: "#D4A08C",
          deep: "#A86B52",
        },
        ink: {
          DEFAULT: "#303A32",
          soft: "#62675E",
          muted: "#7A7F76",
        },
        charcoal: {
          DEFAULT: "#303A32",
          soft: "#62675E",
          muted: "#7A7F76",
        },
        mist: "#E8DFD0",
        border: "#E8DFD0",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(52, 78, 65, 0.08)",
        // Named "lift" — "card" conflicts with color `card` and becomes a white shadow
        lift: "0 4px 24px rgba(52, 78, 65, 0.06)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        swipeHint: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(6px)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s ease-out both",
        "fade-in": "fade-in 0.35s ease-out both",
        shimmer: "shimmer 1.4s linear infinite",
        "swipe-hint": "swipeHint 1.6s ease-in-out infinite",
        "pulse-dot": "pulseDot 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
