import { map } from "unist-util-map";
import { Node } from "unist";
import { visit } from "unist-util-visit";
import remarkInlineLinks from "remark-inline-links";
import { toMarkdown, Options } from "mdast-util-to-markdown";
import { fixHtml, syntaxHighlighting, parse } from "./markdownUtils";

/**
 * Content that can be represented as markdown.
 *
 * @gqlType
 */
export class Markdown {
  static fromString(content: string): Markdown {
    return new Markdown(parse(content));
  }
  constructor(private rawAst: Node) {}

  cloneAst(): Node {
    return map(this.rawAst, (node) => ({ ...node }));
  }

  /**
   * The content encoded as a markdown string.
   * @gqlField
   */
  async markdownString(): Promise<string> {
    const ast = this.cloneAst();
    visit(ast, (node, index, parent) => {
      if (node.type === "image") {
        // @ts-ignore
        node.url = node.imageProps?.cachedPath ?? node.url;
      }
    });

    // @ts-ignore
    return toMarkdown(ast, SERIALIZE_MARKDOWN_OPTIONS);
  }

  async ast(): Promise<any> {
    const ast = this.cloneAst();
    // No idea why I can't use this via unified().use(remarkInlineLinks)
    const transform = remarkInlineLinks();
    // @ts-ignore
    transform(ast);
    fixHtml(ast);

    await syntaxHighlighting(ast);
    return ast;
  }
}

const SERIALIZE_MARKDOWN_OPTIONS: Options = {
  bullet: "-",
  emphasis: "_",
  rule: "-",
  handlers: {
    // @ts-ignore
    textDirective(node) {
      return `:${node.name}`;
    },
    leafDirective(node) {
      // Just a small subset of the real syntax, but fine for now.
      // https://talk.commonmark.org/t/generic-directives-plugins-syntax/444
      const attributes = Object.entries(node.attributes)
        .map(([name, value]) => {
          return `${name}=${value}`;
        })
        .join(" ");
      return `::${node.name}{${attributes}}`;
    },
  },
};
