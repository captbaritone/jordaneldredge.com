import { getPageBySlug } from "../lib/api";
import markdownToHtml from "../lib/markdownToHtml";
import Markdown from "../lib/components/Markdown";

export default async function Page({ slug }) {
  const page = getPageBySlug(slug, ["title", "slug", "content"]);
  const content = await markdownToHtml(page.content || "", false);
  return (
    <div className="markdown">
      <h1>{page.title}</h1>
      {<Markdown {...content} />}
    </div>
  );
}
