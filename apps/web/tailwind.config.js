/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#040711',
        surface: {
          DEFAULT: '#090d1a',
          elevated: '#0f172a',
          card: 'rgba(15, 23, 42, 0.65)',
          border: 'rgba(56, 189, 248, 0.15)',
        },
        brand: {
          blue: '#38bdf8',
          cyan: '#06b6d4',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          pink: '#ec4899',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
        primary: {
          DEFAULT: '#38bdf8',
          hover: '#0284c7',
          glow: 'rgba(56, 189, 248, 0.35)',
        },
        semantic: {
          success: '#10b981',
          warning: '#f59e0b',
          critical: '#ef4444',
          info: '#0ea5e9',
          neutral: '#64748b',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.5)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.5)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.5)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'glass-hover': '0 12px 40px 0 rgba(56, 189, 248, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'gradient-neon': 'linear-gradient(135deg, #38bdf8 0%, #8b5cf6 50%, #ec4899 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(9, 13, 26, 0.9) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-up': 'float-up 0.4s ease-out both',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'radar-scan': 'radar-scan 4s linear infinite',
      },
      keyframes: {
        'float-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(56,189,248,0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px rgba(139,92,246,0.8))' },
        },
      },
    },
  },
  plugins: [],
};
