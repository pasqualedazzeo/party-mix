/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter', 
          'system-ui', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          'Segoe UI', 
          'Roboto', 
          'Helvetica Neue', 
          'Arial', 
          'sans-serif'
        ],
      },
      colors: {
        'dark-bg': '#121212',
        'dark-surface': '#1E1E1E',
        'dark-highlight': '#282828',
        'dark-text': '#B3B3B3',
        'spotify-green': '#1DB954',
      },
    },
  },
  plugins: [],
}
