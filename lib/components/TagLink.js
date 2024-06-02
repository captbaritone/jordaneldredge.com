import Link from "next/link";

export default function TagLink({ tag }) {
  return <Link href={`/blog/tag/${tag}`}>{`${tag}`}</Link>;
}
