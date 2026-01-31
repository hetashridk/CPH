/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        'dark-bg': '#030305',
        'dark-surface': '#0F1115',
        'dark-card': '#181B21',
        primary: '#00C6FF',
        secondary: '#0072FF',
        holo: {
          bg: '#F8F9FC',
          primary: '#00C6FF',
          secondary: '#0072FF',
          accent: '#FF00E6',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 15s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
