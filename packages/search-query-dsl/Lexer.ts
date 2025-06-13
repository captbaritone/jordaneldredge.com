import { Loc, Result, ValidationError } from "./Diagnostics";

export type TextToken = { kind: "text"; value: string; loc: Loc };
export type UnaryToken = { kind: "-"; loc: Loc };
export type PrefixToken = { kind: "prefix"; value: string; loc: Loc };
export type StringToken = { kind: "string"; value: string; loc: Loc };
export type TagToken = { kind: "#"; loc: Loc };
export type OpenParenToken = { kind: "("; loc: Loc };
export type CloseParenToken = { kind: ")"; loc: Loc };
export type ColonToken = { kind: ":"; loc: Loc };
export type AndToken = { kind: "AND"; loc: Loc };
export type OrToken = { kind: "OR"; loc: Loc };
export type NotToken = { kind: "NOT"; loc: Loc };
export type EofToken = { kind: "eof"; loc: Loc };

export type Token =
  | TextToken
  | PrefixToken
  | StringToken
  | TagToken
  | OpenParenToken
  | CloseParenToken
  | ColonToken
  | UnaryToken
  | AndToken
  | OrToken
  | NotToken
  | EofToken;

export function lex(input: string): Result<Token[]> {
  const lexer = new Lexer(input);
  const tokens = lexer.tokenize();
  return { value: tokens, warnings: lexer._warnings };
}

export class Lexer {
  private pos = 0;
  _warnings: ValidationError[] = [];

  constructor(private input: string) {}

  tokenize(): Token[] {
    const tokens: Token[] = [];
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
          let text = "";
          while (
            this.pos < this.input.length &&
            this.isIdentifier(this.input[this.pos])
          ) {
            text += this.input[this.pos];
            this.pos++;
          }

          if (text === "AND" || text === "OR" || text === "NOT") {
            tokens.push({ kind: text, loc: { start, end: this.pos } });
            break;
          }

          if (text.length > 0 && this.input[this.pos] === ":") {
            this.pos++;
            tokens.push({
              kind: "prefix",
              value: text,
              loc: { start, end: this.pos },
            });
            break;
          }

          while (
            this.pos < this.input.length &&
            !this.isWhitespace(this.input[this.pos]) &&
            !this.isSpecialChar(this.input[this.pos])
          ) {
            text += this.input[this.pos];
            this.pos++;
          }
          tokens.push({
            kind: "text",
            value: text,
            loc: { start, end: this.pos },
          });
          break;
      }
    }
    tokens.push({ kind: "eof", loc: { start: this.pos, end: this.pos } });
    return tokens;
  }

  private isIdentifier(c: string): boolean {
    // TODO: Use char range?
    return c.match(/^[a-zA-Z]+$/) !== null;
  }

  private isWhitespace(c: string): boolean {
    return c === " " || c === "\n" || c === "\t";
  }

  private isSpecialChar(c: string): boolean {
    // TODO: Is this the right set of characters?
    return c === "#" || c === "(" || c === ")" || c === "-";
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
