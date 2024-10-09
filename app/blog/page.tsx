import Link from "next/link";
import ListItem from "../../lib/components/ListItem";
import { blogPosts, getDb } from "../../lib/search";

export const metadata = {
  title: "Blog",
  twitter: { title: "Blog" },
};

export default async function Home() {
  const allPosts = await blogPosts();

  const publicPosts = allPosts.filter((post) => post.showInLists());

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
      {publicPosts.map((post) => {
        return <ListItem key={post.slug()} item={post} />;
      })}
    </>
  );
}
