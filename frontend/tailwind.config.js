/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#070B14",
        surface: {
          DEFAULT: "#0F172A",
          hover: "#1E293B",
          subtle: "#0B1120",
          border: "#1E293B"
        },
        brand: {
          cyan: "#06B6D4",
          purple: "#A855F7",
          blue: "#3B82F6",
          emerald: "#10B981",
          rose: "#F43F5E",
          amber: "#F59E0B"
        },
        forensic: {
          dark: "#080C16",
          panel: "rgba(15, 23, 42, 0.75)",
          border: "rgba(56, 189, 248, 0.2)",
          glow: "rgba(6, 182, 212, 0.15)",
          purpleGlow: "rgba(168, 85, 247, 0.15)"
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace', 'Consolas'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-cyan': 'glowCyan 2s ease-in-out infinite alternate',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        glowCyan: {
          '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.3), inset 0 0 5px rgba(6, 182, 212, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.6), inset 0 0 10px rgba(6, 182, 212, 0.3)' },
        }
      }
    },
  },
  plugins: [],
}
