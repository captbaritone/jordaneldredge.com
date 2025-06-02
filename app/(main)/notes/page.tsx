import Link from "next/link";
import { PostsStructured } from "../posts/page";

export const metadata = {
  title: "Notes",
  twitter: {
    title: "Notes",
  },
};

export default async function Notes(props) {
  const searchParams = await props.searchParams;
  const sort = searchParams.sort || "latest";
  return (
    <PostsStructured
      title="Blog"
      description={
        <>
          Quick thoughts, observations, and links. For more formal writing see{" "}
          <Link href="/blog">Blog</Link>.
        </>
      }
      q={"is:note"}
      sort={sort}
      hideSearch={true}
      hideSort={true}
      first={null}
    />
  );
}
