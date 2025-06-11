import Image from "next/image";
import Link from "next/link";
import DateString from "./DateString";
import { Content } from "../data";
import {
  ContentDateViewTransition,
  ContentSummaryImageViewTransition,
  ContentTileViewTransition,
  ContentViewTransition,
} from "./ViewTransitions";

type ContentProps = {
  item: Content;
};

export default function ContentListItem({ item }: ContentProps) {
  const summary = item.summary == null ? undefined : item.summary();
  const summaryImage = item.summaryImage();
  return (
    <ContentViewTransition id={item.id()}>
      <ListItem
        summaryImage={summaryImage}
        title={item.title()}
        id={item.id()}
        url={item.url().path()}
        summary={summary}
        date={item.dateObj()}
      >
        {summary ? <p>{summary}</p> : null}
      </ListItem>
    </ContentViewTransition>
  );
}

type Props = React.PropsWithChildren<{
  id?: string;
  summaryImage: string | undefined;
  title: string;
  summary?: string;
  url: string;
  date?: Date;
}>;

export function ListItem({
  id,
  children,
  summaryImage,
  title,
  url,
  summary,
  date,
}: Props) {
  return (
    <>
      <div className="py-4 flex justify-between gap-4">
        <div>
          <ContentTileViewTransition id={id}>
            <h2 className="font-large font-semibold">
              <Link
                href={url}
                style={{
                  wordBreak: "break-word",
                  /* Adds a hyphen where the word breaks, if supported (No Blink) */
                  hyphens: "auto",
                }}
              >
                {title}
              </Link>
            </h2>
          </ContentTileViewTransition>
          {date && (
            <ContentDateViewTransition id={id}>
              <span className="italic text-sm my-1 text-gray-400">
                <DateString date={date} />
              </span>
            </ContentDateViewTransition>
          )}
          {children}
        </div>
        {summaryImage ? (
          <Link href={url}>
            <span className="h-28 md:h-32 aspect-square sm:aspect-video relative block">
              <ContentSummaryImageViewTransition id={summaryImage}>
                <Image
                  alt=""
                  fill
                  style={{
                    boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.4)",
                  }}
                  sizes="(max-width: 768px) 171px, 228px"
                  src={summaryImage}
                  className="object-cover shadow-sm"
                />
              </ContentSummaryImageViewTransition>
            </span>
          </Link>
        ) : null}
      </div>
      <hr />
    </>
  );
}
