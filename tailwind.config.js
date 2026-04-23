/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme"

module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    fontFamily: {
      "theme-font-extra-bold": ["NeueHaasDisplayBlack", ...defaultTheme.fontFamily.sans],
      "theme-font-bold": ["NeueHaasDisplayBold", ...defaultTheme.fontFamily.sans],
      "theme-font-light": ["NeueHaasDisplayLight", ...defaultTheme.fontFamily.sans],
      "theme-font-thin": ["NeueHaasDisplayThin", ...defaultTheme.fontFamily.sans],
      "theme-font-medium": ["NeueHaasDisplayMediu", ...defaultTheme.fontFamily.sans],
      "theme-font-roman": ["NeueHaasDisplayRoman", ...defaultTheme.fontFamily.sans],
      "theme-font-light-italic": ["NeueHaasDisplayLightItalic", ...defaultTheme.fontFamily.sans],
    },
    extend: {
      colors: {
        white: "#F8F7F3",
        "container-bg": "#F8F7F3",
        "theme-gray": "#EBEAE2",
        "theme-black": "#100F0F",
      },
    },
  },
  plugins: [],
}
