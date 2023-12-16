import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Comfortaa", "sans-serif"],
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: {
        100: "#D7DBE3",
        300: "#98A4BC",
        500: "#57647D",
        700: "#303B4E",
        900: "#111317",
      },
      blue: {
        100: "#E4EEFF",
        200: "#C5DBFD",
        300: "#99BDF8",
        400: "#6498EE",
        500: "#3B82F6",
        600: "#3672D3",
        700: "#215CBC",
        800: "#163669",
        900: "#081F45",
      },
      red: {
        100: "#FFE4E4",
        300: "#F89999",
        500: "#F63B3B",
        700: "#BC2121",
        900: "#450808",
      },
      green: {
        100: "#E5FFE4",
        300: "#C3F899",
        500: "#55F63B",
        700: "#40BC21",
        900: "#114508",
      },
    },
  },
  plugins: [],
};
