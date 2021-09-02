import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { getAllPages, getPageBySlug } from "../lib/api";
import markdownToHtml from "../lib/markdownToHtml";
import Layout from "../lib/components/Layout";
import Markdown from "../lib/components/Markdown";

export default function Page({ page }) {
  const router = useRouter();
  if (!router.isFallback && !page) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout title={page.title}>
      <div className="markdown">
        <h1>{page.title}</h1>
        <Markdown {...page.content} />
      </div>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const page = getPageBySlug(params.slug, ["title", "slug", "content"]);
  const content = await markdownToHtml(page.content || "");

  return {
    props: {
      page: {
        ...page,
        content,
      },
    },
  };
}

export async function getStaticPaths() {
  const posts = getAllPages(["slug"]);

  return {
    paths: posts
      // About is special and used as the root.
      .filter((post) => post.slug != "about")
      .map((post) => {
        return {
          params: {
            slug: post.slug,
          },
        };
      }),
    fallback: false,
  };
}
