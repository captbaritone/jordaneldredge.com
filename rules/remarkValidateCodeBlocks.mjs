import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";

// Languages actually used in this codebase - based on lint results
const shikiSupportedLanguages = new Set([
  // Basic cases
  undefined, null, '', 'plaintext', 'text',
  // Languages found in codebase
  'mermaid', 'javascript', 'graphql', 'bash', 'vim', 'php', 'html', 'yaml',
  'json', 'xml', 'css', 'python', 'markdown', 'jsx', 'tsx', 'js', 'sql'
]);

const validateCodeBlocks = lintRule(
  "remark-lint:code-blocks",
  async (tree, file, _options) => {
    visit(tree, ["code"], (node) => {
      let lang = node.lang ?? "plaintext";

      if (!shikiSupportedLanguages.has(lang)) {
        file.message(`Potentially unsupported code language: "${node.lang}". Please verify this language is supported by Shiki.`, node);
      }
    });
  }
);

export default validateCodeBlocks;
