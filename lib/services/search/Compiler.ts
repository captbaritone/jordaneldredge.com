import { Result, ValidationError } from "./Diagnostics";
import { parse, ParseNode, PrefixNode } from "./Parser";

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
  params: { [key: string]: string } = {};
  constructor(sort: SortOption, limit: number | null) {
    this._sort = sort;
    this._limit = limit;
  }
  compile(node: ParseNode) {
    // Currently we always ignore draft and archive posts.
    this.whereMetadataKeyIsFalsy("archive");
    this.whereMetadataKeyIsFalsy("draft");
    this._whereClauses.push(this.expression(node));
  }
  expression(node: ParseNode): string {
    switch (node.type) {
      case "text":
        return this.contentMatch(ALL_TEXT_COLUMNS, node.value);
      case "group":
        if (node.children.length === 0) {
          return "TRUE";
        }
        const groupClauses = node.children.map((child) => {
          return this.expression(child);
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
      case "after":
        const sinceParam = this.registerParam(node.value);
        return `content.DATE > ${sinceParam}`;
      case "before":
        const untilParam = this.registerParam(node.value);
        return `content.DATE < ${untilParam}`;
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

  // Ideally we could use a regular MATCH FTS search here. However, MATCH is not
  // a boolean operator which means it can't compose with things like AND OR or
  // negation. This is because conceptually MATCH is really a ranking function
  // (_how much_ does this record match the query) than a predicate (_does_ this
  // record match the query).
  //
  // To work around this, we use a subquery to fake a boolean result.
  // This is sub optimal because it means we forego match-based ranking.
  // https://sqlite.org/forum/forumpost/09117b51f41116d4
  //
  // A more advanced version of this compiler might try to understand when a
  // string value is _not_ being used in a boolean position, and in that case
  // use the MATCH operator directly.
  contentMatch(columns: string[], value: string): string {
    const param = this.registerParam(this.escapeForFTS(value));
    const columnList = columns.join(" ");
    return `content.rowid IN (SELECT content_fts.rowid FROM content_fts WHERE content_fts MATCH ('{${columnList}}:' || ${param} || '*'))`;
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
    return `WHERE ${this._whereClauses.join(" AND ")}`;
  }

  sort(): string {
    switch (this._sort) {
      case "best":
        // return `ORDER BY RANK DESC`;
        return `ORDER BY page_rank DESC`;
      case "latest":
        return `ORDER BY content.DATE DESC`;
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
    return `SELECT content.* FROM content
${this.where()}
${this.sort()}
${this.limit()}`.trim();
  }
}
