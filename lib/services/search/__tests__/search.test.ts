import "dotenv/config";

import { describe, expect, test } from "vitest";
import { compile as _compile } from "../Compiler";
import { db } from "../../../db";

function compile(queryString: string) {
  const query = _compile(queryString);
  const stmt = db.prepare(query.value.query);
  stmt.bind(query.value.wildcards);
  return query;
}

test("compiler", () => {
  expect(compile("winamp")).toMatchInlineSnapshot(`
    {
      "value": {
        "query": "SELECT content.*
    FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE content_fts MATCH ('{title content tags summary}:' || :param0 || '*')",
        "wildcards": {
          "param0": ""winamp"",
        },
      },
      "warnings": [],
    }
  `);
  expect(compile("Hello, world!")).toMatchInlineSnapshot(
    `
    {
      "value": {
        "query": "SELECT content.*
    FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE content_fts MATCH ('{title content tags summary}:' || :param0 || '*')",
        "wildcards": {
          "param0": ""Hello," "world!"",
        },
      },
      "warnings": [],
    }
  `,
  );
  expect(compile(`"Hello World"`)).toMatchInlineSnapshot(
    `
    {
      "value": {
        "query": "SELECT content.*
    FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE content_fts MATCH ('{title content tags summary}:' || :param0 || '*')",
        "wildcards": {
          "param0": ""Hello" "World"",
        },
      },
      "warnings": [],
    }
  `,
  );
});

test("Quoted string", () => {
  expect(compile(`Hello \"World\"`)).toMatchInlineSnapshot(
    `
    {
      "value": {
        "query": "SELECT content.*
    FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE (content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
    AND content_fts MATCH ('{title content tags summary}:' || :param1 || '*'))",
        "wildcards": {
          "param0": ""Hello"",
          "param1": ""World"",
        },
      },
      "warnings": [],
    }
  `,
  );
});

test("Negate", () => {
  expect(compile(`Hello -has:video`)).toMatchInlineSnapshot(
    `
    {
      "value": {
        "query": "SELECT content.*
    FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE (content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
    AND NOT (EXISTS (SELECT 1 FROM content_youtube WHERE content_youtube.content_id = content.id)))",
        "wildcards": {
          "param0": ""Hello"",
        },
      },
      "warnings": [],
    }
  `,
  );
  expect(compile(`Hello -(has:video has:audio)`)).toMatchInlineSnapshot(
    `
    {
      "value": {
        "query": "SELECT content.*
    FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE (content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
    AND NOT ((EXISTS (SELECT 1 FROM content_youtube WHERE content_youtube.content_id = content.id)
    AND EXISTS (SELECT 1 FROM content_audio WHERE content_audio.content_id = content.id))))",
        "wildcards": {
          "param0": ""Hello"",
        },
      },
      "warnings": [],
    }
  `,
  );
  expect(compile(`--Hello`)).toMatchInlineSnapshot(`
    {
      "value": {
        "query": "SELECT content.*
    FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE NOT (NOT (content_fts MATCH ('{title content tags summary}:' || :param0 || '*')))",
        "wildcards": {
          "param0": ""Hello"",
        },
      },
      "warnings": [],
    }
  `);
});

describe("Error Recovery", () => {
  test("Unclosed string", () => {
    expect(compile(`Hello "World`)).toMatchInlineSnapshot(`
      {
        "value": {
          "query": "SELECT content.*
      FROM content_fts
      LEFT JOIN content ON content.rowid = content_fts.rowid
      WHERE (content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
      AND content_fts MATCH ('{title content tags summary}:' || :param1 || '*'))",
          "wildcards": {
            "param0": ""Hello"",
            "param1": ""World"",
          },
        },
        "warnings": [
          [ValidationError: Unterminated string literal],
        ],
      }
    `);
  });

  test("Unclosed group", () => {
    expect(compile(`(Hello`)).toMatchInlineSnapshot(`
      {
        "value": {
          "query": "SELECT content.*
      FROM content_fts
      LEFT JOIN content ON content.rowid = content_fts.rowid
      WHERE (content_fts MATCH ('{title content tags summary}:' || :param0 || '*'))",
          "wildcards": {
            "param0": ""Hello"",
          },
        },
        "warnings": [
          [ValidationError: Expected closing parenthesis],
        ],
      }
    `);
  });
  test("Invalid prefix", () => {
    expect(compile(`oops:foo`)).toMatchInlineSnapshot(`
      {
        "value": {
          "query": "SELECT content.*
      FROM content_fts
      LEFT JOIN content ON content.rowid = content_fts.rowid
      WHERE (content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
      AND content_fts MATCH ('{title content tags summary}:' || :param1 || '*'))",
          "wildcards": {
            "param0": ""oops"",
            "param1": "":" "foo"",
          },
        },
        "warnings": [
          [ValidationError: Unexpected colon],
        ],
      }
    `);
  });

  test("Invalid has", () => {
    expect(compile(`has:m`)).toMatchInlineSnapshot(`
      {
        "value": {
          "query": "SELECT content.*
      FROM content_fts
      LEFT JOIN content ON content.rowid = content_fts.rowid
      WHERE content_fts MATCH ('{title content tags summary}:' || :param0 || '*')",
          "wildcards": {
            "param0": ""has:m"",
          },
        },
        "warnings": [
          [ValidationError: Unknown "has" value: m],
        ],
      }
    `);
  });
});
