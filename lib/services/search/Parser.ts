import { Loc, ValidationError } from "./Diagnostics";
import { Lexer, Token as Tokens } from "./Lexer";

export type TextNode = {
  type: "text";
  value: string;
  loc: Loc;
};

export type Prefix = "has" | "since" | "until";

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

export type ParseNode = TextNode | PrefixNode | TagNode | UnaryNode | GroupNode;

export function parse(input: string): ParseNode {
  const lexer = new Lexer(input);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}

class Parser {
  private current: IteratorResult<Tokens>;

  constructor(private tokens: Iterator<Tokens>) {
    this.current = this.tokens.next();
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
      case "has":
      case "since":
      case "until":
        return this.parsePrefix(token.kind);
      case "-":
        const unaryToken = this.expect("-");
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
        const tagToken = this.expect("#");
        const tagValue = this.expect("text");
        return {
          type: "tag",
          value: tagValue.value,
          loc: this.locRange(tagToken.loc, tagValue.loc),
        };
        break;
      case "string":
        const stringToken = this.expect("string");
        return {
          type: "text",
          value: token.value,
          loc: stringToken.loc,
        };
      case "text":
        const values: string[] = [];
        let nextToken = token;
        do {
          const nextToken = this.expect("text");
          values.push(nextToken.value);
        } while (!this.eof() && this.peek().kind === "text");
        return {
          type: "text",
          value: values.join(" "),
          loc: this.locRange(token.loc, nextToken.loc),
        };
      default:
        throw new Error(`Unexpected token: ${token.kind}`);
    }
  }

  private locRange(start: Loc, end: Loc): Loc {
    return { start: start.start, end: end.end };
  }

  private parsePrefix(prefix: Prefix): PrefixNode {
    const start = this.peek().loc.start;
    this.advance();
    this.expect(":");
    const value = this.expect("text");
    const end = value.loc.end;
    return { type: "prefix", prefix, value: value.value, loc: { start, end } };
  }

  private parseGroup(): GroupNode {
    const start = this.peek().loc;
    this.expect("(");
    const children: ParseNode[] = [];
    while (!this.eof() && this.peek().kind !== ")") {
      children.push(this.parseExpr());
    }
    const endToken = this.expect(")");
    return { type: "group", children, loc: this.locRange(start, endToken.loc) };
  }

  private peek(): Tokens {
    if (this.current.done) {
      throw new Error(
        "Unexpected end of input. Parser should have checked for EOF",
      );
    }
    return this.current.value;
  }

  private advance(): Tokens {
    const token = this.peek();
    this.current = this.tokens.next();
    return token;
  }

  private expect<T extends Tokens["kind"]>(kind: T): Tokens & { kind: T } {
    const token = this.peek();
    if (token.kind !== kind) {
      throw new ValidationError(
        `Expected ${kind} token, found ${token.kind}`,
        token.loc,
      );
    }
    this.advance();
    return token as Tokens & { kind: T };
  }

  private eof(): boolean {
    return !!this.current.done;
  }
}
