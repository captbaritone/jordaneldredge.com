const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.js",
    "./pages/**/*.ts",
    "./pages/**/*.tsx",
    "./app/**/*.js",
    "./app/**/*.ts",
    "./app/**/*.tsx",
    "./lib/components/**/*.js",
    "./lib/components/**/*.ts",
    "./lib/components/**/*.tsx",
    "./_pages/*.md",
    "./_posts/*.md",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-inconsolata)", ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        title: ["1.6rem", "1"],
        nav: ["1.2rem", "1"],
        footer: ["1.1rem", "1.5"],
        side: ["1.1rem", "1.54rem"],
      },
      colors: {
        ink: "#111",
        paper: "#fcfcfc",
        link: "#036",
        code: "#600",
        selection: "#d8e8ff",
        rule: "#ccc",
      },
    },
  },
  plugins: [],
};
