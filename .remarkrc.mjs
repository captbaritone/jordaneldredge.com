import validateUrls from "./rules/remarkValidateUrls.mjs";
import validateMetadata from "./rules/remarkValidateMetadata.mjs";

const config = {
  settings: {
    emphasis: "*",
    strong: "*",
  },
  plugins: ["remark-frontmatter", validateUrls, validateMetadata],
};

export default config;
