/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: "#4f46e5",
          violet: "#7c3aed",
          cyan: "#06b6d4",
          emerald: "#10b981",
        },
      },
      boxShadow: {
        soft: "0 6px 20px rgba(17,24,39,0.08)",
        "soft-strong": "0 10px 30px rgba(17,24,39,0.12)",
      },
      backdropBlur: {
        xs: "2px",
        md: "10px",
        lg: "20px",
      },
      keyframes: {
        "slide-in": {
          "0%": { opacity: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "slide-in": "slide-in 220ms cubic-bezier(.2,.9,.2,1) both",
        "fade-in-fast": "fade-in 160ms ease-out both",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
