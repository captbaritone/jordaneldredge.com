import Image from "next/image";
import Link from "next/link";
import DateString from "./DateString";
import { Content } from "../data";
import {
  ContentDateViewTransition,
  ImageViewTransition,
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
        isDraft={item.isDraft()}
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
  isDraft: boolean;
}>;

export function ListItem({
  id,
  children,
  summaryImage,
  title,
  url,
  date,
  isDraft,
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
                {isDraft && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs not-italic">
                    Draft
                  </span>
                )}
              </span>
            </ContentDateViewTransition>
          )}
          {children}
        </div>
        {summaryImage ? (
          <Link href={url}>
            <span className="h-28 md:h-32 aspect-square sm:aspect-video relative block">
              <ImageViewTransition id={summaryImage}>
                <Image
                  priority={true}
                  alt=""
                  fill
                  style={{
                    boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.4)",
                  }}
                  sizes="(max-width: 768px) 171px, 228px"
                  src={summaryImage}
                  className="object-cover shadow-sm"
                />
              </ImageViewTransition>
            </span>
          </Link>
        ) : null}
      </div>
      <hr />
    </>
  );
}
