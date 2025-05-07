import Link from "next/link";
import ListItem from "../../../lib/components/ListItem";
import { ContentConnection } from "../../../lib/data";
import { ALL } from "../../config";
import { PostsStructured } from "../posts/page";

export const metadata = {
  title: "Blog",
  twitter: { title: "Blog" },
};

export default function Home() {
  if (ALL) {
    return <PostsStructured q={"is:blog"} sort="latest" />;
  }
  const allPosts = ContentConnection.blogPosts();

  return (
    <>
      <div className="markdown">
        <h1>Blog</h1>
        <p>
          Formal write-ups of projects and ideas. For quick thoughts,
          observations, and links see <Link href="/notes">Notes</Link>.
        </p>
        <hr />
      </div>
      {allPosts.map((post) => {
        return <ListItem key={post.slug()} item={post} />;
      })}
    </>
  );
}
