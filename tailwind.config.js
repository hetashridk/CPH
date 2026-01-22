/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#030305',
          surface: '#0E0E11',
          card: 'rgba(255, 255, 255, 0.03)',
        },
        primary: {
          DEFAULT: '#00F0FF', // Neon Cyan
          glow: '#00F0FF80',
        },
        secondary: {
          DEFAULT: '#7000FF', // Electric Purple
          glow: '#7000FF80',
        },
        accent: {
          DEFAULT: '#FF2E7E', // Hyper Pink
        },
        gray: {
          100: '#E0E0E0',
          200: '#C2C2C2',
          300: '#A3A3A3',
          400: '#858585',
          500: '#666666',
          600: '#474747',
          700: '#292929',
          800: '#1F1F1F',
          900: '#141414',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #00F0FF 0deg, #7000FF 180deg, #FF2E7E 360deg)',
        'noise': "url('https://grainy-gradients.vercel.app/noise.svg')",
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(0, 240, 255, 0.5)',
        'glow-purple': '0 0 20px -5px rgba(112, 0, 255, 0.5)',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
