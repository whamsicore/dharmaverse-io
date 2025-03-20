/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
        'pt-safe': 'env(safe-area-inset-top)',
      },
      margin: {
        'safe': 'env(safe-area-inset-bottom)',
      }
    },
  },
  plugins: [],
} 