import ListItem from "../../../lib/components/ListItem";
import { ContentConnection } from "../../../lib/data";
import SortSelect from "./SortSelect";
import SearchInput from "./SearchInput";
import { SortOption } from "../../../lib/services/search/Compiler";
import Link from "next/link";
import KeyboardList from "../../../lib/components/KeyboardList";
import { ReactNode } from "react";

export async function generateMetadata(props) {
  const searchParams = await props.searchParams;
  const title = searchParams.q ? `Posts: "${searchParams.q}"` : "Posts";
  return { title, twitter: { title } };
}

export default async function Posts(props) {
  const searchParams = await props.searchParams;
  const sort: SortOption = searchParams.sort || "best";
  const q = (searchParams.q ?? "").toLowerCase();
  return <PostsStructured q={q} sort={sort} first={null} />;
}

type Props = {
  q?: string;
  sort: SortOption;
  title?: string;
  description?: ReactNode;
  hideSearch?: boolean;
  hideSort?: boolean;
  first: number | null;
};

export function PostsStructured({
  q,
  sort,
  title = "Posts",
  description = (
    <>
      All <Link href="/posts/?q=is:blog&sort=latest">Blogs Posts</Link> and{" "}
      <Link href="/posts/?q=is:note&sort=latest">Notes</Link>.
    </>
  ),
  hideSearch,
  hideSort,
  first,
}: Props) {
  const result = ContentConnection.searchResult(q ?? "", sort, first);
  const warnings = result.warnings.map((w) => w.message);

  return (
    <>
      <div className="markdown">
        <h1>{title}</h1>
        <div className="flex flex-wrap justify-end pb-2">
          <p className="w-full sm:w-auto grow">{description}</p>
          <div className="flex gap-2 items-stretch w-full sm:w-auto pb-2 sm:pb-0">
            {hideSearch || (
              <div className="w-auto flex-grow">
                <label>
                  <SearchInput
                    query={q ?? ""}
                    className="w-full"
                    autoFocus={q != null}
                    warnings={warnings}
                  />
                </label>
              </div>
            )}
            {hideSort || (
              <div className="w-auto">
                <label>
                  <SortSelect currentParam={sort} />
                </label>
              </div>
            )}
          </div>
        </div>
        <hr />
      </div>
      {result.value.length === 0 ? (
        <ResultAlternative>No results found</ResultAlternative>
      ) : hideSearch ? (
        result.value.map((post) => {
          return <ListItem key={post.slug()} item={post} />;
        })
      ) : (
        <KeyboardList>
          {result.value.map((post) => {
            const url = post.url().path();
            return {
              component: <ListItem key={post.slug()} item={post} />,
              key: url,
              url,
            };
          })}
        </KeyboardList>
      )}
    </>
  );
}

function ResultAlternative({ children }) {
  return <h2 className="text-center pb-4 text-gray-400">{children}</h2>;
}
