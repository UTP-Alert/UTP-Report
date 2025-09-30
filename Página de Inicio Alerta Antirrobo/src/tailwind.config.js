/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF395C',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#000000',
          foreground: '#ffffff',
        },
      },
    },
  },
  plugins: [],
}