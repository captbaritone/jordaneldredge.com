import * as Api from "../../../lib/api.mjs";
import markdownToHtml from "../../../lib/markdownToHtml";
import GitHubComments from "../../../lib/components/GitHubComments";
import DateString from "../../../lib/components/DateString";
import Markdown from "../../../lib/components/Markdown";

function ErrorBoundary({ children }) {
  return children;
}

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

export function generateMetadata({ params }) {
  const post = Api.getPostBySlug(params.slug, [
    "title",
    "summary",
    "summary_image",
    "canonical_url",
  ]);
  return {
    title: post.title,
    description: post.summary || post.title,
    twitter: {
      title: post.title,
      description: post.summary || post.title,
    },
    openGraph: {
      image: post.summary_image || null,
      type: "article",
    },
    twitter: {
      image: post.summary_image || null,
      type: "article",
      description: post.summary || post.title,
    },
    alternates: {
      canonical: post.canonical_url || null,
    },
  };
}

export default async function Post({ params }) {
  const post = Api.getPostBySlug(params.slug, [
    "date",
    "title",
    "slug",
    "content",
    "github_comments_issue_id",
    "summary",
    "summary_image",
    "filename",
    "canonical_url",
  ]);

  const content = await markdownToHtml(post.content || "", true);
  const typeoLink = `https://github.com/captbaritone/jordaneldredge.com/blob/master/_posts/${post.filename}`;
  return (
    <>
      <div className="markdown">
        <h1>{post.title}</h1>
        <div
          className="italic text-sm text-gray-400"
          style={{
            marginTop: "-1.4rem",
            marginBottom: "1rem",
          }}
        >
          <DateString date={new Date(post.date)} />
        </div>
        <Markdown {...content} />
      </div>
      {post.github_comments_issue_id && (
        <ErrorBoundary fallback={null}>
          <GitHubComments issue={post.github_comments_issue_id} />
        </ErrorBoundary>
      )}
    </>
  );
}

/*
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

*/
