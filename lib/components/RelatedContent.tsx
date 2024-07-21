import React from "react";
import Link from "next/link.js";
import { Listable } from "../data/interfaces";
import { getAllNotes, getAllPosts } from "../data";

type Props = {
  item: Listable;
};

export default async function RelatedContent({ item }: Props) {
  const tags = item.tagSet().tags();
  if (!tags || tags.length === 0) {
    return null;
  }
  const relatedItems = await related(item, 3);
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
  const allPosts = getAllPosts().filter((post) => post.showInLists());
  const allNotes = await getAllNotes();

  const items = [...allPosts, ...allNotes];

  const ownTags = self.tagSet().tagNames();
  const urlPath = self.url().path();

  const otherItems = items.filter((post) => {
    return post.url().path() !== urlPath;
  });

  return otherItems
    .map((post) => {
      const otherTags = post.tagSet().tagNames();
      const intersection = otherTags.filter((tag) =>
        ownTags.includes(tag)
      ).length;

      const union = new Set([...ownTags, ...otherTags]).size;

      return { overlap: intersection / union, post };
    })
    .filter((post) => post.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, first)
    .map((post) => post.post);
}
