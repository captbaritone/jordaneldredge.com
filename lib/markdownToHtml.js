import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkInlineLinks from "remark-inline-links";
import { SKIP, visit } from "unist-util-visit";
import remarkDirective from "remark-directive";
import { getPlaiceholder } from "plaiceholder";
import remarkTwoslash from "remark-shiki-twoslash";
import { Lang, Highlighter, getHighlighter } from "shiki";
import eslintShiki from "./eslintShiki";

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

// TODO: Ensure we support these languages:
// "php", "json", "jsx", "vim", "bash", "python", "markdown", "yml",
const remarkTwoslashOptions = {
  theme: "solarized-light",
  alwayRaiseForTwoslashExceptions: true,
};

function escapeHtml(html) {
  return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default async function markdownToHtml(markdown) {
  let ast = unified().use(remarkParse).use(remarkDirective).parse(markdown);

  // No idea why I can't use this via unified().use(remarkInlineLinks)
  const transform = remarkInlineLinks();
  transform(ast);
  fixHtml(ast);

  const highlighter = await getHighlighter({ theme: "light-plus" });

  const bg = highlighter.getBackgroundColor();

  visit(ast, "code", (node) => {
    // TODO: Get language from fence
    const lines = eslintShiki(highlighter, node.value);
    let html = "";

    for (const line of lines) {
      html += "<div class='line'>";
      if (line.length === 0) {
        html += "&nbsp;";
      }
      const errors = [];
      for (const token of line) {
        if (token.message) {
          switch (token.tagType) {
            case "open":
              html += "<data-err>";
              break;
            case "close":
              html += "</data-err>";
              break;
            default:
              throw new Error(`Unknown tag type: ${token.tagType}`);
          }
          errors.push(token.message);
        } else {
          const content = escapeHtml(token.content);
          html += `<span style="color: ${token.color};">${content}</span>`;
        }
      }
      const messages = errors.map((m) => escapeHtml(m)).join("</br>");
      html += `<span class="error"><span>${messages}</span></span>`;

      html += "</div>"; // End line
    }
    node.type = "html";
    console.log(bg);
    node.value = `<pre class="shiki" style="background-color: ${bg}"><div class='code-container'><code>${html}</code></div></pre>`;
    node.children = [];
  });

  // await remarkTwoslash(remarkTwoslashOptions)(ast);
  await imageDimensions(ast);

  // TODO: Why can't position be serialized?
  ast = JSON.parse(JSON.stringify(ast));
  // console.log(ast.children[2].children[0].children[0].children[0]);

  return { ast };
}
