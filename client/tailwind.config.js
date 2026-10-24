/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Source Sans 3', 'Segoe UI', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        ink: '#14213d',
        paper: '#f6f1e7',
        accent: '#c45c26',
        moss: '#2f6f5e',
      },
    },
  },
  plugins: [],
};
