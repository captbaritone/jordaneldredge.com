import { Loc, Result, ValidationError } from "./Diagnostics";
import { Token as Token } from "./Lexer";

export type TextNode = {
  type: "text";
  value: string;
  // true if this string ends with the EOF token. This information can
  // allow the compiler to model this string as a prefix query.
  isEof: boolean;
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

type NonEofToken = Exclude<Token, { kind: "eof" }>;

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
    const head = this.peek();
    if (head.kind === "eof") {
      return { type: "true", loc: { start: 0, end: 0 } };
    }
    return this.expression(head);
  }

  private expression(head: NonEofToken): ParseNode {
    return this.or(head);
  }

  private or(head: NonEofToken): ParseNode {
    let expr = this.and(head);
    for (let token = this.peek(); token.kind === "OR"; token = this.peek()) {
      token = this.consume(); // OR
      if (token.kind === "eof") {
        this._warnings.push(
          new ValidationError("Unexpected end of input after OR", token.loc),
        );
        return expr;
      }
      const right = this.and(token);
      expr = {
        type: "or",
        left: expr,
        right,
        loc: this.locRange(expr.loc, right.loc),
      };
    }
    return expr;
  }

  private and(head: NonEofToken): ParseNode {
    let expr = this.not(head);
    for (let token = this.peek(); token.kind !== "eof"; token = this.peek()) {
      if (token.kind === "AND") {
        token = this.consume(); // AND
        if (token.kind === "eof") {
          this._warnings.push(
            new ValidationError("Unexpected end of input after AND", token.loc),
          );
          return { type: "text", value: "AND", loc: token.loc, isEof: true };
        }
        const right = this.not(token);
        expr = {
          type: "and",
          left: expr,
          right,
          loc: this.locRange(expr.loc, right.loc),
        };
      } else if (this.peekIsNotExpressionToken()) {
        const right = this.not(token);
        expr = {
          type: "and",
          left: expr,
          right,
          loc: this.locRange(expr.loc, right.loc),
        };
      } else {
        break;
      }
    }
    return expr;
  }

  private peekIsNotExpressionToken(): boolean {
    return this.peekIsPrimaryExpressionToken();
  }

  private not(head: NonEofToken): ParseNode {
    let expr = this.primary(head);
    for (let token = this.peek(); token.kind === "NOT"; token = this.peek()) {
      token = this.consume(); // NOT
      if (token.kind === "eof") {
        this._warnings.push(
          new ValidationError("Unexpected end of input after NOT", token.loc),
        );
        return expr;
      }
      const right = this.primary(token);
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

  private primary(token: NonEofToken): ParseNode {
    switch (token.kind) {
      case "-": {
        const unaryToken = token;
        const head = this.consume();
        if (head.kind === "eof") {
          this._warnings.push(
            new ValidationError(
              "Unexpected end of input after unary operator",
              unaryToken.loc,
            ),
          );
          return { type: "text", value: "-", loc: unaryToken.loc, isEof: true };
        }
        const expression = this.expression(head);

        const loc = this.locRange(unaryToken.loc, expression.loc);
        return { type: "unary", prefix: "-", expression, loc };
      }
      case "(":
        const head = this.consume();
        if (head.kind === ")") {
          this.consume();
          return { type: "true", loc: this.locRange(head.loc, head.loc) };
        }
        if (head.kind === "eof") {
          this._warnings.push(
            new ValidationError("Unexpected end of input after (", token.loc),
          );
          return { type: "text", value: "(", loc: token.loc, isEof: true };
        }
        const sub = this.expression(head);
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
      case ")": {
        this.consume();
        this._warnings.push(
          new ValidationError("Unexpected ) without preceding (", token.loc),
        );
        const isEof = this.peek().kind === "eof";
        return { type: "text", value: ")", loc: token.loc, isEof };
      }
      case "#":
        const tagToken = token;
        const maybeText = this.consume();
        if (maybeText.kind !== "text") {
          this._warnings.push(
            new ValidationError("Expected a tag name after #", tagToken.loc),
          );
          return { type: "text", value: "#", loc: tagToken.loc, isEof: true };
        }
        this.consume();
        const loc = this.locRange(tagToken.loc, maybeText.loc);
        return { type: "tag", value: maybeText.value, loc };
      case "string":
        this.consume();
        return {
          type: "text",
          value: token.value,
          loc: token.loc,
          isEof: false,
        };
      case "text":
        this.consume();
        const isEof = this.peek().kind === "eof";
        return { type: "text", value: token.value, loc: token.loc, isEof };
      case "prefix":
        this.consume();
        return this.parsePrefix(token.value);
      case "AND":
      case "OR":
      case "NOT": {
        this.consume();
        this._warnings.push(
          new ValidationError(`Unexpected \`${token.kind}\` token.`, token.loc),
        );
        const isEof = this.peek().kind === "eof";
        return { type: "text", value: token.kind, loc: token.loc, isEof };
      }
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
      const isEof = this.peek().kind === "eof";
      return {
        type: "text",
        value: `${prefix}:`,
        loc: { start, end: start },
        isEof,
      };
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
}
