import Link from "next/link";
import DateString from "./DateString.js";
import { Listable } from "../data/interfaces.js";

type Props = {
  item: Listable;
};

export default function ListItem({ item }: Props) {
  const summary = item.summary == null ? undefined : item.summary();
  return (
    <div className="py-4 flex justify-between">
      <div>
        <div className="italic text-sm text-gray-400 flex">
          <DateString date={new Date(item.date())} />
        </div>
        <h2 className="font-large font-semibold">
          <Link
            href={item.url()}
            style={{
              wordBreak: "break-word",
              /* Adds a hyphen where the word breaks, if supported (No Blink) */
              hyphens: "auto",
            }}
          >
            {item.title()}
          </Link>
        </h2>
        {summary ? <p>{summary}</p> : null}
      </div>
    </div>
  );
}
