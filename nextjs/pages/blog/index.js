import * as Api from "../../lib/api";
import Link from "next/link";
import Layout from "../../lib/components/Layout";

const dateFormater = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export default function Home({ allPosts }) {
  return (
    <Layout title="Blog">
      {allPosts.map((post) => {
        return (
          <div key={post.slug} className="py-4">
            <div className="italic text-sm text-gray-400">
              {dateFormater.format(new Date(post.date))}
            </div>
            <h2 className="font-medium">
              <Link as={`/blog/${post.slug}`} href="/blog/[slug]">
                {post.title}
              </Link>
            </h2>
            <p>{post.summary}</p>
          </div>
        );
      })}
    </Layout>
  );
}

export async function getStaticProps() {
  const allPosts = await Api.getAllPosts([
    "title",
    "slug",
    "summary",
    "archive",
    "date",
    "draft",
  ]);

  return {
    props: {
      allPosts: allPosts.filter(
        (postInfo) => !postInfo.archive && !postInfo.draft
      ),
    },
  };
}
