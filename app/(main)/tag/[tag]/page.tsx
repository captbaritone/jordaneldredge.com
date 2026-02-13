import { notFound } from "next/navigation";
import ListItem from "../../../../lib/components/ListItem";
import { Tag } from "../../../../lib/data/Tag";
import { Metadata } from "next";
import { VC } from "../../../../lib/VC";

export async function generateMetadata(props): Promise<Metadata> {
  const params = await props.params;
  const title = `Blog posts tagged "${params.tag}"`;
  const description = `Browse all posts and notes tagged with "${params.tag}" by Jordan Eldredge.`;
  return {
    title,
    description,
    twitter: { title },
    openGraph: {
      url: `https://jordaneldredge.com/tag/${params.tag}/`,
    },
    alternates: {
      canonical: `https://jordaneldredge.com/tag/${params.tag}/`,
    },
  };
}

export const revalidate = 10;
export const dynamic = "force-static";

export default async function TagPage(props) {
  const vc = await VC.create();
  const params = await props.params;
  const tag = new Tag(params.tag);
  const items = tag.items(vc);

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
