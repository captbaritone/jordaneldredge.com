import { notFound } from "next/navigation";
import ListItem from "../../../lib/components/ListItem";
import { ContentConnection } from "../../../lib/data";
import { userIsAdmin } from "../../../lib/session";
import SortSelect from "./SortSelect";

export function generateMetadata({ params }) {
  const title = `All Posts`;
  return { title, twitter: { title } };
}

export const revalidate = 10;
export const dynamic = "force-static";

export default async function All({ searchParams }) {
  if (!(await userIsAdmin())) {
    notFound();
  }
  const sort: "best" | "latest" = searchParams.sort || "best";
  const items = ContentConnection.all({ sort, filters: [] });

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
