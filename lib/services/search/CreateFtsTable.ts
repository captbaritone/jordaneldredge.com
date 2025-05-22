import { Database } from "better-sqlite3";
import { sql } from "../../sql";

export function createSearchIndexWithTriggers(
  db: Database,
  ftsTable: string,
  contentTable: string,
  rows: string[],
) {
  const newRows = rows.map((row) => `new.${row}`).join(", ");
  const oldRows = rows.map((row) => `old.${row}`).join(", ");
  const rawRows = rows.map((row) => `${row}`).join(", ");
  db.exec(sql`
    CREATE VIRTUAL TABLE ${ftsTable} USING FTS5 (
      ${rawRows},
      ${contentTable} = [${contentTable}],
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
      (new.rowid, ${newRows});

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
        old.rowid,
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
        'update',
        new.rowid,
        ${newRows}
      );

    END;
  `);
}
