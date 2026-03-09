/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1A237E",
        copper: "#B87333",
        blue: "#1976D2",
        orange: "#FF6F00",
        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
