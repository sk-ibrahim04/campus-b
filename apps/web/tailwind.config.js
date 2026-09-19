/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#060a12',
        surface: {
          DEFAULT: '#0d1117',
          elevated: '#111827',
          border: 'rgba(38, 51, 77, 0.85)',
        },
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          glow: 'rgba(59, 130, 246, 0.25)',
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
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'glow-blue': '0 0 24px rgba(59, 130, 246, 0.4)',
        'glow-emerald': '0 0 24px rgba(16, 185, 129, 0.4)',
        'glow-purple': '0 0 24px rgba(139, 92, 246, 0.4)',
        'glow-amber': '0 0 24px rgba(245, 158, 11, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.35)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mission': 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(26, 34, 52, 0.9) 100%)',
      },
      animation: {
        'float-up': 'float-up 0.35s ease-out both',
        'radar-pulse': 'radar-pulse 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'glow-breathe': 'glow-breathe 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
