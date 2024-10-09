import React from "react";
import Link from "next/link.js";
import { Listable } from "../data/interfaces";
import { getDb, SearchIndexRow } from "../search";
import * as Data from "../data";

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

async function related(self: Listable, first: number): Promise<Listable[]> {
  const ownTags = self.tagSet().tagNames();
  const urlPath = self.url().path();

  const db = await getDb();

  const content: SearchIndexRow[] = await db.all(`
    SELECT slug, page_type, tags, title FROM search_index`);

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
    .sort((a, b) => b.overlap - a.overlap)
    .map(({ item }): Listable => {
      return new Data.ListableSearchRow(item);
    })
    // Initial trim lets us only do the final path comparison on n+1 items.
    .slice(0, first + 1)
    .filter((item) => {
      return item.url().path() !== urlPath;
    })
    .slice(0, first);

  return items;
}
