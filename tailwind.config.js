/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0a0a0a",
        secondary: "#141414",
        tertiary: "#1a1a1a",
        accent: "#e50914",
        "accent-hover": "#f40612",
        "text-primary": "#ffffff",
        "text-secondary": "#a3a3a3",
        "text-muted": "#737373",
        border: "#2a2a2a",
        success: "#46d369",
        warning: "#f5c518",
      },
      backgroundColor: {
        primary: "#0a0a0a",
        secondary: "#141414",
        tertiary: "#1a1a1a",
      },
      textColor: {
        primary: "#ffffff",
        secondary: "#a3a3a3",
        muted: "#737373",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
