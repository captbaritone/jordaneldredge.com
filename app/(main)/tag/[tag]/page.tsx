import { notFound } from "next/navigation";
import ListItem from "../../../../lib/components/ListItem";
import { Tag } from "../../../../lib/data/Tag";

export async function generateMetadata(props) {
  const params = await props.params;
  const title = `Blog posts tagged "${params.tag}"`;
  return { title, twitter: { title } };
}

export const revalidate = 10;
export const dynamic = "force-static";

export default async function TagPage(props) {
  const params = await props.params;
  const tag = new Tag(params.tag);
  const items = tag.items();

  if (items.length === 0) {
    notFound();
  }

  return (
    <>
      <div className="markdown">
        <h1>{`Items tagged "${params.tag}"`}</h1>
        <hr />
      </div>
      {items.map((post) => {
        return <ListItem key={post.slug()} item={post} />;
      })}
    </>
  );
}
