/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        navy: {
          deep: "#111936",
          sidebar: "#172044",
          text: "#182044",
        },
        brand: {
          purple: "#6555F5",
          bright: "#7C5CFF",
          soft: "#EEEAFE",
          lavender: "#F4F5FF",
        },
        muted: "#66708F",
        status: {
          success: "#32B67A",
          warning: "#F4B942",
          error: "#E55353",
        },
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(24, 32, 68, 0.06), 0 2px 6px -1px rgba(24, 32, 68, 0.03)",
        hover: "0 10px 25px -4px rgba(101, 85, 245, 0.14), 0 4px 10px -2px rgba(24, 32, 68, 0.05)",
        nav: "0 6px 18px -2px rgba(101, 85, 245, 0.42)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
    },
  },
  plugins: [],
};
