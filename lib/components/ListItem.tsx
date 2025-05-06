import Image from "next/image";
import Link from "next/link";
import DateString from "./DateString";
import { Content } from "../data";

type ContentProps = {
  item: Content;
};

export default function ContentListItem({ item }: ContentProps) {
  const summary = item.summary == null ? undefined : item.summary();
  const summaryImage = item.summaryImage();
  return (
    <ListItem
      summaryImage={summaryImage}
      title={item.title()}
      url={item.url().path()}
      summary={summary}
      date={item.dateObj()}
    >
      {summary ? <p>{summary}</p> : null}
    </ListItem>
  );
}

type Props = React.PropsWithChildren<{
  summaryImage: string | undefined;
  title: string;
  summary?: string;
  url: string;
  date?: Date;
}>;

export function ListItem({
  children,
  summaryImage,
  title,
  url,
  summary,
  date,
}: Props) {
  return (
    <>
      <div className="my-4 flex justify-between gap-4">
        <div>
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
          {date && (
            <span className="italic text-sm my-1 text-gray-400 flex">
              <DateString date={date} />
            </span>
          )}
          {children}
        </div>
        {summaryImage ? (
          <div
            className="h-28 md:h-32 aspect-square sm:aspect-video relative"
            style={{
              boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.4)",
            }}
          >
            <Link href={url}>
              <Image
                alt=""
                fill
                sizes="(max-width: 768px) 171px, 228px"
                src={summaryImage}
                className="object-cover shadow-sm"
              />
            </Link>
          </div>
        ) : null}
      </div>
      <hr />
    </>
  );
}
