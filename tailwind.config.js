/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0A0909',
          900: '#111010',
          800: '#181616',
          700: '#242121',
        },
        sand: {
          DEFAULT: '#D8D1C7',
          200: '#E8E3DC',
          100: '#F1EEE9',
        },
        taupe: '#8E857B',
        champagne: '#C4B49C',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Cormorant', 'Didot', '"Times New Roman"', 'serif'],
        sans: ['"Hanken Grotesk"', 'Manrope', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
