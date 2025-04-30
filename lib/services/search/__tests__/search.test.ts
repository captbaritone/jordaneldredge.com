import "dotenv/config";

import { describe, expect, test } from "vitest";
import { compile as _compile } from "../Compiler";
import type { SortOption } from "../Compiler";
import { db } from "../../../db";

function compile(
  queryString: string,
  sort: SortOption = "best",
  limit?: number,
) {
  const query = _compile(queryString, sort, limit ?? null);
  const stmt = db.prepare(query.value.query);
  const bound = stmt.bind(query.value.params);
  bound.all();
  return query;
}

describe("Empty", () => {
  test("query", () => {
    expect(compile("")).toMatchInlineSnapshot(`
      {
        "value": {
          "params": {},
          "query": "SELECT content.* FROM content_fts
      LEFT JOIN content ON content.rowid = content_fts.rowid
      WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
      AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
      AND TRUE
      ORDER BY page_rank DESC",
        },
        "warnings": [],
      }
    `);
  });

  test("group", () => {
    expect(compile("()")).toMatchInlineSnapshot(`
      {
        "value": {
          "params": {},
          "query": "SELECT content.* FROM content_fts
      LEFT JOIN content ON content.rowid = content_fts.rowid
      WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
      AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
      AND TRUE
      ORDER BY page_rank DESC",
        },
        "warnings": [],
      }
    `);
  });
});

describe("sort", () => {
  describe("best", () => {
    test("use raking when no match", () => {
      expect(compile("#foo", "best")).toMatchInlineSnapshot(`
        {
          "value": {
            "params": {
              "param0": "foo",
            },
            "query": "SELECT content.* FROM content_fts
        LEFT JOIN content ON content.rowid = content_fts.rowid
        WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
        AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
        AND (content.tags LIKE :param0 OR content.tags LIKE :param0 || ' %' OR content.tags LIKE '% ' || :param0 OR content.tags LIKE '% ' || :param0 || ' %')
        ORDER BY page_rank DESC",
          },
          "warnings": [],
        }
      `);
    });

    test("use match ordering when match", () => {
      expect(compile("foo", "best")).toMatchInlineSnapshot(`
        {
          "value": {
            "params": {
              "param0": ""foo"",
            },
            "query": "SELECT content.* FROM content_fts
        LEFT JOIN content ON content.rowid = content_fts.rowid
        WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
        AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
        AND content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
        ORDER BY RANK, page_rank DESC",
          },
          "warnings": [],
        }
      `);
    });
  });

  describe("latest", () => {
    test("use latest when no match", () => {
      expect(compile("#foo", "latest")).toMatchInlineSnapshot(`
        {
          "value": {
            "params": {
              "param0": "foo",
            },
            "query": "SELECT content.* FROM content_fts
        LEFT JOIN content ON content.rowid = content_fts.rowid
        WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
        AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
        AND (content.tags LIKE :param0 OR content.tags LIKE :param0 || ' %' OR content.tags LIKE '% ' || :param0 OR content.tags LIKE '% ' || :param0 || ' %')
        ORDER BY content.DATE, page_rank DESC",
          },
          "warnings": [],
        }
      `);
    });

    test("use latest ordering when match", () => {
      expect(compile("foo", "latest")).toMatchInlineSnapshot(`
        {
          "value": {
            "params": {
              "param0": ""foo"",
            },
            "query": "SELECT content.* FROM content_fts
        LEFT JOIN content ON content.rowid = content_fts.rowid
        WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
        AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
        AND content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
        ORDER BY content.DATE, RANK, page_rank DESC",
          },
          "warnings": [],
        }
      `);
    });
  });
});

test("simple string", () => {
  expect(compile("winamp")).toMatchInlineSnapshot(`
    {
      "value": {
        "params": {
          "param0": ""winamp"",
        },
        "query": "SELECT content.* FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
    AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
    AND content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
    ORDER BY RANK, page_rank DESC",
      },
      "warnings": [],
    }
  `);
});

test("multiple strings", () => {
  expect(compile("(winamp) (sqlite)")).toMatchInlineSnapshot(`
    {
      "value": {
        "params": {
          "param0": ""winamp"",
          "param1": ""sqlite"",
        },
        "query": "SELECT content.* FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
    AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
    AND content_fts MATCH ('{title content tags summary}:' || ((:param0)
    AND (:param1)) || '*')
    ORDER BY RANK, page_rank DESC",
      },
      "warnings": [],
    }
  `);
});

test("simple phrase", () => {
  expect(compile("Hello, world!")).toMatchInlineSnapshot(
    `
    {
      "value": {
        "params": {
          "param0": ""Hello," "world!"",
        },
        "query": "SELECT content.* FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
    AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
    AND content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
    ORDER BY RANK, page_rank DESC",
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
        "params": {
          "param0": ""Hello"",
          "param1": ""World"",
        },
        "query": "SELECT content.* FROM content_fts
    LEFT JOIN content ON content.rowid = content_fts.rowid
    WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
    AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
    AND content_fts MATCH ('{title content tags summary}:' || (:param0
    AND :param1) || '*')
    ORDER BY RANK, page_rank DESC",
      },
      "warnings": [],
    }
  `,
  );
});

describe("Negate", () => {
  test("has clause", () => {
    expect(compile(`Hello -has:video`)).toMatchInlineSnapshot(
      `
      {
        "value": {
          "params": {
            "param0": ""Hello"",
          },
          "query": "SELECT content.* FROM content_fts
      LEFT JOIN content ON content.rowid = content_fts.rowid
      WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
      AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
      AND (content.rowid IN (SELECT content_fts.rowid FROM content_fts WHERE content_fts MATCH ('{title content tags summary}:' || :param0 || '*'))
      AND NOT (EXISTS (SELECT 1 FROM content_youtube WHERE content_youtube.content_id = content.id)))
      ORDER BY page_rank DESC",
        },
        "warnings": [],
      }
    `,
    );
  });

  test("group", () => {
    expect(compile(`Hello -(has:video has:audio)`)).toMatchInlineSnapshot(
      `
      {
        "value": {
          "params": {
            "param0": ""Hello"",
          },
          "query": "SELECT content.* FROM content_fts
      LEFT JOIN content ON content.rowid = content_fts.rowid
      WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
      AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
      AND (content.rowid IN (SELECT content_fts.rowid FROM content_fts WHERE content_fts MATCH ('{title content tags summary}:' || :param0 || '*'))
      AND NOT ((EXISTS (SELECT 1 FROM content_youtube WHERE content_youtube.content_id = content.id)
      AND EXISTS (SELECT 1 FROM content_audio WHERE content_audio.content_id = content.id))))
      ORDER BY page_rank DESC",
        },
        "warnings": [],
      }
    `,
    );
  });

  test.only("double negative", () => {
    expect(compile(`--Hello`)).toMatchInlineSnapshot(`
      {
        "value": {
          "params": {
            "param0": ""Hello"",
          },
          "query": "SELECT content.* FROM content_fts
      LEFT JOIN content ON content.rowid = content_fts.rowid
      WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
      AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
      AND NOT (NOT (content.rowid IN (SELECT content_fts.rowid FROM content_fts WHERE content_fts MATCH ('{title content tags summary}:' || :param0 || '*'))))
      ORDER BY page_rank DESC",
        },
        "warnings": [],
      }
    `);
  });

  test("text", () => {
    expect(compile(`-Hello`)).toMatchInlineSnapshot(`
      {
        "value": {
          "params": {
            "param0": ""Hello"",
          },
          "query": "SELECT content.* FROM content_fts
      LEFT JOIN content ON content.rowid = content_fts.rowid
      WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
      AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
      AND NOT (content.rowid IN (SELECT content_fts.rowid FROM content_fts WHERE content_fts MATCH ('{title content tags summary}:' || :param0 || '*')))
      ORDER BY page_rank DESC",
        },
        "warnings": [],
      }
    `);
  });
});

describe("Error Recovery", () => {
  test("Unclosed string", () => {
    expect(compile(`Hello "World`)).toMatchInlineSnapshot(`
      {
        "value": {
          "params": {
            "param0": ""Hello"",
            "param1": ""World"",
          },
          "query": "SELECT content.* FROM content_fts
      LEFT JOIN content ON content.rowid = content_fts.rowid
      WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
      AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
      AND content_fts MATCH ('{title content tags summary}:' || (:param0
      AND :param1) || '*')
      ORDER BY RANK, page_rank DESC",
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
          "params": {
            "param0": ""Hello"",
          },
          "query": "SELECT content.* FROM content_fts
      LEFT JOIN content ON content.rowid = content_fts.rowid
      WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
      AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
      AND content_fts MATCH ('{title content tags summary}:' || (:param0) || '*')
      ORDER BY RANK, page_rank DESC",
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
          "params": {
            "param0": ""oops"",
            "param1": "":" "foo"",
          },
          "query": "SELECT content.* FROM content_fts
      LEFT JOIN content ON content.rowid = content_fts.rowid
      WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
      AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
      AND content_fts MATCH ('{title content tags summary}:' || (:param0
      AND :param1) || '*')
      ORDER BY RANK, page_rank DESC",
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
          "params": {
            "param0": ""has:m"",
          },
          "query": "SELECT content.* FROM content_fts
      LEFT JOIN content ON content.rowid = content_fts.rowid
      WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
      AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
      AND content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
      ORDER BY RANK, page_rank DESC",
        },
        "warnings": [
          [ValidationError: Unknown "has" value: m],
        ],
      }
    `);
  });
});
