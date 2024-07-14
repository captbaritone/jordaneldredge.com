import markdownToHtml from "../markdownToHtml";

/**
 * Content that can be represented as markdown.
 *
 * @gqlType
 */
export class Markdown {
  constructor(private content: string) {}

  /**
   * The content encoded as a markdown string.
   * @gqlField
   */
  markdownString(): string {
    return this.content;
  }

  async ast(): Promise<any> {
    return markdownToHtml(this.content, true);
  }
}
