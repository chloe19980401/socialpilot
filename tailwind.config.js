/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff4ff',
          100: '#dbe6fe',
          500: '#3b6ef6',
          600: '#2b5bef',
          700: '#1f47d6',
        },
      },
    },
  },
  plugins: [],
}
