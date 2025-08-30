import { SchemaConfig } from "./Compiler";
import { sql } from "./sql";

// This script draws inspiration from the example in https://www.sqlite.org/fts5.html#external_content_tables
export function createSearchIndexWithTriggers(config: SchemaConfig): string {
  const rows = config.ftsTextColumns;
  const ftsTable = config.ftsTable;
  const contentTable = config.contentTable;
  const primaryKey = config.contentTablePrimaryKey;
  const newRows = rows.map((row) => `new.${row}`).join(", ");
  const oldRows = rows.map((row) => `old.${row}`).join(", ");
  const rawRows = rows.map((row) => `[${row}]`).join(", ");
  const queries = sql`
    CREATE VIRTUAL TABLE ${ftsTable} USING FTS5 (
      ${rawRows},
      content = [${contentTable}],
      tokenize = porter
    );

    -- Populate the FTS table with existing data
    INSERT INTO
      ${ftsTable} (rowid, ${rawRows})
    SELECT
      rowid,
      ${rawRows}
    FROM
      ${contentTable};

    -- Create the FTS table with the specified columns
    -- After insert trigger to populate the FTS table
    CREATE TRIGGER fts_ai AFTER INSERT ON ${contentTable} BEGIN
    INSERT INTO
      ${ftsTable} (rowid, ${rawRows})
    VALUES
      (new.{primaryKey}, ${newRows});

    END;

    -- After delete trigger to remove from the FTS table
    CREATE TRIGGER fts_ad AFTER DELETE ON ${contentTable} BEGIN
    INSERT INTO
      ${ftsTable} (
        ${ftsTable},
        rowid,
        ${rawRows}
      )
    VALUES
      (
        'delete',
        old.${primaryKey},
        ${oldRows}
      );

    END;

    -- After update trigger to update the FTS table
    CREATE TRIGGER fts_au AFTER
    UPDATE ON ${contentTable} BEGIN
    INSERT INTO
      ${ftsTable} (
        ${ftsTable},
        rowid,
        ${rawRows}
      )
    VALUES
      (
        'delete',
        old.${primaryKey},
        ${oldRows}
      );

    INSERT INTO
      ${ftsTable} (rowid, ${rawRows})
    VALUES
      (
        new.${primaryKey},
        ${newRows}
      );

    END;
  `;

  return queries;
}
