"use client";

import { reindex } from "../../../../../lib/data/Indexable";

type Props = {
  slug: string;
};
export default function ReindexButton({ slug }: Props) {
  return (
    <button
      onClick={async () => {
        await reindex({ force: true, filter: slug });
        alert("Reindexed");
      }}
    >
      Reindex
    </button>
  );
}
