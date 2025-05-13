import "dotenv/config";

import { describe, expect, test } from "vitest";
import { compile as _compile } from "../Compiler";
import type { SchemaConfig, SortOption } from "../Compiler";
import { db, sql } from "../../../db";
import fs from "fs";
import path from "path";
import { Database } from "better-sqlite3";
import betterSqlite from "better-sqlite3";

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

const shouldUpdate =
  process.env.UPDATE === "1" || process.argv.includes("--update");
const fixturesDir = path.resolve(__dirname, "./fixtures");

describe("Fixture tests", () => {
  const files = fs.readdirSync(fixturesDir).filter((f) => f.endsWith(".txt"));

  for (const file of files) {
    const baseName = file.replace(/\.txt$/, "");
    const inputPath = path.join(fixturesDir, `${baseName}.txt`);
    const expectedPath = path.join(fixturesDir, `${baseName}.expected.md`);

    test(`transforms ${file} correctly`, () => {
      const input = fs.readFileSync(inputPath, "utf8").trim();
      const actual = compile(input).value.query.trim();

      const formatted = `
# Input: \`${input}\`

# Query

\`\`\`sql
${actual}
\`\`\`

# Params

\`\`\`json
${JSON.stringify(compile(input).value.params, null, 2)}
\`\`\`
`.trim();

      if (!fs.existsSync(expectedPath)) {
        fs.writeFileSync(expectedPath, formatted);
        console.log(`Created: ${expectedPath}`);
      } else {
        const expected = fs.readFileSync(expectedPath, "utf8").trim();
        if (expected !== formatted && shouldUpdate) {
          fs.writeFileSync(expectedPath, formatted);
          console.log(`Updated: ${expectedPath}`);
        }
        expect(formatted).toBe(expected);
      }
    });
  }
});

function createSearchIndexWithTriggers(
  db: Database,
  ftsTable: string,
  contentTable: string,
  rows: string[],
) {
  const newRows = rows.map((row) => `new.${row}`).join(", ");
  const oldRows = rows.map((row) => `old.${row}`).join(", ");
  db.exec(sql`
    CREATE VIRTUAL TABLE ${ftsTable} USING FTS5 (
      text,
      ${contentTable} = [${contentTable}]
    );

    -- After insert trigger to populate the FTS table
    CREATE TRIGGER fts_ai AFTER INSERT ON ${contentTable} BEGIN
    INSERT INTO
      ${ftsTable} (rowid, text)
    VALUES
      (new.rowid, ${newRows});

    END;

    -- After delete trigger to remove from the FTS table
    CREATE TRIGGER fts_ad AFTER DELETE ON ${contentTable} BEGIN
    INSERT INTO
      ${ftsTable} (${ftsTable}, rowid, text)
    VALUES
      (
        'delete',
        old.rowid,
        ${oldRows}
      );

    END;

    -- After update trigger to update the FTS table
    CREATE TRIGGER fts_au AFTER
    UPDATE ON ${contentTable} BEGIN
    INSERT INTO
      ${ftsTable} (${ftsTable}, rowid, text)
    VALUES
      (
        'update',
        new.rowid,
        ${newRows}
      );

    END;
  `);
}

describe("Novel Schema", () => {
  const config: SchemaConfig = {
    contentTable: "content",
    ftsTable: "content_fts",
    ftsTextColumns: ["text"],
    hardCodedConditions: [],
    hasConditions: {},
    isConditions: {
      A: "content.text = 'A'",
    },
    defaultBestSort: "text",
  };

  // In memory database for testing
  const db: Database = betterSqlite(":memory:", {});

  db.exec(sql`
    CREATE TABLE content (id INTEGER PRIMARY KEY, [text] TEXT NOT NULL);
  `);

  createSearchIndexWithTriggers(db, "content_fts", "content", ["text"]);

  db.exec(sql`
    INSERT INTO
      content (text)
    VALUES
      ('A'),
      ('B'),
      ('C'),
      ('A B'),
      ('A B C');
  `);

  function search(query: string) {
    const compiled = _compile(query, "best", null, config);
    const stmt = db.prepare(compiled.value.query);
    const bound = stmt.bind(compiled.value.params);
    return bound.all().map((row: any) => row.text);
  }

  test("C", () => {
    expect(search("C")).toMatchInlineSnapshot(`
    [
      "A B C",
      "C",
    ]
  `);
  });

  test("C B", () => {
    expect(search("C B")).toMatchInlineSnapshot(`
    [
      "A B C",
    ]
  `);
  });

  test("Misc", () => {
    expect(search("B")).toMatchInlineSnapshot(`
    [
      "A B C",
      "A B",
      "B",
    ]
  `);

    expect(search("B -C")).toMatchInlineSnapshot(`
    [
      "A B",
      "B",
    ]
  `);

    expect(search("B NOT C")).toMatchInlineSnapshot(`
    [
      "A B",
      "B",
    ]
  `);

    expect(search("B OR C")).toMatchInlineSnapshot(`
    [
      "A B",
      "B",
      "A B C",
      "C",
    ]
  `);

    expect(search("B AND C")).toMatchInlineSnapshot(`
    [
      "A B C",
    ]
  `);

    expect(search("B NOT C")).toMatchInlineSnapshot(`
    [
      "A B",
      "B",
    ]
  `);
  });
  test("Parens", () => {
    expect(search("(B)")).toMatchInlineSnapshot(`
      [
        "A B C",
        "A B",
        "B",
      ]
    `);
  });
  test("Multiple parens", () => {
    expect(search("(A) (B)")).toMatchInlineSnapshot(`
      [
        "A B C",
        "A B",
      ]
    `);
  });

  test("--A", () => {
    expect(search("--A")).toMatchInlineSnapshot(`
      [
        "A",
        "A B",
        "A B C",
      ]
    `);
  });
  // test("A NOT -A", () => {
  //   expect(search("A NOT -A")).toMatchInlineSnapshot();
  // });
  test("is:A", () => {
    expect(search("is:A")).toMatchInlineSnapshot(`
      [
        "A",
      ]
    `);
  });
  test("A NOT is:A", () => {
    expect(search("A NOT is:A")).toMatchInlineSnapshot(`
      [
        "A B C",
        "A B",
      ]
    `);
  });
  test("(A NOT (C OR is:A))", () => {
    expect(search("(A NOT (C OR is:A))")).toMatchInlineSnapshot(`
      [
        "A B",
      ]
    `);
  });
  describe("error recovery", () => {
    test("-", () => {
      expect(search("-")).toMatchInlineSnapshot(`[]`);
    });
    test("NOT", () => {
      expect(search("NOT")).toMatchInlineSnapshot(`[]`);
    });
    test("AND", () => {
      expect(search("AND")).toMatchInlineSnapshot(`[]`);
    });
    test("OR", () => {
      expect(search("OR")).toMatchInlineSnapshot(`[]`);
    });
    test("-", () => {
      expect(search("-")).toMatchInlineSnapshot(`[]`);
    });
    test("a AND", () => {
      expect(search("a AND")).toMatchInlineSnapshot(`[]`);
    });
    test("a (", () => {
      expect(search("a (")).toMatchInlineSnapshot(`[]`);
    });
  });
});

// describe("sort", () => {
//   describe("best", () => {
//     test("use raking when no match", () => {
//       expect(compile("#foo", "best")).toMatchInlineSnapshot(`
//         {
//           "value": {
//             "params": {
//               "param0": "foo",
//             },
//             "query": "SELECT content.* FROM content_fts
//         LEFT JOIN content ON content.rowid = content_fts.rowid
//         WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
//         AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
//         AND (content.tags LIKE :param0 OR content.tags LIKE :param0 || ' %' OR content.tags LIKE '% ' || :param0 OR content.tags LIKE '% ' || :param0 || ' %')
//         ORDER BY page_rank DESC",
//           },
//           "warnings": [],
//         }
//       `);
//     });

//     test("use match ordering when match", () => {
//       expect(compile("foo", "best")).toMatchInlineSnapshot(`
//         {
//           "value": {
//             "params": {
//               "param0": ""foo"",
//             },
//             "query": "SELECT content.* FROM content_fts
//         LEFT JOIN content ON content.rowid = content_fts.rowid
//         WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
//         AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
//         AND content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
//         ORDER BY RANK DESC, page_rank DESC",
//           },
//           "warnings": [],
//         }
//       `);
//     });
//   });

//   describe("latest", () => {
//     test("use latest when no match", () => {
//       expect(compile("#foo", "latest")).toMatchInlineSnapshot(`
//         {
//           "value": {
//             "params": {
//               "param0": "foo",
//             },
//             "query": "SELECT content.* FROM content_fts
//         LEFT JOIN content ON content.rowid = content_fts.rowid
//         WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
//         AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
//         AND (content.tags LIKE :param0 OR content.tags LIKE :param0 || ' %' OR content.tags LIKE '% ' || :param0 OR content.tags LIKE '% ' || :param0 || ' %')
//         ORDER BY content.DATE DESC, page_rank DESC",
//           },
//           "warnings": [],
//         }
//       `);
//     });

//     test("use latest ordering when match", () => {
//       expect(compile("foo", "latest")).toMatchInlineSnapshot(`
//         {
//           "value": {
//             "params": {
//               "param0": ""foo"",
//             },
//             "query": "SELECT content.* FROM content_fts
//         LEFT JOIN content ON content.rowid = content_fts.rowid
//         WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
//         AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
//         AND content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
//         ORDER BY content.DATE DESC, RANK DESC, page_rank DESC",
//           },
//           "warnings": [],
//         }
//       `);
//     });
//   });
// });

// describe("has", () => {

// describe("Negate", () => {
//   test("has clause", () => {
//     expect(compile(`Hello -has:video`)).toMatchInlineSnapshot(
//       `
//       {
//         "value": {
//           "params": {
//             "param0": ""Hello"",
//           },
//           "query": "SELECT content.* FROM content_fts
//       LEFT JOIN content ON content.rowid = content_fts.rowid
//       WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
//       AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
//       AND (content.rowid IN (SELECT content_fts.rowid FROM content_fts WHERE content_fts MATCH ('{title content tags summary}:' || :param0 || '*'))
//       AND NOT (EXISTS (SELECT 1 FROM content_youtube WHERE content_youtube.content_id = content.id)))
//       ORDER BY page_rank DESC",
//         },
//         "warnings": [],
//       }
//     `,
//     );
//   });

//   test("group", () => {
//     expect(compile(`Hello -(has:video has:audio)`)).toMatchInlineSnapshot(
//       `
//       {
//         "value": {
//           "params": {
//             "param0": ""Hello"",
//           },
//           "query": "SELECT content.* FROM content_fts
//       LEFT JOIN content ON content.rowid = content_fts.rowid
//       WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
//       AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
//       AND (content.rowid IN (SELECT content_fts.rowid FROM content_fts WHERE content_fts MATCH ('{title content tags summary}:' || :param0 || '*'))
//       AND NOT ((EXISTS (SELECT 1 FROM content_youtube WHERE content_youtube.content_id = content.id)
//       AND EXISTS (SELECT 1 FROM content_audio WHERE content_audio.content_id = content.id))))
//       ORDER BY page_rank DESC",
//         },
//         "warnings": [],
//       }
//     `,
//     );
//   });

//   test("double negative", () => {
//     expect(compile(`--Hello`)).toMatchInlineSnapshot(`
//       {
//         "value": {
//           "params": {
//             "param0": ""Hello"",
//           },
//           "query": "SELECT content.* FROM content_fts
//       LEFT JOIN content ON content.rowid = content_fts.rowid
//       WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
//       AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
//       AND NOT (NOT (content.rowid IN (SELECT content_fts.rowid FROM content_fts WHERE content_fts MATCH ('{title content tags summary}:' || :param0 || '*'))))
//       ORDER BY page_rank DESC",
//         },
//         "warnings": [],
//       }
//     `);
//   });

//   test("text", () => {
//     expect(compile(`-Hello`)).toMatchInlineSnapshot(`
//       {
//         "value": {
//           "params": {
//             "param0": ""Hello"",
//           },
//           "query": "SELECT content.* FROM content_fts
//       LEFT JOIN content ON content.rowid = content_fts.rowid
//       WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
//       AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
//       AND NOT (content.rowid IN (SELECT content_fts.rowid FROM content_fts WHERE content_fts MATCH ('{title content tags summary}:' || :param0 || '*')))
//       ORDER BY page_rank DESC",
//         },
//         "warnings": [],
//       }
//     `);
//   });
// });

// describe("Error Recovery", () => {
//   test("Unclosed string", () => {
//     expect(compile(`Hello "World`)).toMatchInlineSnapshot(`
//       {
//         "value": {
//           "params": {
//             "param0": ""Hello"",
//             "param1": ""World"",
//           },
//           "query": "SELECT content.* FROM content_fts
//       LEFT JOIN content ON content.rowid = content_fts.rowid
//       WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
//       AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
//       AND content_fts MATCH ('{title content tags summary}:' || (:param0
//       AND :param1) || '*')
//       ORDER BY RANK DESC, page_rank DESC",
//         },
//         "warnings": [
//           [ValidationError: Unterminated string literal],
//         ],
//       }
//     `);
//   });

//   test("Unclosed group", () => {
//     expect(compile(`(Hello`)).toMatchInlineSnapshot(`
//       {
//         "value": {
//           "params": {
//             "param0": ""Hello"",
//           },
//           "query": "SELECT content.* FROM content_fts
//       LEFT JOIN content ON content.rowid = content_fts.rowid
//       WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
//       AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
//       AND content_fts MATCH ('{title content tags summary}:' || (:param0) || '*')
//       ORDER BY RANK DESC, page_rank DESC",
//         },
//         "warnings": [
//           [ValidationError: Expected closing parenthesis],
//         ],
//       }
//     `);
//   });
//   test("Invalid prefix", () => {
//     expect(compile(`oops:foo`)).toMatchInlineSnapshot(`
//       {
//         "value": {
//           "params": {
//             "param0": ""oops:foo"",
//           },
//           "query": "SELECT content.* FROM content_fts
//       LEFT JOIN content ON content.rowid = content_fts.rowid
//       WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
//       AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
//       AND content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
//       ORDER BY RANK DESC, page_rank DESC",
//         },
//         "warnings": [
//           [ValidationError: Unknown prefix: oops],
//         ],
//       }
//     `);
//   });

//   test.skip("Space around colon", () => {
//     expect(compile(`has : image`)).toMatchInlineSnapshot(`
//       {
//         "value": {
//           "params": {
//             "param0": ""has"",
//             "param1": "":"",
//             "param2": ""image"",
//           },
//           "query": "SELECT content.* FROM content_fts
//       LEFT JOIN content ON content.rowid = content_fts.rowid
//       WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
//       AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
//       AND content_fts MATCH ('{title content tags summary}:' || (:param0
//       AND :param1
//       AND :param2) || '*')
//       ORDER BY RANK, page_rank DESC",
//         },
//         "warnings": [
//           [ValidationError: Expected a value after ":"],
//         ],
//       }
//     `);
//   });

//   test("Space after colon", () => {
//     expect(compile(`has :image`)).toMatchInlineSnapshot(`
//       {
//         "value": {
//           "params": {
//             "param0": ""has"",
//             "param1": "":image"",
//           },
//           "query": "SELECT content.* FROM content_fts
//       LEFT JOIN content ON content.rowid = content_fts.rowid
//       WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
//       AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
//       AND content_fts MATCH ('{title content tags summary}:' || (:param0
//       AND :param1) || '*')
//       ORDER BY RANK DESC, page_rank DESC",
//         },
//         "warnings": [],
//       }
//     `);
//   });

//   test("Invalid has", () => {
//     expect(compile(`has:m`)).toMatchInlineSnapshot(`
//       {
//         "value": {
//           "params": {
//             "param0": ""has:m"",
//           },
//           "query": "SELECT content.* FROM content_fts
//       LEFT JOIN content ON content.rowid = content_fts.rowid
//       WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
//       AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
//       AND content_fts MATCH ('{title content tags summary}:' || :param0 || '*')
//       ORDER BY RANK DESC, page_rank DESC",
//         },
//         "warnings": [
//           [ValidationError: Unknown "has" value: m],
//         ],
//       }
//     `);
//   });
//   test("Start with close paren", () => {
//     expect(compile(`) hello`)).toMatchInlineSnapshot(`
//       {
//         "value": {
//           "params": {
//             "param0": "")"",
//             "param1": ""hello"",
//           },
//           "query": "SELECT content.* FROM content_fts
//       LEFT JOIN content ON content.rowid = content_fts.rowid
//       WHERE (json_extract(metadata, '$.archive') IS NULL OR NOT json_extract(metadata, '$.archive'))
//       AND (json_extract(metadata, '$.draft') IS NULL OR NOT json_extract(metadata, '$.draft'))
//       AND content_fts MATCH ('{title content tags summary}:' || (:param0
//       AND :param1) || '*')
//       ORDER BY RANK DESC, page_rank DESC",
//         },
//         "warnings": [
//           [ValidationError: Unexpected ) without preceding (],
//         ],
//       }
//     `);
//   });
// });
