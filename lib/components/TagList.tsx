import React from "react";
import Link from "next/link";
import { TagSet } from "../data/TagSet";

type Props = {
  tagSet: TagSet;
};

export default function TagList({ tagSet }: Props) {
  const tags = tagSet.tags();
  return (
    <div className="border-t border-ink">
      <div className="text-side text-ink/60 py-4">
        <span>Tags:</span>
        {tags.map((tag) => (
          <React.Fragment key={tag.url().path()}>
            {" "}
            <Link
              href={{ pathname: tag.url().path() }}
              className="text-link"
            >
              {tag.name()}
            </Link>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
