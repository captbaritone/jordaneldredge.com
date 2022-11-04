import Markdown from "../../../lib/components/Markdown";
import { getNotePage, TEN_MINUTES_IN_MS } from "../notion";
import markdownToHtml from "../../../lib/markdownToHtml";
import DateString from "../../../lib/components/DateString";

export default async function Note({ params, searchParams }) {
  const page = await getNotePage(searchParams.bust ? 0 : TEN_MINUTES_IN_MS)(
    params.slug
  );

  const content = await markdownToHtml(page.markdown, false);

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
