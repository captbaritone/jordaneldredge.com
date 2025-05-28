import React from "react";
import Link from "next/link";
import * as Data from "../data";

type Props = {
  item: Data.Content;
};

export default async function RelatedContent({ item }: Props) {
  const tags = item.tagSet().tags();
  if (!tags || tags.length === 0) {
    return null;
  }
  const relatedItems = item.related(3);
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
                href={{ pathname: tag.url().path() }}
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
              <Link href={{ pathname: post.url().path() }}>{post.title()}</Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
