import Markdown from "../../../lib/components/Markdown";
import * as Data from "../../../lib/data";
import DateString from "../../../lib/components/DateString";
import TagList from "../../../lib/components/TagList";

// https://beta.nextjs.org/docs/data-fetching/caching#segment-level-caching
export const revalidate = 600;

export async function generateMetadata({ params }) {
  // TODO: Figure out how to read search params in head.js
  const note = await Data.getNoteBySlug(params.slug);

  return {
    title: note.title(),
    description: note.summary() || note.title(),
    twitter: {
      title: note.title(),
      description: note.summary() || note.title(),
    },
    openGraph: {
      title: note.title(),
      description: note.summary() || note.title(),
      type: "article",
    },
  };
}

export default async function Note({ params }) {
  const page = await Data.getNoteBySlug(params.slug);

  const content = await page.content();
  const ast = await content.ast();
  const tags = page.tags();

  return (
    <>
      <div className="markdown">
        <h1>Note: {page.title()}</h1>
        <div
          className="italic text-sm text-gray-400"
          style={{
            marginTop: "-1.4rem",
            marginBottom: "1rem",
          }}
        >
          <DateString date={new Date(page.date())} />
        </div>
        <Markdown ast={ast} options={{ expandYoutube: true }} />
      </div>
      <TagList tags={tags} />
    </>
  );
}
