/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial"],
      },
      colors: {
        glass: {
          50: "rgba(255,255,255,0.8)",
          100: "rgba(255,255,255,0.6)",
          200: "rgba(255,255,255,0.3)",
          300: "rgba(255,255,255,0.2)",
        },
        ink: {
          50: "#f4f6f5",
          100: "#e6ebe8",
          200: "#c7d1cb",
          300: "#9aa9a0",
          400: "#6c7b73",
          500: "#4b5953",
          600: "#343f3a",
          700: "#232b27",
          800: "#161c19",
          900: "#0f1311",
        },
        aurora: {
          100: "#c8f7c6",
          200: "#9ae6a0",
          300: "#6ad47e",
          400: "#3db963",
          500: "#278f4b",
        },
      },
      boxShadow: {
        glass: "0 20px 60px rgba(15, 23, 42, 0.25)",
        glow: "0 0 0 1px rgba(255,255,255,0.15) inset, 0 12px 40px rgba(14, 116, 144, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(255,255,255,0.15) inset, 0 12px 40px rgba(14, 116, 144, 0.18)" },
          "50%": { boxShadow: "0 0 0 1px rgba(255,255,255,0.25) inset, 0 18px 50px rgba(99, 102, 241, 0.25)" },
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0px)" },
        },
      },
      animation: {
        floatSlow: "floatSlow 6s ease-in-out infinite",
        shimmer: "shimmer 10s ease-in-out infinite",
        glowPulse: "glowPulse 6s ease-in-out infinite",
        fadeUp: "fadeUp 600ms ease-out",
      },
    },
  },
  plugins: [],
};
