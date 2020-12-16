import Head from "next/head";
import * as Api from "../../lib/api";
import Link from "next/link";

const dateFormater = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

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
              <span>{dateFormater.format(new Date(post.date))}</span>
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
    "date",
  ]);

  return {
    props: { allPosts: allPosts.filter((postInfo) => !postInfo.archive) },
  };
}
