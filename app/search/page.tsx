import SearchInput from "./searchInput";
import * as Search from "../../lib/search";
import ListItem from "../../lib/components/ListItem";

export function generateMetadata({ searchParams }) {
  const title = searchParams.q ? `Search: "${searchParams.q}"` : "Search";
  return { title };
}

export default function SearchComponent({ searchParams }) {
  const query = searchParams.q || "";

  return (
    <div className="has-[[data-pending]]:animate-pulse">
      <SearchInput query={query} />
      <Results query={query} />
    </div>
  );
}

function Results({ query }) {
  if (query === "") {
    return <ResultAlternative>Enter a search query above</ResultAlternative>;
  }
  const listable = Search.search(query);
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
