import { Result, ValidationError } from "./Diagnostics";
import { lex } from "./Lexer";
import { MatchNode, parse, ParseNode, PrefixNode } from "./Parser";

export type SortOption = "best" | "latest";

/**
 * Defines the schema of the SQLite database used for full-text search.
 */
export type SchemaConfig = {
  ftsTable: string;
  ftsTextColumns: string[];
  contentTable: string;
  hardCodedConditions: string[];
  isConditions: {
    [key: string]: string;
  };
  hasConditions: {
    [key: string]: string;
  };
};

const SCHEMA: SchemaConfig = {
  ftsTable: "content_fts",
  ftsTextColumns: ["title", "content", "tags", "summary"],
  contentTable: "content",
  hardCodedConditions: [
    `(json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))`,
    `(json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))`,
  ],
  isConditions: {
    blog: "content.page_type = 'post'",
    note: "content.page_type = 'note'",
  },
  hasConditions: {
    video:
      "EXISTS (SELECT 1 FROM content_youtube WHERE content_youtube.content_id = content.id)",
    audio:
      "EXISTS (SELECT 1 FROM content_audio WHERE content_audio.content_id = content.id)",
    link: "EXISTS (SELECT 1 FROM content_links WHERE content_links.content_id = content.id)",

    image:
      "EXISTS (SELECT 1 FROM content_images WHERE content_images.content_id = content.id)",
    media:
      "EXISTS (SELECT 1 FROM content_images WHERE content_images.content_id = content.id) OR EXISTS (SELECT 1 FROM content_audio WHERE content_audio.content_id = content.id) OR EXISTS (SELECT 1 FROM content_youtube WHERE content_youtube.content_id = content.id)",
    tweet:
      "EXISTS (SELECT 1 FROM content_tweets WHERE content_tweets.content_id = content.id)",
    draft: "json_extract(content.metadata, '$.draft')",
    archive: "json_extract(content.metadata, '$.archive')",
    comments: "json_extract(content.metadata, '$.github_comments_issue_id')",
  },
};

export function compile(
  searchQuery: string,
  sort: SortOption,
  limit: number | null,
  config: SchemaConfig = SCHEMA,
): Result<{
  query: string;
  params: { [key: string]: string };
}> {
  const tokenResult = lex(searchQuery);
  const parseResult = parse(tokenResult.value);
  const compiler = new Compiler(config, sort, limit);
  compiler.compile(parseResult.value);
  return {
    value: { query: compiler.serialize(), params: compiler.params },
    warnings: [
      ...tokenResult.warnings,
      ...parseResult.warnings,
      ...compiler._warnings,
    ],
  };
}

// Compile a search query into an SQL query with params.
class Compiler {
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
    for (const condition of this._config.hardCodedConditions) {
      this._whereClauses.push(condition);
    }
    this._whereClauses.push(this.expression(node, false));
  }

  // Detects if a
  isMachNode(node: ParseNode): node is MatchNode {
    switch (node.type) {
      case "text":
        return true;
      case "group":
        if (node.children.length === 0) {
          return false;
        }
        return node.children.every((child) => this.isMachNode(child));
      case "tag":
        return false;
      case "unary":
        return this.isMachNode(node.expression);
      case "prefix":
        return false;
      default:
        // @ts-expect-error
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  matchExpression(node: MatchNode): string {
    this._hasMatch = true;
    const clause = this.matchClause(node);
    const columnList = this._config.ftsTextColumns.join(" ");
    return `${this._config.ftsTable} MATCH ('{${columnList}}:' || ${clause} || '*')`;
  }

  matchClause(node: MatchNode): string {
    switch (node.type) {
      case "text":
        return this.registerParam(this.escapeForFTS(node.value));
      case "group":
        const matchClauses = node.children.map((child) => {
          return this.matchClause(child);
        });
        return `(${matchClauses.join(` || 'AND' || `)})`;
      default:
        // @ts-expect-error
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  expression(node: ParseNode, toBoolean: boolean): string {
    switch (node.type) {
      case "text":
        return this.contentMatch(node.value, toBoolean);
      case "group":
        // TODO: What if we are boolean?
        if (this.isMachNode(node)) {
          return this.matchExpression(node);
        }
        if (node.children.length === 0) {
          return "TRUE";
        }
        const groupClauses = node.children.map((child) => {
          return this.expression(child, true);
        });
        return `(${groupClauses.join(`\nAND `)})`;
      case "tag":
        // `content.tags` is a space-separated list of tags. A simple `%tag%`
        // would match substrings of tags, which is not what we want.
        // We need to match the tag at the start or end of the string, or
        // between spaces.
        const param = this.registerParam(node.value);
        const joined = [
          `${this._config.contentTable}.tags LIKE ${param}`, // This is the only tag
          `${this._config.contentTable}.tags LIKE ${param} || ' %'`, // This is the first
          `${this._config.contentTable}.tags LIKE '% ' || ${param}`, // This is the last tag
          `${this._config.contentTable}.tags LIKE '% ' || ${param} || ' %'`, // This is in the middle
        ].join(" OR ");
        return `(${joined})`;
      case "unary":
        return `NOT (${this.expression(node.expression, true)})`;
      case "prefix":
        return this.prefix(node, toBoolean);
      default:
        // @ts-expect-error
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  prefix(node: PrefixNode, toBoolean: boolean): string {
    switch (node.prefix) {
      case "has":
        return this.has(node, toBoolean);
      case "is":
        return this.is(node, toBoolean);
      case "after":
        const sinceParam = this.registerParam(node.value);
        return `${this._config.contentTable}.DATE > ${sinceParam}`;
      case "before":
        const untilParam = this.registerParam(node.value);
        return `${this._config.contentTable}.DATE < ${untilParam}`;
      default:
        this._warnings.push(
          new ValidationError(`Unknown prefix: ${node.prefix}`, node.loc),
        );
        return this.contentMatch(`${node.prefix}:${node.value}`, toBoolean);
    }
  }

  has(node: PrefixNode, toBoolean: boolean): string {
    const condition = this._config.hasConditions[node.value];
    if (condition != null) {
      return condition;
    }

    this._warnings.push(
      new ValidationError(`Unknown "has" value: ${node.value}`, node.loc),
    );
    return this.contentMatch(`has:${node.value}`, toBoolean);
  }
  is(node: PrefixNode, toBoolean: boolean): string {
    const condition = this._config.isConditions[node.value];
    if (condition != null) {
      return condition;
    }
    this._warnings.push(
      new ValidationError(`Unknown "is" value: ${node.value}`, node.loc),
    );
    return this.contentMatch(`is:${node.value}`, toBoolean);
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
    const condition = `${this._config.ftsTable} MATCH ('{${columnList}}: ' || ${param} || ' *')`;
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
    switch (this._sort) {
      case "best":
        if (this._hasMatch) {
          return `ORDER BY RANK DESC, page_rank DESC`;
        }
        return `ORDER BY page_rank DESC`;
      case "latest":
        if (this._hasMatch) {
          return `ORDER BY ${this._config.contentTable}.DATE DESC, RANK DESC, page_rank DESC`;
        }
        return `ORDER BY ${this._config.contentTable}.DATE DESC, page_rank DESC`;
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
    return `SELECT ${this._config.contentTable}.* FROM ${this._config.ftsTable}
LEFT JOIN ${this._config.contentTable} ON ${this._config.contentTable}.rowid = ${this._config.ftsTable}.rowid
${this.where()}
${this.sort()}
${this.limit()}`.trim();
  }
}
