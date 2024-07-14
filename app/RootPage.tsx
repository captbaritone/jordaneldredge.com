import { getPageBySlug } from "../lib/data";
import Markdown from "../lib/components/Markdown";

export default async function Page({ slug }) {
  const page = getPageBySlug(slug);
  const ast = await page.content().ast();
  return (
    <div className="markdown">
      <h1>{page.title()}</h1>
      <Markdown ast={ast} />
    </div>
  );
}
