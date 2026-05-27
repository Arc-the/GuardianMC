import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ops: {
          bg: "#070b12",
          panel: "#101723",
          panel2: "#151f2d",
          line: "#263243",
          cyan: "#54d8ff",
          green: "#35e0a1",
          amber: "#fbbf24",
          red: "#fb7185"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
