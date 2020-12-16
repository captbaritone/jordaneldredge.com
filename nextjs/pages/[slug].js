import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { getAllPages, getPageBySlug } from "../lib/api";
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
  const posts = await getAllPages(["slug"]);

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
