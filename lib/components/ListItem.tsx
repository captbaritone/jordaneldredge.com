import Image from "next/image";
import Link from "next/link";
import DateString from "./DateString";
import { Content } from "../data";

type Props = {
  item: Content;
};

export default function ListItem({ item }: Props) {
  const summary = item.summary == null ? undefined : item.summary();
  const summaryImage = item.summaryImage();
  return (
    <>
      <div className="my-4 flex justify-between gap-4">
        <div>
          <h2 className="font-large font-semibold">
            <Link
              href={item.url().path()}
              style={{
                wordBreak: "break-word",
                /* Adds a hyphen where the word breaks, if supported (No Blink) */
                hyphens: "auto",
              }}
            >
              {item.title()}
            </Link>
          </h2>
          <span className="italic inline text-sm my-1 text-gray-400 flex">
            <DateString date={item.dateObj()} />
          </span>
          {summary ? <p>{summary}</p> : null}
        </div>
        {summaryImage ? (
          <div className="h-24 md:h-32 aspect-video relative">
            <Link href={item.url().path()}>
              <Image alt="" fill src={summaryImage} className="object-cover" />
            </Link>
          </div>
        ) : null}
      </div>
      <hr />
    </>
  );
}
