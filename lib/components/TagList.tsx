import Link from "next/link";
import { TagSet } from "../data/TagSet";

type Props = {
  tagSet: TagSet;
};

export default function TagList({ tagSet }: Props) {
  const tags = tagSet.tags();
  return (
    <div className="border-t-2 border-gray-200 border-solid">
      <div className="text-sm text-gray-400 py-4">
        <span className="">Tags:</span>
        {tags.map((tag) => (
          <>
            {" "}
            <Link
              href={{ pathname: tag.url().path() }}
              className="underline"
            >{`${tag.name()}`}</Link>
          </>
        ))}
      </div>
    </div>
  );
}
