/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        dark: {
          bg: "#0a0a0a",      // Natural black
          surface: "#1a1a1a",  // Slightly lighter black
          ash: "#2a2a2a",      // Ash color for cards/elements
          border: "#404040",   // Light ash for borders
          text: "#f5f5f5",     // Light text
          muted: "#a3a3a3",    // Muted text
        },
      },
    },
  },
  plugins: [],
};
