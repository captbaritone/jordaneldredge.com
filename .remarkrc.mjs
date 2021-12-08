import validateUrls from "./rules/remarkValidateUrls.mjs";
import validateMetadata from "./rules/remarkValidateMetadata.mjs";
import validateCodeBlocks from "./rules/remarkValidateCodeBlocks.mjs";

const config = {
  settings: {
    emphasis: "*",
    strong: "*",
  },
  plugins: [
    "remark-frontmatter",
    validateUrls,
    validateMetadata,
    validateCodeBlocks,
  ],
};

export default config;
