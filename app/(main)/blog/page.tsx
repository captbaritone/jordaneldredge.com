import Link from "next/link";
import { PostsStructured } from "../posts/page";

export const metadata = {
  title: "Blog",
  twitter: { title: "Blog" },
};

export default async function Home(props) {
  const searchParams = await props.searchParams;
  const sort = searchParams.sort || "latest";
  return (
    <PostsStructured
      title="Blog"
      description={
        <>
          Formal write-ups of projects and ideas. For quick thoughts,
          observations, and links see <Link href="/notes">Notes</Link>.
        </>
      }
      q={"is:blog"}
      sort={sort}
      hideSearch={true}
      hideSort={true}
      first={null}
    />
  );
}
