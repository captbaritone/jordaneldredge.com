import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { getPageBySlug } from "../lib/api";
import markdownToHtml from "../lib/markdownToHtml";
import Layout from "../lib/components/Layout";
import Markdown from "../lib/components/Markdown";

export default function Page({ page }) {
  const router = useRouter();
  if (!router.isFallback && !page) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout>
      <div className="markdown">
        <h1>{page.title}</h1>
        <Markdown {...page.content} />
      </div>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const page = getPageBySlug("about", ["title", "slug", "content"]);
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
