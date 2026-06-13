export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: { 900: "#0a0e1a", 800: "#0f1629", 700: "#151d35", 600: "#1e2d4a" },
        accent: { DEFAULT: "#6366f1", light: "#818cf8", dark: "#4f46e5" },
        cyan: { pulse: "#06b6d4" },
      },
    },
  },
  plugins: [],
};
