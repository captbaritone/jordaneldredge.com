import { Loc, ValidationError } from "./Diagnostics";

export type Token =
  | { kind: "text"; value: string; loc: Loc }
  | { kind: "string"; value: string; loc: Loc }
  | { kind: "#"; loc: Loc }
  | { kind: "("; loc: Loc }
  | { kind: ")"; loc: Loc }
  | { kind: ":"; loc: Loc }
  | { kind: "-"; loc: Loc }
  | { kind: "has"; loc: Loc }
  | { kind: "after"; loc: Loc }
  | { kind: "before"; loc: Loc }
  | { kind: "eof"; loc: Loc };

export class Lexer {
  private pos = 0;
  _warnings: ValidationError[] = [];

  constructor(private input: string) {}

  *tokenize(): Generator<Token> {
    while (this.pos < this.input.length) {
      const char = this.input[this.pos];

      if (this.isWhitespace(char)) {
        this.pos++;
        continue;
      }

      const start = this.pos;

      switch (char) {
        case "#":
        case "(":
        case ")":
        case ":":
        case "-":
          yield { kind: char, loc: { start, end: start + 1 } };
          this.pos++;
          break;
        case '"': {
          const string = this.readQuotedString();
          const end = this.pos;
          yield { kind: "string", value: string, loc: { start, end } };
          break;
        }
        default:
          const word = this.readWord();
          const end = this.pos;
          switch (word) {
            case "has":
            case "after":
            case "before":
              yield { kind: word, loc: { start, end } };
              break;
            default:
              yield { kind: "text", value: word, loc: { start, end } };
              break;
          }
          break;
      }
    }
    yield { kind: "eof", loc: { start: this.pos, end: this.pos } };
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
