/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette - Dark Japanese aesthetic
        primary: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Parent (Oya) - Gold/Warm
        parent: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#b45309',
          bg: '#422006',
        },
        // Child (Ko) - Cool Blue
        child: {
          light: '#dbeafe',
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
          bg: '#1e3a5f',
        },
        // Surface colors
        surface: {
          dark: '#0f0f1a',
          DEFAULT: '#1a1a2e',
          light: '#25253d',
          lighter: '#2d2d4a',
        },
        // Score button variants
        score: {
          low: '#10b981',      // Green - low scores
          mid: '#3b82f6',      // Blue - medium scores
          high: '#f59e0b',     // Amber - high scores
          rare: '#ec4899',     // Pink - rare scores
          tsumo: '#8b5cf6',    // Purple - tsumo scores
        }
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'system-ui', 'sans-serif'],
        display: ['"M PLUS Rounded 1c"', '"Noto Sans JP"', 'sans-serif'],
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'score': '0 4px 14px 0 rgba(0, 0, 0, 0.3)',
        'score-active': '0 2px 8px 0 rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.4)',
      },
      animation: {
        'press': 'press 0.1s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        press: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
