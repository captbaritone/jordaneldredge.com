import { notFound } from "next/navigation";
import { parse, syntaxHighlighting } from "../../../../lib/data/markdownUtils";
import { db, sql } from "../../../../lib/db";
import Markdown from "../../../../lib/components/Markdown";
import Link from "next/link";
import { userIsAdmin } from "../../../../lib/session";

export function metadata() {
  return {
    title: `Paste`,
    description: "Paste",
  };
}

export default async function Paste({ params }) {
  const paste = GET_PASTE.get({ slug: params.slug });
  if (paste == null) {
    notFound();
  }

  const isAdmin = await userIsAdmin();

  return (
    <div className="markdown">
      <div className="flex justify-end pt-2 pr-4 gap-1">
        <Link href={{ pathname: `/paste/${paste.id}/${paste.file_name}` }}>
          Raw
        </Link>
        {isAdmin && (
          <>
            {" | "}
            <Link href={{ pathname: `/paste/${paste.id}/${paste.file_name}` }}>
              Edit
            </Link>
          </>
        )}
      </div>
      <div className="max-w-2xl mx-auto p-5 -mt-4">
        <Content paste={paste} />
      </div>
    </div>
  );
}

async function Content({ paste }) {
  if (paste.file_name && paste.file_name.endsWith(".md")) {
    const ast = parse(paste.content);

    await syntaxHighlighting(ast);

    return <Markdown ast={ast} />;
  }
  return <pre>{paste.content}</pre>;
}

const GET_PASTE = db.prepare<
  { slug: string },
  { content: string; file_name?: string; id: number }
>(sql`
  SELECT
    id,
    content,
    file_name
  FROM
    pastes
  WHERE
    id = :slug
`);
