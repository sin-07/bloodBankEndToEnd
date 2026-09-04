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
        'glow-sm': '0 0 15px rgba(225, 29, 72, 0.25)',
        'glow-md': '0 0 30px rgba(225, 29, 72, 0.35)',
        'glow-lg': '0 0 50px rgba(225, 29, 72, 0.45)',
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.35)',
        'glass-sm': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        'glass-lg': '0 10px 40px -4px rgba(0, 0, 0, 0.5)',
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
