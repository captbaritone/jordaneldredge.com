import { useRouter } from "next/router";
import ErrorPage from "next/error";
import * as Api from "../../lib/api";
import markdownToHtml from "../../lib/markdownToHtml";
import Layout from "../../lib/components/Layout";
import GitHubComments from "../../lib/components/GitHubComments";

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
      {post.github_comments_issue_id && (
        <GitHubComments issue={post.github_comments_issue_id} />
      )}
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const post = await Api.getPostBySlug(params.slug, [
    "title",
    "slug",
    "content",
    "github_comments_issue_id",
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
