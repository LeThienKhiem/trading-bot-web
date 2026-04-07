import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FAFAF8",
        surface: "#FFFFFF",
        "surface-alt": "#F5F2ED",
        border: "#E8E4DE",
        "border-light": "#F0EDE8",
        primary: "#1A1814",
        secondary: "#6B6560",
        subtle: "#A09890",
        gold: "#B8975A",
        "gold-light": "#D4B896",
        positive: "#2D6A4F",
        negative: "#8B3A3A",
        neutral: "#6B6560",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        luxury: "0.15em",
        "luxury-wide": "0.3em",
      },
    },
  },
  plugins: [],
};
export default config;
