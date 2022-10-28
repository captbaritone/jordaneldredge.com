import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkInlineLinks from "remark-inline-links";
import { visit } from "unist-util-visit";
import remarkDirective from "remark-directive";
import { getHighlighter } from "shiki";
import { getPlaiceholder } from "plaiceholder";
import {
  getSyntaxRanges,
  getEslintRanges,
  applyRangesToText,
} from "./eslintShiki";

export default async function markdownToHtml(markdown, highlight = true) {
  let ast = unified().use(remarkParse).use(remarkDirective).parse(markdown);

  // No idea why I can't use this via unified().use(remarkInlineLinks)
  const transform = remarkInlineLinks();
  transform(ast);
  fixHtml(ast);

  if (highlight) {
    await syntaxHighlighting(ast);
  }
  await imageDimensions(ast);

  // TODO: Why can't position be serialized?
  ast = JSON.parse(JSON.stringify(ast));

  return { ast };
}

async function imageDimensions(tree) {
  const images = [];
  visit(tree, (node, index, parent) => {
    if (node.type === "image") {
      images.push(node);
    }
  });

  return Promise.all(
    images.map(async (node) => {
      // Not all images are in the repo. How do we handle the others?
      if (node.url.startsWith("/images")) {
        const { base64, img } = await getPlaiceholder(node.url);

        node.imageProps = {
          ...img,
          blurDataURL: base64,
        };
      }
    })
  );
}

// Markdown parsing is not aware of HTML syntax. Because of this, html markdown
// AST nodes are not necessarily balanced. For example: `<b>sometext</b>` will create:
// 1. HTML: <b>
// 2. TEXT: sometext
// 3. HTML: </b>
//
// This fixes that specific case, but there are potentially other more complex cases.
function fixHtml(tree) {
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

async function syntaxHighlighting(ast) {
  const highlighter = await getHighlighter({
    /*theme: "solarized-light" */
  });

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
        } catch (e) {
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
