/**
 * Tailwind CSS configuration (global plugins are declared in postcss.config.js)
 * Tailwind v4 reads this file automatically.
 */
import plugin from 'tailwindcss/plugin'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}