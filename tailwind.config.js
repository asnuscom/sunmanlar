/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sunman: {
          50: '#fbf7f4',
          100: '#f6ede6',
          200: '#edd8cc',
          300: '#dfbcab',
          400: '#cf9884',
          500: '#bc7560',
          600: '#a75a47',
          700: '#874637',
          800: '#6f3b30',
          900: '#5a332a',
        }
      }
    },
  },
  plugins: [],
}
