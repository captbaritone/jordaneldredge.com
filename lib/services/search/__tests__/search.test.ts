import "dotenv/config";

import { expect, test } from "vitest";
import { compile as _compile } from "../Compiler";
import { db } from "../../../db";

function compile(queryString: string) {
  const query = _compile(queryString);
  const stmt = db.prepare(query.query);
  stmt.bind(query.wildcards);
  return query;
}

test("compiler", () => {
  expect(compile("winamp")).toMatchInlineSnapshot(`
    {
      "query": "SELECT content.*
    FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE content_fts MATCH ('{title content tags summary}:' || :param0 || '*')",
      "wildcards": {
        "param0": ""winamp"",
      },
    }
  `);
  expect(compile("Hello, world!")).toMatchInlineSnapshot(
    `
    {
      "query": "SELECT content.*
    FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE content_fts MATCH ('{title content tags summary}:' || :param0 || '*')",
      "wildcards": {
        "param0": ""Hello," "world!"",
      },
    }
  `,
  );
  expect(compile(`"Hello World"`)).toMatchInlineSnapshot(
    `
    {
      "query": "SELECT content.*
    FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE content_fts MATCH ('{title content tags summary}:' || :param0 || '*')",
      "wildcards": {
        "param0": ""Hello" "World"",
      },
    }
  `,
  );
});

test("Quoted string", () => {
  expect(compile(`Hello \"World\"`)).toMatchInlineSnapshot(
    `
    {
      "query": "SELECT content.*
    FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE (content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
    AND content_fts MATCH ('{title content tags summary}:' || :param1 || '*'))",
      "wildcards": {
        "param0": ""Hello"",
        "param1": ""World"",
      },
    }
  `,
  );
});

test("Negate", () => {
  expect(compile(`Hello -has:video`)).toMatchInlineSnapshot(
    `
    {
      "query": "SELECT content.*
    FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE (content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
    AND NOT (EXISTS (SELECT 1 FROM content_youtube WHERE content_youtube.content_id = content.id)))",
      "wildcards": {
        "param0": ""Hello"",
      },
    }
  `,
  );
  expect(compile(`Hello -(has:video has:audio)`)).toMatchInlineSnapshot(
    `
    {
      "query": "SELECT content.*
    FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE (content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
    AND NOT ((EXISTS (SELECT 1 FROM content_youtube WHERE content_youtube.content_id = content.id)
    AND EXISTS (SELECT 1 FROM content_audio WHERE content_audio.content_id = content.id))))",
      "wildcards": {
        "param0": ""Hello"",
      },
    }
  `,
  );
  expect(compile(`--Hello`)).toMatchInlineSnapshot(`
    {
      "query": "SELECT content.*
    FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE NOT (NOT (content_fts MATCH ('{title content tags summary}:' || :param0 || '*')))",
      "wildcards": {
        "param0": ""Hello"",
      },
    }
  `);
});
