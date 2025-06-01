import "dotenv/config";

import { describe, expect, test } from "vitest";
import { compile as _compile, Compiler } from "../Compiler";
import type { SchemaConfig } from "../Compiler";
import { sql } from "../../../db";
import fs from "fs";
import path from "path";
import { Database } from "better-sqlite3";
import betterSqlite from "better-sqlite3";
import { createSearchIndexWithTriggers } from "../CreateFtsTable";
import { lex } from "../Lexer";
import { parse } from "../Parser";

const shouldUpdate =
  process.env.UPDATE === "1" || process.argv.includes("--update");
const fixturesDir = path.resolve(__dirname, "./fixtures");

const databases: {
  name: string;
  config: SchemaConfig;
  getDb(config: SchemaConfig): Database;
  queries: string[];
}[] = [
  {
    name: "Cats and Dogs",
    config: {
      contentTable: "content",
      ftsTable: "content_fts",
      ftsTextColumns: ["text"],
      hardCodedConditions: [],
      tagCondition(tag: string) {
        return null;
      },
      keyValueCondition(key: string, value: string) {
        return null;
      },
      defaultBestSort: "text",
    },
    getDb(config) {
      // In memory database for testing
      const db: Database = betterSqlite(":memory:", {});
      db.exec(sql`
        CREATE TABLE content (id INTEGER PRIMARY KEY, [text] TEXT NOT NULL);
      `);

      createSearchIndexWithTriggers(db, config);

      db.exec(sql`
        INSERT INTO
          content (text)
        VALUES
          ('cats and dogs'),
          ('cats like to eat hotdogs'),
          ('hotdogs are delicious'),
          ('dogs are cute'),
          ('cats are cute');
      `);
      return db;
    },
    queries: ["cat OR dog", "cat OR (dog NOT cute)"],
  },
  {
    name: "Novel Schema",
    config: {
      contentTable: "content",
      ftsTable: "content_fts",
      ftsTextColumns: ["text"],
      hardCodedConditions: [],
      tagCondition(tag: string) {
        return null;
      },
      keyValueCondition(key: string, value: string) {
        if (key === "is" && value === "A") {
          return "content.text = 'A'";
        }
        return null;
      },
      defaultBestSort: "text",
    },
    getDb(config) {
      // In memory database for testing
      const db: Database = betterSqlite(":memory:", {});

      db.exec(sql`
        CREATE TABLE content (id INTEGER PRIMARY KEY, [text] TEXT NOT NULL);
      `);

      createSearchIndexWithTriggers(db, config);

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
      return db;
    },
    queries: [
      "C",
      "C B",
      "B",
      "B -C",
      "B NOT C",
      "B OR C",
      "B AND C",
      "A AND B AND C",
      "(B)",
      "(A) (B)",
      "--A",
      "is:A",
      "A NOT is:A",
      "(A NOT (C OR is:A))",
      "-",
      "NOT",
      "AND",
      "OR",
      "-",
      "a AND",
      "a (",
    ],
  },
];

for (const { name, config, getDb, queries } of databases) {
  describe(`${name} Example Database`, () => {
    const db = getDb(config);
    for (const query of queries) {
      test(query, () => {
        function normalizeSegment(segment: string): string {
          return segment.replace(/[^a-zA-Z0-9]/g, "_");
        }
        const expectedPath = path.join(
          fixturesDir,
          normalizeSegment(name),
          normalizeSegment(query) + ".expected.md",
        );

        const tokenResult = lex(query);
        const parseResult = parse(tokenResult.value);
        const compiler = new Compiler(config, "best", null);
        compiler.compile(parseResult.value);
        const sql = compiler.serialize();
        const compiled = {
          value: { query: sql, params: compiler.params },
          warnings: [
            ...tokenResult.warnings,
            ...parseResult.warnings,
            ...compiler._warnings,
          ],
        };
        // const compiled = _compile(config, query, "best", null);
        const stmt = db.prepare(compiled.value.query);
        const bound = stmt.bind(compiled.value.params);
        const results = bound.all().map((row: any) => row.text);

        function warningUnderline(warning: any): string {
          const length = warning.loc.end - warning.loc.start;
          const tildeLength = Math.max(length - 1, 0);
          const indent = "".padStart(warning.loc.start - 1, " ");
          return (
            `${indent}^`.padStart(warning.loc.start - 1, " ") +
            `~`.repeat(tildeLength)
          );
        }

        const formatted = `
# Input: \`${query}\`

# Warnings

${
  compiled.warnings
    .map((w) => {
      return `${query}\n${warningUnderline(w)}\n- ${w.message} at ${w.loc.start}:${w.loc.end}`;
    })
    .join("\n") || "None"
}

# Results
\`\`\`json
${JSON.stringify(results, null, 2)}
\`\`\`

# Query

\`\`\`sql
${compiled.value.query}
\`\`\`

# Params

\`\`\`json
${JSON.stringify(compiled.value.params, null, 2)}
\`\`\`

# AST

\`\`\`json
${JSON.stringify(parseResult.value, null, 2)}
\`\`\`

# Tokens
\`\`\`json
${JSON.stringify(tokenResult.value, null, 2)}
\`\`\`


`.trim();

        if (!fs.existsSync(expectedPath)) {
          fs.mkdirSync(path.dirname(expectedPath), { recursive: true });
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
}
