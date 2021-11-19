import * as Api from "../../lib/api";
import Link from "next/link";
import Layout from "../../lib/components/Layout";
import DateString from "../../lib/components/DateString";

const SHOW_IMAGES = false;

export default function Home({ allPosts }) {
  return (
    <Layout title="Blog">
      {allPosts.map((post) => {
        return (
          <div key={post.slug} className="py-4 flex justify-between">
            <div>
              <div className="italic text-sm text-gray-400">
                <DateString date={new Date(post.date)} />
              </div>
              <h2 className="font-medium">
                <Link as={`/blog/${post.slug}`} href="/blog/[slug]">
                  {post.title}
                </Link>
              </h2>
              <p>{post.summary}</p>
            </div>
            {post.summary_image && SHOW_IMAGES ? (
              <img
                width={100}
                height={100}
                src={post.summary_image}
                className="rounded h-20 ml-6 mt-6 ring-gray-400 shadow-inner-md"
              />
            ) : (
              <div />
            )}
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
    "summary_image",
  ]);

  return {
    props: {
      allPosts: allPosts.filter(
        (postInfo) => !postInfo.archive && !postInfo.draft
      ),
    },
  };
}
