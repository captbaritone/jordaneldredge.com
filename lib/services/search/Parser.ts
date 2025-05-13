import { Loc, Result, ValidationError } from "./Diagnostics";
import { Token as Token } from "./Lexer";

export type TextNode = {
  type: "text";
  value: string;
  loc: Loc;
};

export type PrefixNode = {
  type: "prefix";
  prefix: string;
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

export type OrNode = {
  type: "or";
  left: ParseNode;
  right: ParseNode;
  loc: Loc;
};

export type AndNode = {
  type: "and";
  left: ParseNode;
  right: ParseNode;
  loc: Loc;
};

export type NotNode = {
  type: "not";
  left: ParseNode;
  right: ParseNode;
  loc: Loc;
};

// Used to model `()`
export type TrueNode = {
  type: "true";
  loc: Loc;
};

type MatchAndNode = {
  type: "and";
  left: MatchNode;
  right: MatchNode;
  loc: Loc;
};

type MatchOrNode = {
  type: "or";
  left: MatchNode;
  right: MatchNode;
  loc: Loc;
};
type MatchNotNode = {
  type: "not";
  left: MatchNode;
  right: MatchNode;
  loc: Loc;
};

export type MatchNode = TextNode | MatchAndNode | MatchOrNode | MatchNotNode;

export type ParseNode =
  | TextNode
  | PrefixNode
  | TagNode
  | UnaryNode
  | OrNode
  | AndNode
  | NotNode
  | TrueNode;

export function parse(tokens: Token[]): Result<ParseNode> {
  const parser = new Parser(tokens);
  const ast = parser.parse();
  return { value: ast, warnings: parser._warnings };
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
    if (this.eof()) {
      return { type: "true", loc: { start: 0, end: 0 } };
    }
    return this.expression();
  }

  private peekIsExpressionToken(): boolean {
    return this.peekIsOrExpressionToken();
  }

  private expression(): ParseNode {
    return this.or();
  }

  peekIsOrExpressionToken(): boolean {
    return this.peekIsAndExpressionToken();
  }

  private or(): ParseNode {
    let expr = this.and();
    let token = this.peek();
    while (token.kind === "OR") {
      token = this.consumeButExpect(); // OR
      if (this.eof()) {
        this._warnings.push(
          new ValidationError("Unexpected end of input after OR", token.loc),
        );
        return expr;
      }
      const right = this.and();
      expr = {
        type: "or",
        left: expr,
        right,
        loc: this.locRange(expr.loc, right.loc),
      };
    }
    return expr;
  }

  peekIsAndExpressionToken(): boolean {
    return this.peekIsNotExpressionToken();
  }

  private and(): ParseNode {
    let expr = this.not();
    let token = this.peek();
    while (token.kind !== "eof") {
      if (token.kind === "AND") {
        token = this.consumeButExpect(); // AND
        if (this.eof()) {
          this._warnings.push(
            new ValidationError("Unexpected end of input after AND", token.loc),
          );
          return { type: "text", value: "AND", loc: token.loc };
        }
        const right = this.not();
        expr = {
          type: "and",
          left: expr,
          right,
          loc: this.locRange(expr.loc, right.loc),
        };
      } else if (this.peekIsNotExpressionToken()) {
        const right = this.not();
        expr = {
          type: "and",
          left: expr,
          right,
          loc: this.locRange(expr.loc, right.loc),
        };
        token = this.peek();
      } else {
        break;
      }
    }
    return expr;
  }

  private peekIsNotExpressionToken(): boolean {
    return this.peekIsPrimaryExpressionToken();
  }

  private not(): ParseNode {
    let expr = this.primary();
    let token = this.peek();
    while (token.kind === "NOT") {
      token = this.consumeButExpect(); // NOT
      if (this.eof()) {
        this._warnings.push(
          new ValidationError("Unexpected end of input after NOT", token.loc),
        );
        return expr;
      }
      const right = this.primary();
      expr = {
        type: "not",
        left: expr,
        right,
        loc: this.locRange(expr.loc, right.loc),
      };
    }
    return expr;
  }

  private peekIsPrimaryExpressionToken(): boolean {
    const token = this.peek();
    switch (token.kind) {
      case "-":
      case "(":
      case "#":
      case "string":
      case "text":
      case "prefix":
        return true;
      default:
        return false;
    }
  }

  private primary(): ParseNode {
    const token = this.peek();
    switch (token.kind) {
      case "-": {
        const unaryToken = token;
        this.consumeButExpect();
        if (this.eof()) {
          this._warnings.push(
            new ValidationError(
              "Unexpected end of input after unary operator",
              unaryToken.loc,
            ),
          );
          return { type: "text", value: "-", loc: unaryToken.loc };
        }
        const expression = this.expression();

        const loc = this.locRange(unaryToken.loc, expression.loc);
        return { type: "unary", prefix: "-", expression, loc };
      }
      case "(":
        this.consumeButExpect();
        if (this.peek().kind === ")") {
          this.consume();
          return { type: "true", loc: token.loc };
        }
        if (this.eof()) {
          this._warnings.push(
            new ValidationError("Unexpected end of input after (", token.loc),
          );
          return { type: "text", value: "(", loc: token.loc };
        }
        const sub = this.expression();
        const maybeCloseParen = this.peek();
        if (maybeCloseParen.kind !== ")") {
          this._warnings.push(
            new ValidationError(
              "Expected closing parenthesis",
              maybeCloseParen.loc,
            ),
          );
        } else {
          this.consume();
        }
        return sub;
      case ")":
        this.consume();
        this._warnings.push(
          new ValidationError("Unexpected ) without preceding (", token.loc),
        );
        return { type: "text", value: ")", loc: token.loc };
      case "#":
        const tagToken = token;
        const maybeText = this.consumeButExpect();
        if (maybeText.kind !== "text") {
          this._warnings.push(
            new ValidationError("Expected a tag name after #", tagToken.loc),
          );
          return { type: "text", value: "#", loc: tagToken.loc };
        }
        this.consume();
        const loc = this.locRange(tagToken.loc, maybeText.loc);
        return { type: "tag", value: maybeText.value, loc };
      case "string":
        this.consume();
        return { type: "text", value: token.value, loc: token.loc };
      case "text":
        this.consume();
        return { type: "text", value: token.value, loc: token.loc };
      case "prefix":
        this.consumeButExpect();
        return this.parsePrefix(token.value);
      case "AND":
      case "OR":
      case "NOT":
        this.consume();
        this._warnings.push(
          new ValidationError(`Unexpected \`${token.kind}\` token.`, token.loc),
        );
        return { type: "text", value: token.kind, loc: token.loc };
      default:
        throw new Error(`Unexpected token: ${token.kind}`);
    }
  }

  private locRange(start: Loc, end: Loc): Loc {
    return { start: start.start, end: end.end };
  }

  private parsePrefix(prefix: string): ParseNode {
    const maybeText = this.peek();
    const start = maybeText.loc.start;
    if (maybeText.kind !== "text") {
      this._warnings.push(
        new ValidationError(
          `Expected a value after "${prefix}:"`,
          this.peek().loc,
        ),
      );
      return { type: "text", value: `${prefix}:`, loc: { start, end: start } };
    }
    this.consume();
    const end = maybeText.loc.end;
    return {
      type: "prefix",
      prefix,
      value: maybeText.value,
      loc: { start, end },
    };
  }

  private peek(): Token {
    return this.current;
  }

  private consume(): Token {
    // TODO: Handle EOF
    this.current = this.tokens[++this.nextIndex];
    return this.current;
  }

  private consumeButExpect(): Token {
    // TODO: Handle EOF
    this.current = this.tokens[++this.nextIndex];
    return this.current;
  }

  private eof(): boolean {
    return this.current.kind === "eof";
  }
}
