import { Result, ValidationError } from "./Diagnostics";
import { parse, ParseNode, PrefixNode } from "./Parser";

export function compile(searchQuery: string): Result<{
  query: string;
  wildcards: { [key: string]: string };
}> {
  const { value: queryTree, warnings } = parse(searchQuery);
  const compiler = new Compiler();
  compiler.compile(queryTree);
  return {
    value: { query: compiler.serialize(), wildcards: compiler.params },
    warnings: [...warnings, ...compiler._warnings],
  };
}

const ALL_TEXT_COLUMNS = ["title", "content", "tags", "summary"];

// Compile a search query into an SQL query with params.
class Compiler {
  _negate: boolean = false;
  _nextParam: number = 0;
  _whereClauses: string[] = [];
  _warnings: ValidationError[] = [];
  params: { [key: string]: string } = {};
  compile(node: ParseNode) {
    this._whereClauses.push(this.expression(node));
  }
  expression(node: ParseNode): string {
    switch (node.type) {
      case "text":
        return this.contentMatch(ALL_TEXT_COLUMNS, node.value);
      case "group":
        const groupClauses = node.children.map((child) => {
          return this.expression(child);
        });
        return `(${groupClauses.join(`\nAND `)})`;
      case "tag":
        const param = this.registerParam(node.value);
        return `content.tags LIKE '%' || ${param} || '%'`;
      case "unary":
        return `NOT (${this.expression(node.expression)})`;
      case "prefix":
        return this.prefix(node);
      default:
        // @ts-expect-error
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  prefix(node: PrefixNode): string {
    switch (node.prefix) {
      case "has":
        return this.has(node);
      case "since":
        const sinceParam = this.registerParam(node.value);
        return `content.DATE >= ${sinceParam}`;
      case "until":
        const untilParam = this.registerParam(node.value);
        return `content.DATE <= ${untilParam}`;
      default:
        throw new Error(`Unknown prefix: ${node.prefix}`);
    }
  }

  has(node: PrefixNode): string {
    switch (node.value) {
      case "video":
        return this.hasForeignReference("content_youtube");
      case "audio":
        return this.hasForeignReference("content_audio");
      case "link":
        return this.hasForeignReference("content_links");
      case "image":
        return this.hasForeignReference("content_images");
      case "tweet":
        return this.hasForeignReference("content_tweets");
      default: {
        this._warnings.push(
          new ValidationError(`Unknown "has" value: ${node.value}`, node.loc),
        );
        return this.contentMatch(ALL_TEXT_COLUMNS, `has:${node.value}`);
      }
    }
  }

  hasForeignReference(foreignTable: string): string {
    return `EXISTS (SELECT 1 FROM ${foreignTable} WHERE ${foreignTable}.content_id = content.id)`;
  }

  contentMatch(columns: string[], value: string): string {
    const param = this.registerParam(this.escapeForFTS(value));
    const columnList = columns.join(" ");
    return `content_fts MATCH ('{${columnList}}:' || ${param} || '*')`;
  }

  // https://stackoverflow.com/a/79510332/1263117
  // - Escape all double quotes (") in the query by replacing them with ""
  // - Split the user's query on white space, into words
  // - Wrap each word in double quotes
  // - Join the words back together with a space
  escapeForFTS(query: string): string {
    const escaped = query.replace(/"/g, '""');
    const words = escaped.split(/\s+/).map((word) => '"' + word + '"');
    return words.join(" ");
  }

  registerParam(value: string): string {
    const param = `param${this._nextParam++}`;
    this.params[param] = value;
    return `:${param}`;
  }

  where(): string {
    return `WHERE ${this._whereClauses.join(" AND ")}`;
  }

  joins(): string {
    return "LEFT JOIN content ON content.rowid = content_fts.rowid";
  }

  serialize(): string {
    return `SELECT content.*
FROM content_fts
${this.joins()}
${this.where()}`;
  }
}
