import SearchInput from "./searchInput";
import ListItem from "../../../lib/components/ListItem";
import { ContentConnection } from "../../../lib/data";
import KeyboardList from "../../../lib/components/KeyboardList";

export async function generateMetadata(props) {
  const searchParams = await props.searchParams;
  const title = searchParams.q ? `Search: "${searchParams.q}"` : "Search";
  return { title };
}

export default async function SearchComponent(props) {
  const searchParams = await props.searchParams;
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
  const listable = ContentConnection.search(query, "best");
  if (listable.length === 0) {
    return <ResultAlternative>No results found</ResultAlternative>;
  }
  return (
    <div>
      <KeyboardList key={query}>
        {listable.map((listable) => {
          const url = listable.url().path();
          return {
            component: <ListItem item={listable} />,
            key: url,
            url,
          };
        })}
      </KeyboardList>
    </div>
  );
}
function ResultAlternative({ children }) {
  return <h2 className="text-center pb-4 text-gray-400">{children}</h2>;
}
