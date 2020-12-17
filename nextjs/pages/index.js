import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { getPageBySlug } from "../lib/api";
import markdownToHtml from "../lib/markdownToHtml";

export default function Page({ page }) {
  const router = useRouter();
  if (!router.isFallback && !page) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <>
      <div>
        <h1>{page.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    </>
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
