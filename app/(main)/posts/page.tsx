import ListItem from "../../../lib/components/ListItem";
import { ContentConnection } from "../../../lib/data";
import SortSelect from "./SortSelect";
import SearchInput from "./SearchInput";
import { SortOption } from "../../../lib/services/search/Compiler";

export function generateMetadata({ searchParams }) {
  const title = searchParams.q ? `Posts: "${searchParams.q}"` : "Posts";
  return { title, twitter: { title } };
}

export default async function Posts({ searchParams }) {
  const sort: SortOption = searchParams.sort || "best";
  const q = (searchParams.q ?? "").toLowerCase();
  const items = ContentConnection.search(q, sort);

  return (
    <>
      <div className="markdown">
        <h1>Posts</h1>
        <div className="flex flex-wrap justify-end pb-2">
          <p className="w-full sm:w-auto grow">
            All <a href="/posts/?q=is:blog&sort=latest">Blogs Posts</a> and{" "}
            <a href="/posts/?q=is:note&sort=latest">Notes</a>.
          </p>
          <div className="flex gap-2 items-stretch w-full sm:w-auto pb-2 sm:pb-0">
            <div className="w-auto flex-grow">
              <label>
                <SearchInput
                  query={searchParams.q ?? ""}
                  className="w-full"
                  autoFocus={searchParams.q != null}
                />
              </label>
            </div>
            <div className="w-auto">
              <label>
                <SortSelect currentParam={sort} />
              </label>
            </div>
          </div>
        </div>
        <hr />
      </div>
      {items.length === 0 ? (
        <ResultAlternative>No results found</ResultAlternative>
      ) : (
        items.map((post) => {
          return <ListItem key={post.slug()} item={post} />;
        })
      )}
    </>
  );
}

export async function PostsStructured({
  q,
  sort,
}: {
  q?: string;
  sort: SortOption;
}) {
  const items = ContentConnection.search(q ?? "", sort);

  return (
    <>
      <div className="markdown">
        <h1>Posts</h1>
        <div className="flex flex-wrap justify-end pb-2">
          <p className="w-full sm:w-auto grow">
            All <a href="/posts/?q=is:blog&sort=latest">Blogs Posts</a> and{" "}
            <a href="/posts/?q=is:note&sort=latest">Notes</a>.
          </p>
          <div className="flex gap-2 items-stretch w-full sm:w-auto pb-2 sm:pb-0">
            <div className="w-auto flex-grow">
              <label>
                <SearchInput
                  query={q ?? ""}
                  className="w-full"
                  autoFocus={q != null}
                />
              </label>
            </div>
            <div className="w-auto">
              <label>
                <SortSelect currentParam={sort} />
              </label>
            </div>
          </div>
        </div>
        <hr />
      </div>
      {items.length === 0 ? (
        <ResultAlternative>No results found</ResultAlternative>
      ) : (
        items.map((post) => {
          return <ListItem key={post.slug()} item={post} />;
        })
      )}
    </>
  );
}

function ResultAlternative({ children }) {
  return <h2 className="text-center pb-4 text-gray-400">{children}</h2>;
}
