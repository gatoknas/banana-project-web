/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html",
    "./src/**/*.vue",
    "./src/**/*.js",
    "./src/**/*.ts",
    "./src/**/*.jsx",
    "./src/**/*.tsx"
  ],
  theme: {
    extend: {
      colors: {
        crimson: "#b73301",
        goldenrod: "#FFD700",
        "golden-title": "#fab214",
        "less-golden": "#efbe78",
        turquoise: "#40E0D0",
        "sky-blue": "#3498DB",
        emerald: "#016a4d",
        lavender: "#E6E6FA",
        cream: "#FFFDD0",
        guayaba: "#de9a7f"
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        nunito: ["Nunito", "sans-serif"]
      },
      borderWidth: {
        '6': '6px',
        '8': '8px',
      },
      boxShadow: {
        'retro': '4px 4px 0px 0px rgba(0, 0, 0, 0.85)',
        'retro-lg': '8px 8px 0px 0px rgba(0, 0, 0, 0.85)',
        'retro-sm': '2px 2px 0px 0px rgba(0, 0, 0, 0.85)',
      }
    },
  },
  plugins: [],
}
