import Markdown from "../../../lib/components/Markdown";
import { getTilPage } from "../notion";
import markdownToHtml from "../../../lib/markdownToHtml";
import DateString from "../../../lib/components/DateString";

export default async function Note({ params }) {
  const page = await getTilPage(params.slug);

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
      <Markdown {...content} />
    </div>
  );
}
