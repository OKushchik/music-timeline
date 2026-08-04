/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   '#6C63FF',
        secondary: '#FF6584',
        dark:      '#1A1A2E',
        darker:    '#16213E',
        card:      '#0F3460',
        accent:    '#E94560',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

