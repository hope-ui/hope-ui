function createPalette(color) {
  return {
    50: `rgb(var(--hope-colors-${color}-50) / <alpha-value>)`,
    100: `rgb(var(--hope-colors-${color}-100) / <alpha-value>)`,
    200: `rgb(var(--hope-colors-${color}-200) / <alpha-value>)`,
    300: `rgb(var(--hope-colors-${color}-300) / <alpha-value>)`,
    400: `rgb(var(--hope-colors-${color}-400) / <alpha-value>)`,
    500: `rgb(var(--hope-colors-${color}-500) / <alpha-value>)`,
    600: `rgb(var(--hope-colors-${color}-600) / <alpha-value>)`,
    700: `rgb(var(--hope-colors-${color}-700) / <alpha-value>)`,
    800: `rgb(var(--hope-colors-${color}-800) / <alpha-value>)`,
    900: `rgb(var(--hope-colors-${color}-900) / <alpha-value>)`,
  };
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: ["class", "[data-hope-theme='dark']"],
  prefix: "ui-",
  theme: {
    extend: {
      colors: {
        primary: createPalette("primary"),
        neutral: createPalette("neutral"),
        success: createPalette("success"),
        info: createPalette("info"),
        warning: createPalette("warning"),
        danger: createPalette("danger"),
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "base",
    }),
    require("@kobalte/tailwindcss"),
  ],
};
