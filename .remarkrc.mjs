import validateUrls from "./rules/remarkValidateUrls.mjs";

const config = {
  settings: {
    emphasis: "*",
    strong: "*",
  },
  plugins: ["remark-frontmatter", validateUrls],
};

export default config;
