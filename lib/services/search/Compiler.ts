import { Result, ValidationError } from "./Diagnostics";
import { MatchNode, parse, ParseNode, PrefixNode } from "./Parser";

export type SortOption = "best" | "latest";

export function compile(
  searchQuery: string,
  sort: SortOption,
  limit: number | null,
): Result<{
  query: string;
  params: { [key: string]: string };
}> {
  const { value: queryTree, warnings } = parse(searchQuery);
  const compiler = new Compiler(sort, limit);
  compiler.compile(queryTree);
  return {
    value: { query: compiler.serialize(), params: compiler.params },
    warnings: [...warnings, ...compiler._warnings],
  };
}

const ALL_TEXT_COLUMNS = ["title", "content", "tags", "summary"];

// Compile a search query into an SQL query with params.
class Compiler {
  _nextParam: number = 0;
  _whereClauses: string[] = [];
  _warnings: ValidationError[] = [];
  _sort: SortOption;
  _limit: number | null;
  _hasMatch: boolean = false;
  params: { [key: string]: string } = {};
  constructor(sort: SortOption, limit: number | null) {
    this._sort = sort;
    this._limit = limit;
  }
  compile(node: ParseNode) {
    // Currently we always ignore draft and archive posts.
    this.whereMetadataKeyIsFalsy("archive");
    this.whereMetadataKeyIsFalsy("draft");
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
    const columnList = ALL_TEXT_COLUMNS.join(" ");
    return `content_fts MATCH ('{${columnList}}:' || ${clause} || '*')`;
  }

  matchClause(node: MatchNode): string {
    switch (node.type) {
      case "text":
        return this.registerParam(this.escapeForFTS(node.value));
      case "group":
        const matchClauses = node.children.map((child) => {
          return this.matchClause(child);
        });
        return `(${matchClauses.join(`\nAND `)})`;
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
          `content.tags LIKE ${param}`, // This is the only tag
          `content.tags LIKE ${param} || ' %'`, // This is the first
          `content.tags LIKE '% ' || ${param}`, // This is the last tag
          `content.tags LIKE '% ' || ${param} || ' %'`, // This is in the middle
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
      case "after":
        const sinceParam = this.registerParam(node.value);
        return `content.DATE > ${sinceParam}`;
      case "before":
        const untilParam = this.registerParam(node.value);
        return `content.DATE < ${untilParam}`;
      default:
        this._warnings.push(
          new ValidationError(`Unknown prefix: ${node.prefix}`, node.loc),
        );
        return this.contentMatch(`${node.prefix}:${node.value}`, toBoolean);
    }
  }

  has(node: PrefixNode, toBoolean: boolean): string {
    switch (node.value) {
      case "video":
        return this.hasForeignReference("content_youtube");
      case "audio":
        return this.hasForeignReference("content_audio");
      case "link":
        return this.hasForeignReference("content_links");
      case "image":
        return this.hasForeignReference("content_images");
      case "media":
        return [
          this.hasForeignReference("content_images"),
          this.hasForeignReference("content_audio"),
          this.hasForeignReference("content_youtube"),
        ].join(" OR ");
      case "tweet":
        return this.hasForeignReference("content_tweets");
      case "draft":
        return this.hasMetadata("draft");
      case "archive":
        return this.hasMetadata("archive");
      case "comments":
        return this.hasMetadata("github_comments_issue_id");
      case "post":
        return "content.page_type = 'post'";
      case "note":
        return "content.page_type = 'note'";
      default: {
        this._warnings.push(
          new ValidationError(`Unknown "has" value: ${node.value}`, node.loc),
        );
        return this.contentMatch(`has:${node.value}`, toBoolean);
      }
    }
  }

  hasForeignReference(foreignTable: string): string {
    return `EXISTS (SELECT 1 FROM ${foreignTable} WHERE ${foreignTable}.content_id = content.id)`;
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
    const columnList = ALL_TEXT_COLUMNS.join(" ");
    const condition = `content_fts MATCH ('{${columnList}}:' || ${param} || '*')`;
    if (!toBoolean) {
      // Set this._hasMatch to true so we know that we can sort by MATCH rank later.
      this._hasMatch = true;
      return condition;
    } else {
      return `content.rowid IN (SELECT content_fts.rowid FROM content_fts WHERE ${condition})`;
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

  hasMetadata(key: string) {
    return `(json_extract(metadata, '$.${key}') IS NOT NULL AND json_extract(metadata, '$.${key}'))`;
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
          return `ORDER BY content.DATE DESC, RANK DESC, page_rank DESC`;
        }
        return `ORDER BY content.DATE DESC, page_rank DESC`;
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
    return `SELECT content.* FROM content_fts
LEFT JOIN content ON content.rowid = content_fts.rowid
${this.where()}
${this.sort()}
${this.limit()}`.trim();
  }
}
