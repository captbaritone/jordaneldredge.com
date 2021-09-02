import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkInlineLinks from "remark-inline-links";
import visit, { SKIP } from "unist-util-visit";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index";

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

function mapLang(lang) {
  switch (lang) {
    case "vimscript":
      return "vim";
    case "text":
    case "txt":
    case null:
      return "plainText";
    default:
      return lang;
  }
}

Prism.languages["plainText"] = {};

function applyHighlighting(tree) {
  visit(tree, (node, index, parent) => {
    if (node.type === "code") {
      const source = node.value;

      let lang = mapLang(node.lang);
      const grammar = Prism.languages[lang];

      if (grammar == null) {
        throw new Error(
          `No Prism highlighting for language: ${node.lang} (normalized to: ${lang})`
        );
      }

      const html =
        grammar == null ? source : Prism.highlight(source, grammar, lang);
      const replacement = {
        type: "html",
        value: `<pre class="language-${lang}"><code class="language-${lang}">${html}</code></pre>`,
      };
      parent.children[index] = replacement;
      return [SKIP, index];
    }
  });
}

const CONSTANTS = {
  "site.email": "jordan@jordaneldredge.com",
  "site.twitter_username": "captbaritone",
  "site.github_username": "captbaritone",
  "site.url": "https://jordaneldredge.com",
  "site.baseurl": "", // Is this right?
  // TODO: Remove this. We try to avoid ever parsing this by using {% raw %}, but we don't support {% raw %}, so we hack here to ignore it.
  // _posts/2015-08-30-jerkll-a-tiny-static-site-generator-that-runs-in-your-browser.md
  "(\\S*)": "(\\S*)",
};

// These are all hacks to be able to process the wildcard stuff we do in Jekyll but don't work in nextjs
function preprocess(markdown) {
  return markdown
    .replace("{% raw %}", "")
    .replace("{% endraw %}", "")
    .replace(/\{\{ "([^"]+)" \| prepend: ([^}]+) \}\}/g, (_, url, key) => {
      const value = CONSTANTS[key];
      if (value == null) {
        throw new Error(`Could not find constant value for key "${key}"`);
      }
      return value + url;
    })
    .replace(/\{\{ ([^}]+) \}\}/g, (_, key) => {
      const value = CONSTANTS[key];
      if (value == null) {
        throw new Error(`Could not find constant value for key "${key}"`);
      }
      return value;
    })
    .replace(/\{% ([^ ]+) ([^ ]+) %\}/g, (_, name, token) => {
      if (name !== "youtube") {
        throw new Error(`Unknown short code "${name}" with value "${token}"`);
      }
      return `<div class='video-container'>
        <iframe src="https://www.youtube.com/embed/${token}?modestbranding=1&rel=0" frameborder="0" allowfullscreen class='youtube-video'></iframe>
      </div>`;
    });
}

export default async function markdownToHtml(markdown) {
  const processedMarkdown = preprocess(markdown);

  let ast = unified().use(remarkParse).parse(processedMarkdown);

  // No idea why I can't use this via unified().use(remarkInlineLinks)
  const transform = remarkInlineLinks();
  transform(ast);
  applyHighlighting(ast);

  // TODO: Why can't position be serialized?
  ast = JSON.parse(JSON.stringify(ast));

  return { ast };
}
