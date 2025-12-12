/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        void: {
          DEFAULT: '#0a0a0a',
          light: '#111111',
        },
        system: {
          gray: '#808080',
          cyan: '#00f0ff',
          'cyan-dim': '#00a0b0',
        },
        glitch: {
          DEFAULT: '#ff003c',
          dark: '#aa0028',
        },
        warm: {
          DEFAULT: '#fff1e6',
          dark: '#ffe4d6',
        },
        gold: {
          DEFAULT: '#ffd700',
          dim: '#c5a059',
        },
        rain: {
          DEFAULT: '#0a1628',
          deep: '#051118',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'grain': 'grain 8s steps(10) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glitch-skew': 'glitch-skew 1s infinite linear alternate-reverse',
      },
      keyframes: {
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '20%': { transform: 'translate(-15%, 5%)' },
          '30%': { transform: 'translate(7%, -25%)' },
          '40%': { transform: 'translate(-5%, 25%)' },
          '50%': { transform: 'translate(-15%, 10%)' },
          '60%': { transform: 'translate(15%, 0%)' },
          '70%': { transform: 'translate(0%, 15%)' },
          '80%': { transform: 'translate(3%, 35%)' },
          '90%': { transform: 'translate(-10%, 10%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glitch-skew': {
          '0%, 11.99%, 12.01%, 22.99%, 23.01%, 100%': { transform: 'skew(0deg)' },
          '12%, 23%': { transform: 'skew(-0.5deg)' },
        },
      },
      backgroundImage: {
        'crt-scanlines': `
          linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
          linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))
        `,
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(0, 240, 255, 0.2)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.2)',
        'glow-red': '0 0 20px rgba(255, 0, 60, 0.3), 0 0 40px rgba(255, 0, 60, 0.2)',
        'inner-dark': 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        '150': '150',
        '200': '200',
      },
      letterSpacing: {
        'ultrawide': '0.25em',
        'superwide': '0.3em',
      },
    },
  },
  plugins: [],
}
