import { Result, ValidationError } from "./Diagnostics";
import { lex } from "./Lexer";
import { MatchNode, parse, ParseNode, PrefixNode } from "./Parser";

export type SortOption = "best" | "latest";

/**
 * Defines the schema of the SQLite database used for full-text search.
 * Also defines the semantics of your query DSL, such as the behavior of
 * key:value pairs and hash tags.
 */
export type SchemaConfig = {
  /**
   * The name of your FTS5 table
   */
  ftsTable: string;
  /**
   * The name of your main content table
   */
  contentTable: string;
  /**
   * The text columns in your FTS5 table.
   * These must correspond to columns in your `contentTable`.
   */
  ftsTextColumns: string[];
  /**
   * The name of the column in your content table that should be fetched.
   */
  selectColumns?: string[];
  /**
   * Additional WHERE conditions to apply to all queries.
   * These can be used to enforce things like "only show published posts" or
   * "only show posts that are not drafts".
   */
  hardCodedConditions?: string[];
  /**
   * For key-value pairs like `is:blog` or `has:image`, this function should
   * return the SQL condition to apply. If the key-value pair is not recognized,
   * return null.
   */
  keyValueCondition?(key: string, value: string): string | null;
  /**
   * For hash tags like `#tag`, this function should return the SQL condition to
   * apply. If the tag is not recognized, return null.
   */
  tagCondition?(tagNameParam: string): string | null;
  /**
   * The default sort order for the results. This is used when the query cannot use
   * the MATCH rank for sorting.
   */
  defaultBestSort: string;
};

export function compile(
  config: SchemaConfig,
  searchQuery: string,
  sort: SortOption,
  limit: number | null,
): Result<{
  query: string;
  params: { [key: string]: string };
}> {
  const tokenResult = lex(searchQuery);
  const parseResult = parse(tokenResult.value);
  const compiler = new Compiler(config, sort, limit);
  compiler.compile(parseResult.value);
  const sql = compiler.serialize();
  return {
    value: { query: sql, params: compiler.params },
    warnings: [
      ...tokenResult.warnings,
      ...parseResult.warnings,
      ...compiler._warnings,
    ],
  };
}

// Compile a search query into an SQL query with params.
export class Compiler {
  _nextParam: number = 0;
  _whereClauses: string[] = [];
  _warnings: ValidationError[] = [];
  _sort: SortOption;
  _limit: number | null;
  _hasMatch: boolean = false;
  _config: SchemaConfig;
  params: { [key: string]: string } = {};
  constructor(config: SchemaConfig, sort: SortOption, limit: number | null) {
    this._config = config;
    this._sort = sort;
    this._limit = limit;
  }
  compile(node: ParseNode) {
    // Currently we always ignore draft and archive posts.
    if (this._config.hardCodedConditions != null) {
      for (const condition of this._config.hardCodedConditions) {
        this._whereClauses.push(condition);
      }
    }
    this._whereClauses.push(this.expression(node, false));
  }

  // Detects if a
  isMachNode(node: ParseNode): node is MatchNode {
    switch (node.type) {
      case "text":
        return true;
      case "true":
        return false;
      case "tag":
        return false;
      case "unary":
        return false;
      case "prefix":
        return false;
      case "or":
      case "and":
      case "not":
        return this.isMachNode(node.left) && this.isMachNode(node.right);
      default:
        // @ts-expect-error
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  matchExpression(node: MatchNode): string {
    this._hasMatch = true;
    const clause = this.matchClause(node);
    const columnList = this._config.ftsTextColumns.join(" ");
    return `${this._config.ftsTable} MATCH ('{${columnList}}: ' || (${clause}))`;
  }

  matchClause(node: MatchNode): string {
    switch (node.type) {
      case "text":
        const param = this.registerParam(this.escapeForFTS(node.value));
        return node.isEof ? `${param} || ' *'` : param;
      case "and":
        const leftAnd = this.matchClause(node.left);
        const rightAnd = this.matchClause(node.right);
        return `(${leftAnd} || 'AND' || ${rightAnd})`;
      case "or":
        const leftOr = this.matchClause(node.left);
        const rightOr = this.matchClause(node.right);
        return `(${leftOr} || 'OR' || ${rightOr})`;
      case "not":
        const leftNot = this.matchClause(node.left);
        const rightNot = this.matchClause(node.right);
        return `(${leftNot} || 'NOT' || ${rightNot})`;
      default:
        // @ts-expect-error
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  expression(node: ParseNode, toBoolean: boolean): string {
    if (!toBoolean && this.isMachNode(node)) {
      return this.matchExpression(node);
    }
    switch (node.type) {
      case "true":
        return "TRUE";
      case "tag":
        // `content.tags` is a space-separated list of tags. A simple `%tag%`
        // would match substrings of tags, which is not what we want.
        // We need to match the tag at the start or end of the string, or
        // between spaces.
        const param = this.registerParam(node.value);
        if (this._config.tagCondition != null) {
          const condition = this._config.tagCondition(param);
          if (condition != null) {
            return condition;
          }
        }
        this._warnings.push(
          new ValidationError(`Unknown tag: ${node.value}`, node.loc),
        );
        return this.contentMatch(`#${node.value}`, toBoolean);
      case "unary":
        return `NOT (${this.expression(node.expression, true)})`;
      case "prefix":
        return this.prefix(node, toBoolean);
      case "or":
        const left = this.expression(node.left, toBoolean);
        const right = this.expression(node.right, toBoolean);
        return `(${left} OR ${right})`;
      case "and":
        const leftAnd = this.expression(node.left, toBoolean);
        const rightAnd = this.expression(node.right, toBoolean);
        return `(${leftAnd} AND ${rightAnd})`;
      case "not":
        if (this.isMachNode(node)) {
          return this.matchExpression(node);
        }
        const leftNot = this.expression(node.left, toBoolean);
        const rightNot = this.expression(node.right, true);
        return `(${leftNot} AND NOT ${rightNot})`;
      case "text":
        return this.contentMatch(node.value, toBoolean);
      default:
        // @ts-expect-error
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  prefix(node: PrefixNode, toBoolean: boolean): string {
    switch (node.prefix) {
      case "after":
        const sinceParam = this.registerParam(node.value);
        return `${this._config.contentTable}.DATE > ${sinceParam}`;
      case "before":
        const untilParam = this.registerParam(node.value);
        return `${this._config.contentTable}.DATE < ${untilParam}`;
      default:
        return this.keyValue(node, toBoolean);
    }
  }

  keyValue(node: PrefixNode, toBoolean: boolean): string {
    if (this._config.keyValueCondition != null) {
      const condition = this._config.keyValueCondition(node.prefix, node.value);
      if (condition != null) {
        return condition;
      }
    }
    this._warnings.push(
      new ValidationError(
        `Unknown key-value pair: ${node.prefix}:${node.value}`,
        node.loc,
      ),
    );
    return this.contentMatch(`${node.prefix}:${node.value}`, toBoolean);
  }

  // Ideally we could always use a regular MATCH FTS search here. However, MATCH
  // is not a boolean operator which means it can't compose with things like AND
  // OR or negation. This is because conceptually MATCH is really a ranking
  // function (_how much_ does this record match the query) than a predicate
  // (_does_ this record match the query).
  //
  // To work around this, if we are expected to emit a boolean condition, we use
  // a subquery to fake a boolean result.
  // https://sqlite.org/forum/forumpost/09117b51f41116d4
  //
  //
  // By only de-optimizing to this approach when the result is expected to be
  // boolean, we can still preserve the ranking of the results in the common
  // case.
  contentMatch(value: string, toBoolean: boolean): string {
    const param = this.registerParam(this.escapeForFTS(value));
    const columnList = this._config.ftsTextColumns.join(" ");
    const condition = `${this._config.ftsTable} MATCH ('{${columnList}}: ' || ${param})`;
    if (!toBoolean) {
      // Set this._hasMatch to true so we know that we can sort by MATCH rank later.
      this._hasMatch = true;
      return condition;
    } else {
      return `${this._config.contentTable}.rowid IN (SELECT ${this._config.ftsTable}.rowid FROM ${this._config.ftsTable} WHERE ${condition})`;
    }
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

  whereMetadataKeyIsFalsy(key: string) {
    this._whereClauses.push(
      `(json_extract(metadata, '$.${key}') IS NULL OR NOT json_extract(metadata, '$.${key}'))`,
    );
  }

  where(): string {
    return `WHERE ${this._whereClauses.join("\nAND ")}`;
  }

  // TODO: Can I avoid having to write DESC multiple times?
  sort(): string {
    const bestSort = this._config.defaultBestSort;
    switch (this._sort) {
      case "best":
        if (this._hasMatch) {
          return `ORDER BY RANK DESC, ${bestSort}`;
        }
        return `ORDER BY ${bestSort}`;
      case "latest":
        if (this._hasMatch) {
          return `ORDER BY ${this._config.contentTable}.DATE DESC, RANK DESC, ${bestSort}`;
        }
        return `ORDER BY ${this._config.contentTable}.DATE DESC, ${bestSort}`;
      default:
        throw new Error(`Unknown sort option: ${this._sort}`);
    }
  }

  limit(): string {
    if (this._limit) {
      return `LIMIT ${this._limit}`;
    } else {
      return "";
    }
  }

  serialize(): string {
    const columns = this._config.selectColumns
      ? this._config.selectColumns.join(", ")
      : `${this._config.contentTable}.*`;

    return `SELECT ${columns} FROM ${this._config.ftsTable}
LEFT JOIN ${this._config.contentTable} ON ${this._config.contentTable}.rowid = ${this._config.ftsTable}.rowid
${this.where()}
${this.sort()}
${this.limit()}`.trim();
  }
}
