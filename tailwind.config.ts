import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF8F3",
        forest: {
          DEFAULT: "#173F35",
          mid: "#397B60",
          soft: "#2A5A4C",
          muted: "#3D6B5C",
        },
        terracotta: {
          DEFAULT: "#E87950",
          soft: "#F09474",
          deep: "#C45E38",
        },
        ink: {
          DEFAULT: "#202522",
          soft: "#3A403C",
          muted: "#6B736E",
        },
        charcoal: {
          DEFAULT: "#202522",
          soft: "#3A403C",
          muted: "#6B736E",
        },
        sand: "#EFEAE0",
        mist: "#E8E4DB",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(23, 63, 53, 0.08)",
        card: "0 4px 20px rgba(23, 63, 53, 0.06)",
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
      },
      animation: {
        "fade-up": "fade-up 0.45s ease-out both",
        "fade-in": "fade-in 0.35s ease-out both",
        shimmer: "shimmer 1.4s linear infinite",
        "swipe-hint": "swipeHint 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
