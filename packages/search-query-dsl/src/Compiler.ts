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

  contentTablePrimaryKey?: string;

  ftsTablePrimaryKey?: string;

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

/**
 * Builds up an SQL query from the parse tree.
 *
 * The tricky part is that we would like to use the MATCH FTS query for text
 * searches, since that is the most efficient way to search and also allows us
 * to rank results by relevance. However, MATCH expressions have a somewhat
 * under-documented limitation:
 *
 * > Generally speaking, FTS4 (and FTS3 and FTS5) requires no more than one
 * > MATCH operator in the WHERE clause for each FTS4 table in the FROM
 * > clause, and that one MATCH operator must be a conjunct.
 * >
 * > Sometimes you can bend this rule some and the query planner will still
 * > be able to figure out what to do, but it is easy to bend it too far
 * > and run into the error you encountered.
 *
 * - Dr. Hipp, SQLite Forum https://www.mail-archive.com/sqlite-users@mailinglists.sqlite.org/msg104423.html
 *
 * So, we can only use MATCH in a WHERE clause if that term is "conjunctive",
 * which means it is ANDed with the remaining query terms. This interpretation
 * is confirmed by Dr. Hipp later in the thread.
 *
 * Luckily we have a clever option to reexpress any MATCH expression as a
 * subquery expression that returns a boolean value. So, our job is to determine
 * which expressions can be expressed as MATCH expressions (preferable), and
 * which must deopt to the subquery expression.
 *
 * It is a sub-expression of an non-conjunctive expression where at least one
 * term is not expressible as a MATCH term.
 *
 * To achieve this we employ a two-pass approach:
 *
 * Each expression can be forced by its parent to deopt. If it hasn't been
 * forced by the parent, we deeply traverse the larger expression to determine
 * if all of its sub-expressions can be expressed as MATCH expressions. If so,
 * we emit a single MATCH expression.
 *
 * If not, we attempt to emit as a MATCH expression if possible. If the
 * expression is itself non-conjunctive, we emit the sub-expression forcing them
 * to deopt to a boolean expression.
 */
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
    // The integration may need to include some hard-coded conditions
    // which are always applied to the query and cannot be negated.
    if (this._config.hardCodedConditions != null) {
      for (const condition of this._config.hardCodedConditions) {
        this._whereClauses.push(condition);
      }
    }
    this._whereClauses.push(this.expression(node, false));
  }

  // Detects if an expression can be expressed as a MATCH FTS query.
  isMatchNode(node: ParseNode): node is MatchNode {
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
        return this.isMatchNode(node.left) && this.isMatchNode(node.right);
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
    if (!toBoolean && this.isMatchNode(node)) {
      // This entire expression can be entirely expressed as a MATCH expression.
      return this.matchExpression(node);
    }

    // This expression cannot be expressed entirely as a MATCH expression, but
    switch (node.type) {
      case "true":
        // This only occurs as a result of error recovery in the parser when we
        // hit the end of the input in the middle of a larger expression.
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
        if (this.isMatchNode(node)) {
          return this.matchExpression(node);
        }
        const left = this.expression(node.left, true);
        const right = this.expression(node.right, true);
        return `(${left} OR ${right})`;
      case "and":
        const leftAnd = this.expression(node.left, toBoolean);
        const rightAnd = this.expression(node.right, toBoolean);
        return `(${leftAnd} AND ${rightAnd})`;
      case "not":
        if (this.isMatchNode(node)) {
          return this.matchExpression(node);
        }
        // We emit as AND + NOT which means technically this is conjunctive.
        // That means the left hand side can still be a MATCH expression if
        // allowed by the parent expression. The right hand side must
        // always be a boolean expression.
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
          return `ORDER BY RANK ASC, ${bestSort}`;
        }
        return `ORDER BY ${bestSort}`;
      case "latest":
        if (this._hasMatch) {
          return `ORDER BY ${this._config.contentTable}.DATE DESC, RANK ASC, ${bestSort}`;
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

    const contentTablePrimaryKey =
      this._config.contentTablePrimaryKey ?? "rowid";
    const ftsTablePrimaryKey = this._config.ftsTablePrimaryKey ?? "rowid";

    return `SELECT ${columns} FROM ${this._config.ftsTable}
LEFT JOIN ${this._config.contentTable} ON ${this._config.contentTable}.${contentTablePrimaryKey} = ${this._config.ftsTable}.${ftsTablePrimaryKey}
${this.where()}
${this.sort()}
${this.limit()}`.trim();
  }
}
