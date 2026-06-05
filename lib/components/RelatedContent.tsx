import Link from "next/link";
import * as Data from "../data";
import { ContentTileViewTransition } from "./ViewTransitions";
import TagList from "./TagList";

type Props = {
  item: Data.Content;
};

export default async function RelatedContent({ item }: Props) {
  const tags = item.tagSet().tags();
  if (!tags || tags.length === 0) {
    return null;
  }
  const relatedItems = item.related(3);
  if (relatedItems.length === 0) {
    return null;
  }
  return (
    <>
      <TagList tagSet={item.tagSet()} />
      <div className="markdown">
        <ul>
          {relatedItems.map((post) => (
            <li key={post.slug()}>
              <ContentTileViewTransition id={post.id()}>
                <Link href={{ pathname: post.url().path() }}>
                  {post.title()}
                </Link>
              </ContentTileViewTransition>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
