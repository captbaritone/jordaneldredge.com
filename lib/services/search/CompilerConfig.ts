import { SchemaConfig } from "./Compiler";

/**
 * SchemaConfig for jordaneldredge.com
 */
export const SCHEMA: SchemaConfig = {
  ftsTable: "content_fts_2",
  ftsTextColumns: ["title", "content", "tags", "summary"],
  contentTable: "content",
  hardCodedConditions: [
    `(json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))`,
    `(json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))`,
  ],
  keyValueCondition(key: string, value: string): string | null {
    switch (key) {
      case "is": {
        switch (value) {
          case "blog":
            return "content.page_type = 'post'";
          case "note":
            return "content.page_type = 'note'";
          default:
            return null;
        }
      }
      case "has":
        switch (value) {
          case "image":
            return "EXISTS (SELECT 1 FROM content_images WHERE content_images.content_id = content.id)";
          case "video":
            return "EXISTS (SELECT 1 FROM content_youtube WHERE content_youtube.content_id = content.id)";
          case "audio":
            return "EXISTS (SELECT 1 FROM content_audio WHERE content_audio.content_id = content.id)";
          case "link":
            return "EXISTS (SELECT 1 FROM content_links WHERE content_links.content_id = content.id)";
          case "media":
            return "EXISTS (SELECT 1 FROM content_images WHERE content_images.content_id = content.id) OR EXISTS (SELECT 1 FROM content_audio WHERE content_audio.content_id = content.id) OR EXISTS (SELECT 1 FROM content_youtube WHERE content_youtube.content_id = content.id)";
          case "tweet":
            return "EXISTS (SELECT 1 FROM content_tweets WHERE content_tweets.content_id = content.id)";
          case "draft":
            return "json_extract(content.metadata, '$.draft')";
          case "archive":
            return "json_extract(content.metadata, '$.archive')";
          case "comments":
            return "json_extract(content.metadata, '$.github_comments_issue_id')";
          default:
            return null;
        }
      default:
        return null;
    }
  },
  tagCondition(param: string): string | null {
    return [
      `${this.contentTable}.tags LIKE ${param}`, // This is the only tag
      `${this.contentTable}.tags LIKE ${param} || ' %'`, // This is the first
      `${this.contentTable}.tags LIKE '% ' || ${param}`, // This is the last tag
      `${this.contentTable}.tags LIKE '% ' || ${param} || ' %'`, // This is in the middle
    ].join(" OR ");
  },

  defaultBestSort: "page_rank DESC",
};
