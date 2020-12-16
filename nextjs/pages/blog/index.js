import Head from "next/head";
import * as Api from "../../lib/api";
import Link from "next/link";

export default function Home({ allPosts }) {
  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {allPosts.map((post) => {
          return (
            <div key={post.slug}>
              <h2>
                <Link as={`/blog/${post.slug}`} href="/blog/[slug]">
                  {post.title}
                </Link>
                <p>{post.summary}</p>
              </h2>
            </div>
          );
        })}
      </main>

      <footer></footer>
    </div>
  );
}

export async function getStaticProps() {
  const allPosts = await Api.getAllPosts([
    "title",
    "slug",
    "summary",
    "archive",
  ]);

  return {
    props: { allPosts: allPosts.filter((postInfo) => !postInfo.archive) },
  };
}
