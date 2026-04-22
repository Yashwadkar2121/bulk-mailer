/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#07070d',
          900: '#0d0d16',
          800: '#12121e',
          700: '#191926',
          600: '#22223a',
          500: '#2e2e4a',
          400: '#4a4a6a',
          300: '#7070a0',
          200: '#a0a0c8',
          100: '#d0d0e8',
        },
        volt: {
          DEFAULT: '#c6f135',
          dark: '#a8d020',
          light: '#d8ff50',
        },
        ember: {
          DEFAULT: '#ff5c3a',
          light: '#ff7a5c',
        },
        aqua: {
          DEFAULT: '#38f0c0',
          dark: '#20d4a4',
        },
      },
      boxShadow: {
        'volt': '0 0 30px rgba(198,241,53,0.2)',
        'ember': '0 0 30px rgba(255,92,58,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'grid': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M0 0h1v40H0zM40 0h1v40h-1zM0 0h40v1H0zM0 40h40v1H0z' fill='%23ffffff' fill-opacity='0.03'/%3E%3C/g%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
}
