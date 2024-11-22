import ListItem from "../../lib/components/ListItem";
import ListableSearchRow from "../../lib/data/ListableSearchRow";

export function generateMetadata({ params }) {
  const title = `All Posts`;
  return { title, twitter: { title } };
}

export const revalidate = 600;
export const dynamic = "force-static";

export default async function All({ params }) {
  const items = await ListableSearchRow.allItems();

  if (items.length === 0) {
    // TODO: 404?
  }

  return (
    <>
      <div className="markdown">
        <h1>All Posts</h1>
        <p>All Blogs posts and Notes with the best first.</p>
        <hr />
      </div>
      {items.map((post) => {
        return <ListItem key={post.slug()} item={post} />;
      })}
    </>
  );
}
