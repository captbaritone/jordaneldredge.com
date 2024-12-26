import ListItem from "../../lib/components/ListItem";
import Content from "../../lib/data/Content";
import SortSelect from "./SortSelect";

export function generateMetadata({ params }) {
  const title = `All Posts`;
  return { title, twitter: { title } };
}

export const revalidate = 10;
export const dynamic = "force-static";

export default function All({ searchParams }) {
  const sort: "best" | "latest" = searchParams.sort || "best";
  const items = Content.all({ sort, filters: [] });

  if (items.length === 0) {
    // TODO: 404?
  }

  return (
    <>
      <div className="markdown">
        <h1>All Posts</h1>
        <div className="flex justify-between">
          <p>All Blogs Posts and Notes.</p>
          <div>
            <label>
              Sort:
              <SortSelect currentParam={sort} />
            </label>
          </div>
        </div>
        <hr />
      </div>
      {items.map((post) => {
        return <ListItem key={post.slug()} item={post} />;
      })}
    </>
  );
}
