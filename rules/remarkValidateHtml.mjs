import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import rehypeParse from "rehype-parse";
import { unified } from "unified";

const validateHtml = lintRule(
  "remark-lint:html",
  async (tree, file, _options) => {
    const blocks = [];
    visit(tree, ["html"], (node) => {
      blocks.push(node);
    });
    for (const node of blocks) {
      const ast = await unified()
        .use(rehypeParse, {
          emitParseErrors: true,
          duplicateAttribute: false,
          fragment: true,
        })
        .parse(node.value);
      visit(ast, "element", (htmlNode) => {
        switch (htmlNode.tagName) {
          case "strong":
          case "em":
          case "h1":
          case "h2":
          case "h3":
          case "pre":
          case "span":
            // case "a":
            // case "pre":
            if (
              Object.keys(htmlNode.properties).length === 0 && hasSingleTextChild(htmlNode)
            ) {
              file.message(`Invalid HTML`, node);
            }
            break;
          case "a":
          case "img":
            file.message(`Invalid HTML`, node);
            break;
          default:
          //
        }
      });
    }
  }
);

function hasSingleTextChild(node) {
  if (node.children.length === 1) {
    const child = node.children[0];
    if (child.type === "text") {
      return true;
    }
  }
  return false;
}

export default validateHtml;
