import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14110f",
        paper: "#faf7f2",
        accent: "#bd5539",
        muted: "#79736d",
        line: "#e9e2d9",
        mist: "#f2ede6",
      },
      fontFamily: {
        serif: ["Iowan Old Style", "Baskerville", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: { card: "0 12px 36px rgba(49, 38, 28, .045)" },
    },
  },
  plugins: [],
};
export default config;
