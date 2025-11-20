/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        gradient: "gradient 8s linear infinite",
        fadeIn: "fadeIn 0.5s ease-out forwards",
        "meteor-effect": "meteor 5s linear infinite",
        // Entrance animation (Fade in + Zoom)
        spotlight: "spotlight 2s ease-out 0.5s 1 forwards",
        // NEW: Looping wave/breathe animation
        "spotlight-wave": "spotlight-wave 8s ease-in-out infinite alternate",
        float: "float 10s linear infinite",
      },
      keyframes: {
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-1000px)",
            opacity: "0",
          },
        },
        spotlight: {
          "0%": { opacity: 0, transform: "scale(0.6)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        float: {
          "0%": { transform: "translateY(0) translateX(0)", opacity: 0 },
          "10%": { opacity: 1 },
          "90%": { opacity: 1 },
          "100%": {
            transform: "translateY(-100px) translateX(20px)",
            opacity: 0,
          },
        },
        // NEW: Wave animation
        "spotlight-wave": {
          "0%": {
            // Start slightly narrower and dimmer
            transform: "rotate(-45deg) scaleX(0.9)",
            opacity: 0.8,
          },
          "100%": {
            // Breathe out to be wider and brighter
            transform: "rotate(-45deg) scaleX(1.1)",
            opacity: 1,
          },
        },
      },
    },
  },
  plugins: [],
};
