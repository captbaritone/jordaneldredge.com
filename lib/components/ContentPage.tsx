import Markdown from "./Markdown";
import * as Data from "../data";
import RelatedContent from "./RelatedContent";
import DateString from "./DateString";
import GitHubComments from "./GitHubComments";

type ContentPageProps = {
  item: Data.Content;
  issueId?: string;
};

export default async function ContentPage({ item, issueId }: ContentPageProps) {
  const content = await item.content();
  const ast = await content.ast();
  return (
    <div>
      <article>
        <div className="markdown">
          <h1>{item.title()}</h1>
          <div
            className="italic text-sm text-gray-400"
            style={{
              marginTop: "-1.4rem",
              marginBottom: "1rem",
            }}
          >
            <DateString date={new Date(item.date())} />
          </div>
          <Markdown ast={ast} />
        </div>
      </article>
      {issueId && <GitHubComments issue={issueId} />}
      <RelatedContent item={item} />
    </div>
  );
}
