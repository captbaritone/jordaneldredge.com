import Link from "next/link";
import DateString from "./DateString";
import TagLink from "./TagLink";
import Image from "next/image.js";

const SHOW_IMAGES = false;

export default function BlogPostListItem({ post }) {
  return (
    <div className="py-4 flex justify-between">
      <div>
        <div className="italic text-sm text-gray-400 flex">
          <DateString date={new Date(post.date)} />
        </div>
        <h2 className="font-large font-semibold">
          <Link
            href={`/blog/${post.slug}`}
            style={{
              wordBreak: "break-word",
              /* Adds a hyphen where the word breaks, if supported (No Blink) */
              hyphens: "auto",
            }}
          >
            {post.title}
          </Link>
        </h2>
        <p>{post.summary}</p>
      </div>
      {post.summary_image && SHOW_IMAGES ? (
        <Image
          width={100}
          height={100}
          alt={`Header image for a post titled "${post.title}."`}
          src={post.summary_image}
          className="rounded h-20 ml-6 mt-6 ring-gray-400 shadow-inner-md"
        />
      ) : (
        <div />
      )}
    </div>
  );
}
