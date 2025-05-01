import { Loc, ValidationError } from "./Diagnostics";

export type Token =
  | { kind: "text"; value: string; loc: Loc }
  | { kind: "ident"; value: string; loc: Loc }
  | { kind: "string"; value: string; loc: Loc }
  | { kind: "#"; loc: Loc }
  | { kind: "("; loc: Loc }
  | { kind: ")"; loc: Loc }
  | { kind: ":"; loc: Loc }
  | { kind: "-"; loc: Loc }
  | { kind: "and"; loc: Loc }
  | { kind: "or"; loc: Loc }
  | { kind: "not"; loc: Loc }
  | { kind: "whitespace"; loc: Loc; value: string }
  | { kind: "eof"; loc: Loc };

export class Lexer {
  private pos = 0;
  _warnings: ValidationError[] = [];

  constructor(private input: string) {}

  tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.pos < this.input.length) {
      const char = this.input[this.pos];

      if (this.isWhitespace(char)) {
        const start = this.pos;
        this.pos++;
        while (this.isWhitespace(this.input[this.pos])) {
          this.pos++;
        }
        tokens.push({
          kind: "whitespace",
          value: this.input.slice(start, this.pos),
          loc: { start, end: this.pos },
        });
        continue;
      }

      const start = this.pos;

      switch (char) {
        case "#":
        case "(":
        case ")":
        case ":":
        case "-":
          tokens.push({ kind: char, loc: { start, end: start + 1 } });
          this.pos++;
          break;
        case '"': {
          const string = this.readQuotedString();
          const end = this.pos;
          tokens.push({ kind: "string", value: string, loc: { start, end } });
          break;
        }
        default:
          const word = this.readWord();
          const end = this.pos;
          switch (word) {
            case "has":
            case "after":
            case "before":
              tokens.push({ kind: word, loc: { start, end } });
              break;
            default:
              tokens.push({ kind: "text", value: word, loc: { start, end } });
              break;
          }
          break;
      }
    }
    tokens.push({ kind: "eof", loc: { start: this.pos, end: this.pos } });
    return tokens;
  }

  private isWhitespace(c: string): boolean {
    return c === " " || c === "\n" || c === "\t";
  }

  private isSpecialChar(c: string): boolean {
    return c === "#" || c === "(" || c === ")" || c === ":";
  }

  private readWord(): string {
    const start = this.pos;
    while (
      this.pos < this.input.length &&
      !this.isWhitespace(this.input[this.pos]) &&
      !this.isSpecialChar(this.input[this.pos])
    ) {
      this.pos++;
    }
    return this.input.slice(start, this.pos);
  }

  // Reads a quoted string, e.g., "hello world" including
  // escaped quotes, and returns the unescaped string.
  private readQuotedString(): string {
    this.pos++; // Skip the opening quote
    let escaped = false;
    let buffer = "";
    while (true) {
      if (this.pos >= this.input.length) {
        this._warnings.push(
          new ValidationError("Unterminated string literal", {
            start: this.pos,
            end: this.pos,
          }),
        );
        break; // End of input
      }
      const char = this.input[this.pos];
      this.pos++;

      if (char === "\\" && !escaped) {
        escaped = true;
      } else if (char === '"' && !escaped) {
        break; // End of the quoted string
      } else {
        buffer += char;
        escaped = false;
      }
    }
    return buffer;
  }
}
