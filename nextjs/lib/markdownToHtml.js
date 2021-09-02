import path from "path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkInlineLinks from "remark-inline-links";
import visit, { SKIP } from "unist-util-visit";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index";
import remarkDirective from "remark-directive";
import { getPlaiceholder } from "plaiceholder";

loadLanguages([
  "php",
  "json",
  "jsx",
  "vim",
  "bash",
  "python",
  "markdown",
  "yml",
]);

Prism.languages["plainText"] = {};

function applyHighlighting(tree) {
  visit(tree, (node, index, parent) => {
    if (node.type === "code") {
      const source = node.value;

      let lang = node.lang ?? "plainText";
      const grammar = Prism.languages[lang];

      if (grammar == null) {
        throw new Error(
          `No Prism highlighting for language: ${node.lang} (normalized to: ${lang})`
        );
      }

      const html = Prism.highlight(source, grammar, lang);
      const replacement = {
        type: "html",
        value: `<pre class="language-${lang}"><code class="language-${lang}">${html}</code></pre>`,
      };
      parent.children[index] = replacement;
      return [SKIP, index];
    }
  });
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

export default async function markdownToHtml(markdown) {
  let ast = unified().use(remarkParse).use(remarkDirective).parse(markdown);

  // No idea why I can't use this via unified().use(remarkInlineLinks)
  const transform = remarkInlineLinks();
  transform(ast);
  fixHtml(ast);
  applyHighlighting(ast);
  await imageDimensions(ast);

  // TODO: Why can't position be serialized?
  ast = JSON.parse(JSON.stringify(ast));
  // console.log(ast.children[2].children[0].children[0].children[0]);

  return { ast };
}
