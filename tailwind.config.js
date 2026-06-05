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
        serif: ["var(--font-alegreya)", ...defaultTheme.fontFamily.serif],
        sans: ["var(--font-alegreya-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-inconsolata)", ...defaultTheme.fontFamily.mono],
        "display-sc": [
          "var(--font-alegreya-sc)",
          ...defaultTheme.fontFamily.serif,
        ],
      },
      fontSize: {
        body: ["1.4rem", "2rem"],
        display: ["3rem", "1"],
        sc: ["1.6rem", "1"],
        nav: ["1.2rem", "1"],
        footer: ["1.1rem", "1.5"],
        "inline-code": ["1.33rem", "1.5"],
        side: ["1.1rem", "1.54rem"],
      },
      colors: {
        ink: "#111",
        paper: "#fcfcfc",
        link: "#036",
        "link-hover-bg": "#f0f7ff",
        code: "#600",
        selection: "#d8e8ff",
        rule: "#ccc",
      },
    },
  },
  plugins: [],
};
