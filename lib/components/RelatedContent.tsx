import React from "react";
import Link from "next/link.js";
import { Listable } from "../data/interfaces";
import { SearchIndexRow } from "../search";
import * as Data from "../data";
import { db } from "../db";

type Props = {
  item: Listable;
};

export default async function RelatedContent({ item }: Props) {
  const tags = item.tagSet().tags();
  if (!tags || tags.length === 0) {
    return null;
  }
  const relatedItems = await related(item, 3);
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
  const urlPath = self.url().path();

  const content = db
    .prepare<[], SearchIndexRow>(
      `SELECT slug, page_type, tags, title, page_rank FROM search_index`
    )
    .all();

  const items: Listable[] = content
    .map((item) => {
      // TODO: Could we do this tag comparisons (or at least an initial filter)
      // in the DB? Probably not a big deal given the small number of posts, but
      // it's kinda silly doing it here.
      const otherTags = item.tags.split(" ");
      const intersection = otherTags.filter((tag) =>
        ownTags.includes(tag)
      ).length;

      const union = new Set([...ownTags, ...otherTags]).size;

      return { overlap: intersection / union, item };
    })
    .filter((post) => post.overlap > 0)
    .sort((a, b) => {
      const overlapDiff = b.overlap - a.overlap;
      if (overlapDiff !== 0) {
        return overlapDiff;
      }
      // Use page_rank to break a tie
      return b.item.page_rank - a.item.page_rank;
    })
    // Initial trim lets us only do the final path comparison on n+1 items.
    .slice(0, first + 1)
    .map(({ item }): Listable => {
      return new Data.ListableSearchRow(item);
    })
    .filter((item) => {
      return item.url().path() !== urlPath;
    })
    .slice(0, first);

  return items;
}
