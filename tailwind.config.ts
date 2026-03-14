import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        app: "#FAF8F5",
        surface: "#FFFFFF",
        subtle: "#F3F0EC",
        crimsonSubtle: "#F8E8EB",
        primary: "#171717",
        secondary: "#5F5A55",
        tertiary: "#8A837C",
        onCrimson: "#FFFFFF",
        brand: {
          crimson: "#B4233C",
          crimsonActive: "#C7364F",
          crimsonDeep: "#7A1E2D",
          crimsonTint: "#F8E8EB",
        },
        border: {
          default: "#E7E1DA",
          strong: "#D7CFC7",
          crimson: "#C7364F",
        },
        semantic: {
          success: "#2F7D61",
          successBg: "#E9F5EF",
          warning: "#B8891E",
          warningBg: "#FCF4DF",
          danger: "#A63A4B",
          dangerBg: "#FBECEE",
          info: "#3A6EA5",
          infoBg: "#EDF4FB",
        },
      },
    },
  },
  plugins: [],
};

export default config;
