/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F3EE',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#171717',
          600: '#262626',
          500: '#404040',
          400: '#525252',
        },
        muted: '#686868',
        line: {
          DEFAULT: '#D8D5CE',
          strong: '#BFBAB0',
          soft: '#E8E5DE',
        },
        accent: {
          DEFAULT: '#E7A52B',
          600: '#C98A1A',
          700: '#A6711A',
          soft: '#F4E3C2',
          ghost: '#FBF3E2',
        },
        danger: {
          DEFAULT: '#D83A34',
          600: '#B82E29',
          soft: '#F6DAD8',
          ghost: '#FBEDEC',
        },
        success: {
          DEFAULT: '#287A52',
          600: '#1F6242',
          soft: '#D6E8DE',
          ghost: '#ECF4EF',
        },
        warning: {
          DEFAULT: '#C97B12',
          soft: '#F6E6CB',
          ghost: '#FBF1DC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        eyebrow: '0.22em',
        tightish: '-0.02em',
        tighter2: '-0.04em',
      },
      fontSize: {
        display: ['clamp(2.75rem, 7vw, 5.75rem)', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
        headline: ['clamp(2rem, 4.5vw, 3.25rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(23,23,23,0.04), 0 8px 24px -12px rgba(23,23,23,0.10)',
        card: '0 1px 0 rgba(23,23,23,0.04), 0 12px 32px -16px rgba(23,23,23,0.12)',
        lift: '0 2px 8px rgba(23,23,23,0.06), 0 24px 60px -24px rgba(23,23,23,0.22)',
        phone: '0 40px 120px -30px rgba(23,23,23,0.45), 0 0 0 1px rgba(23,23,23,0.04)',
        ring: '0 0 0 1px rgba(23,23,23,0.08)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-6px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'dash-flow': {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        },
        'pulse-ring': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.1', transform: 'scale(1.6)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.5s ease both',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in': 'slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'dash-flow': 'dash-flow 1.2s linear infinite',
        'pulse-ring': 'pulse-ring 2.4s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
