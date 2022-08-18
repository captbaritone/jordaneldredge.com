import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";

const validateCodeBlocks = lintRule(
  "remark-lint:code-blocks",
  async (tree, file, options) => {
    visit(tree, ["code"], (node) => {
      let lang = node.lang ?? "plainText";
      const grammar = Prism.languages[lang];

      if (grammar == null) {
        file.message(`Unsupported code language: "${node.lang}"`, node);
      }
    });
  }
);

export default validateCodeBlocks;
