import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paiseh: {
          DEFAULT: "#7c3aed", // main purple
          light: "#ede9fe",
          dark: "#4c1d95",
          accent: "#fbbf24", // yellow accent
          bg: "#f8f6ff",
          bubble: "#f3f7fa",
          // Updated color scheme to match screenshot
          purple: "#7c3aed",
          "purple-dark": "#6d28d9",
          text: "#4b5563",
          "user-bubble": "#e5e7eb",
          border: "#e5e7eb",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
