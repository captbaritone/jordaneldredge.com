import { unified } from "unified";
import { visit } from "unist-util-visit";
import { getHighlighter } from "shiki";
import remarkDirective from "remark-directive";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import path from "path";
import {
  getSyntaxRanges,
  getEslintRanges,
  applyRangesToText,
} from "../eslintShiki";

export function parse(markdown) {
  return unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkGfm)
    .parse(markdown);
}

// Markdown parsing is not aware of HTML syntax. Because of this, html markdown
// AST nodes are not necessarily balanced. For example: `<b>sometext</b>` will create:
// 1. HTML: <b>
// 2. TEXT: sometext
// 3. HTML: </b>
//
// This fixes that specific case, but there are potentially other more complex cases.
export function fixHtml(tree) {
  visit(tree, (node, index, parent) => {
    if (node.type === "html") {
      const next = parent.children[index + 1];
      const nextButOne = parent.children[index + 2];
      if (
        next != null &&
        nextButOne != null &&
        next.type === "text" &&
        nextButOne.type === "html"
      ) {
        node.value += next.value + nextButOne.value;
        parent.children.splice(index + 1, 2);
      }
    }
  });
}

let highlighterPromise = null;

export async function syntaxHighlighting(ast) {
  if (highlighterPromise == null) {
    highlighterPromise = getHighlighter({
      theme: "solarized-light",
      // https://jordaneldredge.com/notes/6549b4bc-f1a0-4fed-98c1-630074c4a023/
      paths: {
        languages: path.join(
          process.cwd(),
          "node_modules",
          "shiki",
          "languages",
          "/",
        ),
        themes: path.join(
          process.cwd(),
          "node_modules",
          "shiki",
          "themes",
          "/",
        ),
      },
    });
  }
  const highlighter = await highlighterPromise;

  const bg = highlighter.getBackgroundColor();

  visit(ast, "code", (node) => {
    const code = node.value;
    // TODO: Ensure we support these languages:
    // "php", "json", "jsx", "vim", "bash", "python", "markdown", "yml",
    const syntaxRanges = getSyntaxRanges(highlighter, code, node.lang);

    let eslintRanges = [];
    if (node.meta?.startsWith("eslint")) {
      const configString = node.meta.replace(/^eslint/, "").trim();
      let eslintConfig = {};
      if (configString.length > 0) {
        try {
          eslintConfig = JSON.parse(configString);
        } catch (_error) {
          throw new Error(`Invalid eslint config: ${configString}`);
        }
      }
      eslintRanges = getEslintRanges(eslintConfig, code);
    }

    const sortedRanges = [...eslintRanges, ...syntaxRanges];

    const html = applyRangesToText(code, sortedRanges);

    delete node.meta;
    node.type = "html";
    node.value = `<pre class="shiki" style="background-color: ${bg}"><div class='code-container'><code>${html}</code></div></pre>`;
    node.children = [];
  });
}
