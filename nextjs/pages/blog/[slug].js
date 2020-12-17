import { useRouter } from "next/router";
import ErrorPage from "next/error";
import * as Api from "../../lib/api";
import markdownToHtml from "../../lib/markdownToHtml";
import Layout from "../../lib/components/Layout";

export default function Post({ post }) {
  const router = useRouter();
  if (!router.isFallback && !post) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout title={post.title}>
      <div className="markdown">
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const post = await Api.getPostBySlug(params.slug, [
    "title",
    "slug",
    "content",
  ]);
  const content = await markdownToHtml(post.content || "");

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  };
}

export async function getStaticPaths() {
  const posts = await Api.getAllPosts(["slug"]);

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
}
