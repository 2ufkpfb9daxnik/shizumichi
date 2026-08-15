import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        quiet: {
          50: "#f0f7f4",
          100: "#dceee6",
          500: "#2a7a62",
          700: "#1a5242",
          900: "#0f3329",
        },
        noisy: {
          50: "#fef6f0",
          100: "#fde8d8",
          500: "#d4524a",
          700: "#8a3d14",
        },
        ink: {
          50: "#f6f5f2",
          100: "#ebe8e1",
          700: "#3d3a34",
          900: "#1c1b18",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Hiragino Sans", "sans-serif"],
        display: ["var(--font-outfit)", "Hiragino Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
