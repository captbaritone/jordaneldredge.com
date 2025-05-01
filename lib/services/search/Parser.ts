import { Loc, Result, ValidationError } from "./Diagnostics";
import { Lexer, Token as Token } from "./Lexer";

export type TextNode = {
  type: "text";
  value: string;
  loc: Loc;
};

export type Prefix = "has" | "after" | "before";

export type PrefixNode = {
  type: "prefix";
  prefix: Prefix;
  value: string;
  loc: Loc;
};

export type UnaryNode = {
  type: "unary";
  prefix: "-";
  expression: ParseNode;
  loc: Loc;
};

export type TagNode = {
  type: "tag";
  value: string;
  loc: Loc;
};

export type GroupNode = {
  type: "group";
  children: ParseNode[];
  loc: Loc;
};

export type MatchNode = TextNode | MatchGroupNode;

export type MatchGroupNode = {
  type: "group";
  children: MatchNode[];
  loc: Loc;
};

export type ParseNode = TextNode | PrefixNode | TagNode | UnaryNode | GroupNode;

export function parse(input: string): Result<ParseNode> {
  const lexer = new Lexer(input);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  return {
    value: ast,
    warnings: [...lexer._warnings, ...parser._warnings],
  };
}

class Parser {
  private current: Token;
  private nextIndex: number = 0;
  _warnings: ValidationError[] = [];

  constructor(private tokens: Token[]) {
    const next = this.tokens[this.nextIndex];
    if (next == null) {
      throw new Error("Expected at least an EOF token");
    }
    this.current = next;
  }

  parse(): ParseNode {
    const nodes: ParseNode[] = [];
    while (!this.eof()) {
      nodes.push(this.parseExpr());
    }
    if (nodes.length === 1) {
      return nodes[0];
    }
    if (nodes.length === 0) {
      return { type: "group", children: nodes, loc: { start: 0, end: 0 } };
    }
    const loc = this.locRange(nodes[0].loc, nodes[nodes.length - 1].loc);
    return { type: "group", children: nodes, loc };
  }

  private consumeWhitespace(): void {
    while (this.peek().kind === "whitespace") {
      this.next();
    }
  }

  private parseExpr(): ParseNode {
    this.consumeWhitespace();
    const token = this.peek();
    switch (token.kind) {
      case "has":
      case "before":
      case "after":
        return this.parsePrefix(token.kind);
      case "-":
        const unaryToken = token;
        this.next();
        if (this.eof()) {
          this._warnings.push(
            new ValidationError(
              "Unexpected end of input after unary operator",
              unaryToken.loc,
            ),
          );
          return {
            type: "text",
            value: "-",
            loc: unaryToken.loc,
          };
        }
        const expression = this.parseExpr();
        return {
          type: "unary",
          prefix: "-",
          expression,
          loc: this.locRange(unaryToken.loc, expression.loc),
        };
      case "(":
        return this.parseGroup();
      case "#":
        const tagToken = token;
        const maybeText = this.next();
        if (maybeText.kind !== "text") {
          this._warnings.push(
            new ValidationError("Expected a tag name after #", tagToken.loc),
          );
          return {
            type: "text",
            value: "#",
            loc: tagToken.loc,
          };
        }
        this.next();
        return {
          type: "tag",
          value: maybeText.value,
          loc: this.locRange(tagToken.loc, maybeText.loc),
        };
        break;
      case "string":
        this.next();
        return {
          type: "text",
          value: token.value,
          loc: token.loc,
        };
      case "text":
        const values: string[] = [];
        let nextToken = token;
        do {
          values.push(nextToken.value);
          nextToken = this.next();
        } while (
          this.peek().kind === "text" ||
          this.peek().kind === "whitespace"
        );
        return {
          type: "text",
          value: values.join(" ").trim(),
          loc: this.locRange(token.loc, nextToken.loc),
        };
      case ":": {
        this._warnings.push(new ValidationError("Unexpected colon", token.loc));
        this.next();
        const values: string[] = [":"];
        let nextToken = token;
        while (this.peek().kind === "text") {
          const nextToken = this.expect("text");
          values.push(nextToken.value);
        }
        return {
          type: "text",
          value: values.join(" "),
          loc: this.locRange(token.loc, nextToken.loc),
        };
      }
      default:
        throw new Error(`Unexpected token: ${token.kind}`);
    }
  }

  private locRange(start: Loc, end: Loc): Loc {
    return { start: start.start, end: end.end };
  }

  private parsePrefix(prefix: Prefix): ParseNode {
    const start = this.peek().loc.start;
    const maybeColon = this.next();
    if (maybeColon.kind !== ":") {
      this._warnings.push(
        new ValidationError(`Expected ":" after "${prefix}"`, this.peek().loc),
      );
      return {
        type: "text",
        value: prefix,
        loc: { start, end: start },
      };
    }
    const maybeText = this.next();
    if (maybeText.kind !== "text") {
      this._warnings.push(
        new ValidationError(
          `Expected a value after "${prefix}:"`,
          this.peek().loc,
        ),
      );
      return {
        type: "text",
        value: `${prefix}:`,
        loc: { start, end: start },
      };
    }
    this.next();
    const end = maybeText.loc.end;
    return {
      type: "prefix",
      prefix,
      value: maybeText.value,
      loc: { start, end },
    };
  }

  private parseGroup(): GroupNode {
    const start = this.peek().loc;
    this.expect("(");
    const children: ParseNode[] = [];
    while (!this.eof() && this.peek().kind !== ")") {
      children.push(this.parseExpr());
    }
    const maybeCloseParen = this.peek();
    if (maybeCloseParen.kind !== ")") {
      this._warnings.push(
        new ValidationError(
          "Expected closing parenthesis",
          maybeCloseParen.loc,
        ),
      );
      return {
        type: "group",
        children,
        loc: this.locRange(start, maybeCloseParen.loc),
      };
    }
    this.next();
    return {
      type: "group",
      children,
      loc: this.locRange(start, maybeCloseParen.loc),
    };
  }

  private peek(): Token {
    return this.current;
  }

  private next(): Token {
    // TODO: Handle EOF
    this.current = this.tokens[++this.nextIndex];
    return this.current;
  }

  private expect<T extends Token["kind"]>(kind: T): Token & { kind: T } {
    const token = this.peek();
    if (token.kind !== kind) {
      throw new ValidationError(
        `Expected ${kind} token, found ${token.kind}`,
        token.loc,
      );
    }
    this.next();
    return token as Token & { kind: T };
  }

  private eof(): boolean {
    return this.current.kind === "eof";
  }
}
