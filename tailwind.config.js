/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'var(--font-sans)', 'sans-serif'],
      },
      colors: {
        blood: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        slate: {
          850: '#111827',
          900: '#0f172a',
          950: '#090d16',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(225, 29, 72, 0.2)',
        'glow-md': '0 4px 25px rgba(225, 29, 72, 0.25)',
        'glow-lg': '0 8px 35px rgba(225, 29, 72, 0.3)',
        'glow-emerald': '0 4px 20px rgba(16, 185, 129, 0.25)',
        'card': '0 2px 10px -2px rgba(15, 23, 42, 0.04), 0 8px 24px -4px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 4px 15px -2px rgba(15, 23, 42, 0.06), 0 16px 36px -4px rgba(225, 29, 72, 0.08)',
        'glass-sm': '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        'glass-lg': '0 10px 40px -4px rgba(15, 23, 42, 0.08)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        'marquee-fast': 'marquee 18s linear infinite',
        'pulse-glow': 'pulseGlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'floatSlow 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
