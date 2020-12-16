import { useRouter } from "next/router";
import ErrorPage from "next/error";
import * as Api from "../../lib/api";
import markdownToHtml from "../../lib/markdownToHtml";
import Head from "next/head";

export default function Post({ slug, post, morePosts, preview }) {
  const router = useRouter();
  if (!router.isFallback && !post) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <>
      <Head>
        <link
          href="https://unpkg.com/prismjs@0.0.1/themes/prism-tomorrow.css"
          rel="stylesheet"
        />
      </Head>
      <div>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </>
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
