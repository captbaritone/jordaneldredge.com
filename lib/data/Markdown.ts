import markdownToHtml from "../markdownToHtml";

export class Markdown {
  constructor(private content: string) {}

  markdownString(): string {
    return this.content;
  }

  async ast(): Promise<any> {
    return markdownToHtml(this.content, true);
  }
}
