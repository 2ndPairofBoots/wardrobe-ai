import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1f1b16",
        "primary-hover": "#2f2922",
        surface: "#fff9ef",
        background: "#f6f2e9",
        border: "#d8cdbf",
        text: {
          primary: "#1f1b16",
          secondary: "#5d5043",
          muted: "#857667",
        },
        success: "#1f8d53",
        warning: "#b7791f",
        danger: "#b4534a",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
