import SearchInput from "./searchInput";
import * as Search from "../../lib/search";
import { Note, Post } from "../../lib/data";
import { Listable } from "../../lib/data/interfaces";
import ListItem from "../../lib/components/ListItem";

export async function generateMetadata({ searchParams }) {
  const title = searchParams.q ? `Search: "${searchParams.q}"` : "Search";
  return { title };
}

export default async function SearchComponent({ searchParams }) {
  const query = searchParams.q || "";

  return (
    <div className="has-[[data-pending]]:animate-pulse">
      <SearchInput query={query} />
      <Results query={query} />
    </div>
  );
}

async function Results({ query }) {
  const db = await Search.getDb();

  const matches = await Search.search(db, query);

  async function getItem(m): Promise<Listable | null> {
    switch (m.page_type) {
      case "post":
        const post = await Post.getPostBySlug(null, { slug: m.slug });
        if (!post.showInLists()) {
          return null;
        }
        return post;
      case "note":
        return Note.getNoteBySlug(null, { slug: m.slug });
      default:
        return null;
    }
  }

  const maybeListable = await Promise.all(matches.map(getItem));
  const listable = maybeListable.filter((x) => x !== null) as Listable[];

  if (query === "") {
    return <ResultAlternative>Enter a search query above</ResultAlternative>;
  }
  if (listable.length === 0) {
    return <ResultAlternative>No results found</ResultAlternative>;
  }
  return (
    <div>
      {listable.map((listable) => {
        return <ListItem key={listable.url().path()} item={listable} />;
      })}
    </div>
  );
}
function ResultAlternative({ children }) {
  return <h2 className="text-center pb-4 text-gray-400">{children}</h2>;
}
