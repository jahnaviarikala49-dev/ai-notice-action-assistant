/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36a9f6',
          500: '#0c8de7',
          600: '#026fc5',
          700: '#0358a0',
          800: '#074b83',
          900: '#0c3f6d',
          950: '#082747',
        },
        accent: {
          50: '#fbf5ff',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
