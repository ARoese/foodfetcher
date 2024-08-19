/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "fflightgreen": "#cfffbf",
        "ffgreen": "#50b82e",
        "ffdarkgreen": "#31701c",
        "ffteal": "#38817a",
        "fflightteal": "#47a69d",
        "ffcolor1-white": "rgb(244,244,244)",
        "ffcolor2-darkGreyT": "rgba(0,0,0,.35)"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "global": "url('../public/images/background3.jpg')"
      },
    },
  },
  plugins: [],
};
