/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tradelock: {
          bg: "#070A10",
          surface: "#0D131F",
          card: "#121A2B",
          cardHover: "#162035",
          border: "#1E2A3E",
          borderLight: "#2B3B55",
          cyan: "#00E5FF",
          cyanGlow: "rgba(0, 229, 255, 0.2)",
          emerald: "#10B981",
          emeraldGlow: "rgba(16, 185, 129, 0.2)",
          amber: "#F59E0B",
          rose: "#EF4444",
          purple: "#A855F7",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scanline 2s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
