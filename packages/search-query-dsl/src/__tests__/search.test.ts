import { describe, expect, test } from "vitest";
import { compile as _compile, Compiler } from "../Compiler";
import type { SchemaConfig } from "../Compiler";
import fs from "fs";
import path from "path";
import { Database } from "better-sqlite3";
import betterSqlite from "better-sqlite3";
import { createSearchIndexWithTriggers } from "../CreateFtsTable";
import { lex } from "../Lexer";
import { parse } from "../Parser";
import { sql } from "../sql";

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
    name: "Winamp Skin Museum alike",
    config: {
      ftsTable: "skin_search",
      contentTable: "skins",
      ftsTextColumns: ["skin_md5", "file_names", "readme_text"],
      defaultBestSort: "skin_md5", // TODO
      contentTablePrimaryKey: "md5",
      ftsTablePrimaryKey: "skin_md5",
    },
    getDb(config) {
      const db: Database = betterSqlite(":memory:", {});

      db.exec(sql`
        CREATE TABLE IF NOT EXISTS "files" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
          "file_path" TEXT NOT NULL,
          "source_attribution" TEXT,
          "skin_md5" TEXT NOT NULL
        );

        CREATE TABLE archive_files (
          id INTEGER PRIMARY KEY,
          skin_md5 TEXT NOT NULL,
          file_name TEXT NOT_NULL,
          file_md5 TEXT NOT NULL,
          \`file_date\` DATETIME,
          uncompressed_size INTEGER,
          text_content TEXT,
          is_directory INTEGER,
          FOREIGN KEY (skin_md5) REFERENCES skins (md5),
          UNIQUE (skin_md5, file_name)
        );

        CREATE TABLE IF NOT EXISTS "skin_uploads" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
          "skin_md5" TEXT NOT NULL,
          status TEXT NOT NULL,
          filename TEXT
        );

        CREATE TABLE IF NOT EXISTS "skins" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
          "md5" TEXT NOT NULL UNIQUE,
          "skin_type" INTEGER NOT NULL,
          "emails" BLOB,
          "readme_text" BLOB,
          content_hash TEXT
        );

        CREATE TABLE IF NOT EXISTS "skin_reviews" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
          "skin_md5" TEXT NOT NULL,
          review TEXT NOT NULL,
          \`reviewer\` text
        );

        CREATE TABLE IF NOT EXISTS "tweets" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
          "likes" INTEGER,
          "skin_md5" TEXT NOT NULL,
          tweet_id text,
          retweets INTEGER
        );

        CREATE TABLE IF NOT EXISTS "file_info" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
          "file_md5" TEXT NOT NULL UNIQUE,
          text_content TEXT,
          size_in_bytes INTEGER
        );

        CREATE TABLE museum_sort_order (skin_md5 TEXT REFERENCES skins (md5));

        CREATE VIRTUAL TABLE skin_search USING fts5 (skin_md5, readme_text, file_names);

        -- Trigger for inserting into the skins table
        CREATE TRIGGER after_skin_insert AFTER INSERT ON skins BEGIN
        INSERT INTO
          skin_search (skin_md5, readme_text)
        VALUES
          (NEW.md5, NEW.readme_text);

        END;

        -- Trigger for updating skins readme_text
        CREATE TRIGGER after_skin_update AFTER
        UPDATE OF readme_text ON skins BEGIN
        UPDATE skin_search
        SET
          readme_text = NEW.readme_text
        WHERE
          skin_md5 = NEW.md5;

        END;

        -- Trigger for inserting into the files table
        CREATE TRIGGER after_file_insert AFTER INSERT ON files BEGIN
        UPDATE skin_search
        SET
          file_names = (
            SELECT
              GROUP_CONCAT(file_path, ' ')
            FROM
              files
            WHERE
              skin_md5 = NEW.skin_md5
          )
        WHERE
          skin_md5 = NEW.skin_md5;

        END;

        -- Trigger for updating file_path in files
        CREATE TRIGGER after_file_update AFTER
        UPDATE OF file_path ON files BEGIN
        UPDATE skin_search
        SET
          file_names = (
            SELECT
              GROUP_CONCAT(file_path, ' ')
            FROM
              files
            WHERE
              skin_md5 = NEW.skin_md5
          )
        WHERE
          skin_md5 = NEW.skin_md5;

        END;

        -- Trigger for deleting files
        CREATE TRIGGER after_file_delete AFTER DELETE ON files BEGIN
        UPDATE skin_search
        SET
          file_names = (
            SELECT
              GROUP_CONCAT(file_path, ' ')
            FROM
              files
            WHERE
              skin_md5 = OLD.skin_md5
          )
        WHERE
          skin_md5 = OLD.skin_md5;

        END;

        /* skin_search(skin_md5,readme_text,file_names) */;
      `);
      db.exec(sql`
        INSERT INTO
          skins (md5, skin_type, emails, readme_text, content_hash)
        VALUES
          (
            '1234567890abcdef1234567890abcdef',
            1,
            'luigihann@example.com',
            'This is a readme for skin 1 by luigihann.',
            'hash1'
          ),
          (
            'abcdef1234567890abcdef1234567890',
            2,
            'foo@bar.com',
            'This is a readme for skin 2.',
            'hash2'
          );
      `);

      return db;
    },
    queries: ["luigihann"],
  },
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
      "a OR -b",
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
