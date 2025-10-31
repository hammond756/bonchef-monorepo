/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    fontFamily: {
      'montserrat': ['Montserrat-Regular', 'Montserrat-Light'],
      'lora': ['Lora-Regular'],
      'sans': ['Montserrat-Regular'],
      'serif': ['Lora-Regular'],
    },
    extend: {
      colors: {
        'green-secondary': '#ebffed',
        'green-primary': '#16a34a'
      }
    }
  },
  plugins: [],
};