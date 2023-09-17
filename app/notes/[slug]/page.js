import Markdown from "../../../lib/components/Markdown";
import { getNotePage } from "../notion.mjs";
import markdownToHtml from "../../../lib/markdownToHtml";
import DateString from "../../../lib/components/DateString";

// https://beta.nextjs.org/docs/data-fetching/caching#segment-level-caching
export const revalidate = 600;

export async function generateMetadata({ params }) {
  // TODO: Figure out how to read search params in head.js
  const page = await getNotePage(params.slug);

  return {
    title: page.title,
    twitter: {
      title: page.title,
    },
  };
}

export default async function Note({ params }) {
  const page = await getNotePage(params.slug);

  const content = await markdownToHtml(page.markdown, true);

  return (
    <div className="markdown">
      <h1>Note: {page.title}</h1>
      <div
        className="italic text-sm text-gray-400"
        style={{
          marginTop: "-1.4rem",
          marginBottom: "1rem",
        }}
      >
        <DateString date={new Date(page.created_time)} />
      </div>
      <Markdown {...content} options={{ expandYoutube: true }} />
    </div>
  );
}
