import { PostsStructured } from "../posts/page";

export async function generateMetadata(props) {
  const searchParams = await props.searchParams;
  const title = searchParams.q ? `Search: "${searchParams.q}"` : "Search";
  return { title };
}

export default async function SearchComponent(props) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const sort = searchParams.sort || "best";
  return (
    <PostsStructured
      q={query}
      sort={sort}
      title="Search"
      description="Search all blog posts and notes."
      first={20}
    />
  );
}
