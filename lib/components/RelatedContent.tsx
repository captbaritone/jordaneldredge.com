import React from "react";
import Link from "next/link.js";
import { Listable } from "../data/interfaces";
import { SearchIndexRow } from "../search";
import * as Data from "../data";
import { db, sql } from "../db";

type Props = {
  item: Listable;
};

export default async function RelatedContent({ item }: Props) {
  const tags = item.tagSet().tags();
  if (!tags || tags.length === 0) {
    return null;
  }
  const relatedItems = related(item, 3);
  if (relatedItems.length === 0) {
    return null;
  }
  return (
    <>
      <div className="border-t-2 border-gray-200 border-solid">
        <div className="text-sm text-gray-400 py-4">
          <span className="">Tags:</span>
          {tags.map((tag) => (
            <React.Fragment key={tag.url().path()}>
              {" "}
              <Link
                href={tag.url().path()}
                className="underline"
              >{`${tag.name()}`}</Link>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="markdown">
        <ul>
          {relatedItems.map((post) => (
            <li key={post.slug()}>
              <Link href={post.url().path()}>{post.title()}</Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function related(self: Listable, first: number): Listable[] {
  const ownTags = self.tagSet().tagNames();
  // For plural tags we can't use proper interpolation. So we filter out any
  // non-alphabetic tags as a security precaution.
  const validTags = ownTags.filter((tag) => {
    const isValid = tag.match(/^[a-zA-Z0-9]+$/);
    if (!isValid) {
      console.warn(`Invalid tag name: "${tag}"`);
    }
    return isValid;
  });
  const queryFragment =
    validTags.length > 0
      ? validTags.map((tag) => `(instr(tags, '${tag}') > 0)`).join(" + ")
      : "1"; // Fallback to 1 to ensure valid SQL

  const query = sql`
    SELECT
      page_type,
      slug,
      title,
      summary,
      tags,
      content,
      DATE,
      summary_image_path,
      feed_id,
      page_rank,
      (${queryFragment}) AS tag_match_count
    FROM
      search_index
    WHERE
      feed_id != :feedId
    ORDER BY
      tag_match_count DESC,
      page_rank DESC
    LIMIT
      :first;
  `;
  const rows = db
    .prepare<{ first: number; feedId: string }, SearchIndexRow>(query)
    .all({ first, feedId: self.feedId() });
  return rows.map((item) => new Data.ListableSearchRow(item));
}
