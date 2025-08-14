/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
        'sans': ['Inter', 'sans-serif'],
        'code': ['"Fira Code"', 'monospace'],
      },
      colors: {
        primary: {
          bright: '#3096F3',
          deep: '#2361D9',
        },
        neutral: {
          light: '#F4F5F3',
          medium: '#CED4DA',
          dark: '#2B2B2B',
        },
        background: {
          light: '#F4F5F3',
          dark: '#1A1A1A',
        },
        accent: {
          success: '#4CAF50',
          warning: '#FFC107',
          error: '#F44336',
        }
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
      },
      boxShadow: {
        'light': '0px 2px 6px rgba(0, 0, 0, 0.08)',
        'dark': '0px 2px 6px rgba(0, 0, 0, 0.4)',
        'hover-light': '0px 4px 12px rgba(0, 0, 0, 0.12)',
        'hover-dark': '0px 4px 12px rgba(0, 0, 0, 0.6)',
      },
      fontSize: {
        'h1': '32px',
        'h2': '24px',
        'h3': '18px',
        'body': '16px',
        'small': '14px',
        'code': '14px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(48, 150, 243, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(48, 150, 243, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};