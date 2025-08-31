import Markdown from "../lib/components/Markdown";

export default async function Page({ page }) {
  const ast = await page.content().ast();
  return (
    <article>
      <div className="markdown">
        <h1>{page.title()}</h1>
        <Markdown ast={ast} />
      </div>
    </article>
  );
}
