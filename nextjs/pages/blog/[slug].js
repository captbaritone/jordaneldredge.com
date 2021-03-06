import { useRouter } from "next/router";
import ErrorPage from "next/error";
import * as Api from "../../lib/api";
import markdownToHtml from "../../lib/markdownToHtml";
import Layout from "../../lib/components/Layout";
import GitHubComments from "../../lib/components/GitHubComments";
import Head from "next/head";

/*
{% if page.summary_image %}
{% elsif page.youtube_slug %}
    <meta property="og:image" content="https://i.ytimg.com/vi/{{ page.youtube_slug }}/maxresdefault.jpg">
    <meta name="twitter:image" content="https://i.ytimg.com/vi/{{ page.youtube_slug }}/maxresdefault.jpg">
{% else %}
    <meta property="og:image" content="{{ "/images/jordan_eldredge.jpg" | prepend: side.baseurl | prepend: site.url }}">
{% endif %}

{% if page.youtube_slug %}
    <meta name="twitter:card" content="player">
    <meta name="twitter:image" content="https://i.ytimg.com/vi/{{ page.youtube_slug }}/hqdefault.jpg">
    <meta name="twitter:title" content="{% if page.title %}{{ page.title | escape }}{% else %}{{ site.title }}{% endif %}">
    <meta name="twitter:app:name:iphone" content="YouTube">
    <meta name="twitter:app:id:iphone" content="544007664">
    <meta name="twitter:app:name:ipad" content="YouTube">
    <meta name="twitter:app:id:ipad" content="544007664">
    <meta name="twitter:app:url:iphone" content="vnd.youtube://www.youtube.com/watch?v={{ page.youtube_slug }}&amp;feature=applinks">
    <meta name="twitter:app:url:ipad" content="vnd.youtube://www.youtube.com/watch?v={{ page.youtube_slug }}&amp;feature=applinks">
    <meta name="twitter:app:name:googleplay" content="YouTube">
    <meta name="twitter:app:id:googleplay" content="com.google.android.youtube">
    <meta name="twitter:app:url:googleplay" content="https://www.youtube.com/watch?v={{ page.youtube_slug }}">
    <meta name="twitter:player" content="https://www.youtube.com/embed/{{ page.youtube_slug }}">
    <meta name="twitter:player:width" content="1280">
    <meta name="twitter:player:height" content="720">
{% else %}
    <meta name="twitter:card" content="summary">
{% endif %}
*/

export default function Post({ post }) {
  const router = useRouter();
  if (!router.isFallback && !post) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout title={post.title}>
      <Head>
        <meta property="og:type" content="article" />
        {post.summary_image && (
          <meta property="og:image" content={post.summary_image} />
        )}
      </Head>
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
    "summary_image",
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
