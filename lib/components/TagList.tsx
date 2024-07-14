import Link from "next/link.js";
import { Tag } from "../data/Tag";

type Props = {
  tags: Tag[] | null;
};

export default function TagList({ tags }: Props) {
  if (!tags || tags.length === 0) {
    return null;
  }
  return (
    <div className="text-sm text-gray-400 py-4 border-t-2 border-gray-200 border-solid">
      <span className="">Tags:</span>
      {tags.map((tag) => (
        <>
          {" "}
          <Link href={tag.url()} className="underline">{`${tag.name()}`}</Link>
        </>
      ))}
    </div>
  );
}
