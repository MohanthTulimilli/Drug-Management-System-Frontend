/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Medical SaaS palette: deep navy + teal + mint accents
        primary: { 50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63' },
        accent: { 50: '#f0fdf9', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59' },
        dark: { 50: '#0b1220', 100: '#0f172a', 200: '#111827', 300: '#020617', 400: '#1e293b', 500: '#334155', 600: '#475569', 700: '#64748b', 800: '#94a3b8', 900: '#e5e7eb', 950: '#f9fafb' }
      },
      boxShadow: {
        'glow-primary': '0 10px 40px rgba(6, 182, 212, 0.35)',
        'glow-accent': '0 10px 40px rgba(20, 184, 166, 0.35)',
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.01)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out forwards',
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
      },
    }
  },
  plugins: [],
}
