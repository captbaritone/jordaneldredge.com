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
    extend: {},
  },
  plugins: [],
};
