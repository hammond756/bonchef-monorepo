/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    fontFamily: {
      'montserrat': ['Montserrat-Regular'],
      'lora': ['Lora-Regular'],
      'sans': ['Montserrat-Medium'],
      'serif': ['Lora-Regular'],
    },
  },
  plugins: [],
};