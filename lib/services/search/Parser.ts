import { Loc, Result, ValidationError } from "./Diagnostics";
import { Lexer, TextToken, Token as Token } from "./Lexer";

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

  private parseExpr(): ParseNode {
    const token = this.peek();
    switch (token.kind) {
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
          return { type: "text", value: "-", loc: unaryToken.loc };
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
      case ")":
        this.next();
        this._warnings.push(
          new ValidationError("Unexpected ) without preceding (", token.loc),
        );
        return { type: "text", value: ")", loc: token.loc };
      case "#":
        const tagToken = token;
        const maybeText = this.next();
        if (maybeText.kind !== "text") {
          this._warnings.push(
            new ValidationError("Expected a tag name after #", tagToken.loc),
          );
          return { type: "text", value: "#", loc: tagToken.loc };
        }
        this.next();
        return {
          type: "tag",
          value: maybeText.value,
          loc: this.locRange(tagToken.loc, maybeText.loc),
        };
      case "string":
        this.next();
        return { type: "text", value: token.value, loc: token.loc };
      case "text":
        this.next();
        return { type: "text", value: token.value, loc: token.loc };
      case "prefix":
        this.next();
        return this.parsePrefix(token.value);
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
    const start = this.next().loc;
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

  private eof(): boolean {
    return this.current.kind === "eof";
  }
}
