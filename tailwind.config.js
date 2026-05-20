/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#22d3ee',
          purple: '#c084fc',
          blue: '#3b82f6',
        },
        surface: {
          dark: 'rgba(15, 23, 42, 0.8)',
          glass: 'rgba(255, 255, 255, 0.1)',
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(34, 211, 238, 0.6), 0 0 20px rgba(34, 211, 238, 0.4)',
        'neon-purple': '0 0 10px rgba(192, 132, 252, 0.6), 0 0 20px rgba(192, 132, 252, 0.4)',
        'neon-blue': '0 0 10px rgba(59, 130, 246, 0.6), 0 0 20px rgba(59, 130, 246, 0.4)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};
