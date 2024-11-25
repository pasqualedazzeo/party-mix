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
          'Plus Jakarta Sans',
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
        display: [
          'Clash Display',
          'Plus Jakarta Sans',
          'system-ui',
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
      fontSize: {
        'display-large': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-medium': ['3.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-small': ['3rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
      },
    },
  },
  plugins: [],
}
