import * as Data from "../../lib/data/data";
import Link from "next/link";
import ListItem from "../../lib/components/ListItem";

export const metadata = {
  title: "Blog",
  twitter: {
    title: "Blog",
  },
};

const BEST_OF_SLUGS = new Set([
  "grats",
  "interesting-bugs-caught-by-eslints-no-constant-binary-expression",
  "speeding-up-winamps-music-visualizer-with-webassembly",
  "winamp-skin-musuem",
  "this-software-is-punk-rock",
]);

export default async function Home() {
  const allPosts = Data.getAllPosts();

  const publicPosts = allPosts.filter((post) => post.showInLists());

  const bestOf = publicPosts.filter((post) => BEST_OF_SLUGS.has(post.slug()));

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
      {/*
      {bestOf.map((post) => {
        return <ListItem key={post.slug()} item={post} />;
      })}
      <hr />
      */}
      {publicPosts.map((post) => {
        return <ListItem key={post.slug()} item={post} />;
      })}
    </>
  );
}
