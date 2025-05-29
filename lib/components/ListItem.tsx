import Image from "next/image";
import Link from "next/link";
import DateString from "./DateString";
import { Content } from "../data";
import { unstable_ViewTransition as ViewTransition } from "react";

type ContentProps = {
  item: Content;
};

export default function ContentListItem({ item }: ContentProps) {
  const summary = item.summary == null ? undefined : item.summary();
  const summaryImage = item.summaryImage();
  return (
    <ViewTransition name={`content-list-item-${item.id()}`}>
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
    </ViewTransition>
  );
}

type Props = React.PropsWithChildren<{
  id: string;
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
          <ViewTransition name={`content-title-${id}`}>
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
          </ViewTransition>
          {date && (
            <ViewTransition name={`content-date-${id}`}>
              <span className="italic text-sm my-1 text-gray-400 flex">
                <DateString date={date} />
              </span>
            </ViewTransition>
          )}
          {children}
        </div>
        {summaryImage ? (
          <Link href={url}>
            <span className="h-28 md:h-32 aspect-square sm:aspect-video relative block">
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
            </span>
          </Link>
        ) : null}
      </div>
      <hr />
    </>
  );
}
