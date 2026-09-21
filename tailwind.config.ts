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
        background: "var(--background)",
        foreground: "var(--foreground)",
        bnb: {
          yellow: "#F0B90B",
          dark: "#1E2026",
          gold: "#F3BA2F",
          light: "#FAFAFA",
        }
      },
    },
  },
  plugins: [],
};
export default config;
