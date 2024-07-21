import Markdown from "../../../lib/components/Markdown";
import * as Data from "../../../lib/data";
import DateString from "../../../lib/components/DateString";
import { Metadata } from "next";
import RelatedContent from "../../../lib/components/RelatedContent";

// https://beta.nextjs.org/docs/data-fetching/caching#segment-level-caching
export const revalidate = 600;
export const dynamic = "force-static";

export async function generateMetadata({ params }): Promise<Metadata> {
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
  const note = await Data.getNoteBySlug(params.slug);
  const content = await note.content();
  const ast = await content.ast();

  return (
    <article>
      <div className="markdown">
        <h1>{note.title()}</h1>
        <div
          className="italic text-sm text-gray-400"
          style={{
            marginTop: "-1.4rem",
            marginBottom: "1rem",
          }}
        >
          <DateString date={new Date(note.date())} />
        </div>
        <Markdown ast={ast} options={{ expandYoutube: true }} />
      </div>
      <RelatedContent item={note} />
    </article>
  );
}
