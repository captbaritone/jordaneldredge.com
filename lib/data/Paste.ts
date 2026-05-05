import { Int } from "grats";
import { prepare, sql } from "../db";
import { VC } from "../VC";

/**
 * A paste — a snippet of text content hosted on the site.
 * @gqlType
 */
export class Paste {
  /** @gqlField */
  id: Int;
  /** @gqlField */
  fileName: string;
  /** @gqlField */
  content: string;
  /** @gqlField */
  size: Int;
  /** @gqlField */
  createdAt: string;

  constructor(row: PasteRow) {
    this.id = row.id;
    this.fileName = row.file_name;
    this.content = row.content;
    this.size = row.size;
    this.createdAt = row.created_at;
  }

  /** @gqlField */
  url(): string {
    return `/paste/${this.id}/`;
  }

  /** @gqlField */
  rawUrl(): string {
    return `/paste/${this.id}/${this.fileName}`;
  }

  /**
   * List the current user's pastes.
   * @gqlQueryField
   */
  static myPastes(vc: VC): Paste[] {
    const userId = vc.getUserId();
    if (userId == null || !vc.canViewOwnPastes()) {
      return [];
    }
    return LIST_PASTES.all(userId).map((row) => new Paste(row));
  }

  /**
   * Get a single paste by ID (must be owned by the current user, or user is admin).
   * @gqlQueryField
   */
  static paste(vc: VC, id: Int): Paste | null {
    const userId = vc.getUserId();
    if (userId == null) return null;

    if (vc.canViewAnyPaste()) {
      const row = GET_PASTE_ANY.get(id);
      return row ? new Paste(row) : null;
    }

    if (vc.canViewOwnPastes()) {
      const row = GET_PASTE_OWNED.get(id, userId);
      return row ? new Paste(row) : null;
    }

    return null;
  }

  /**
   * Create a new paste.
   * @gqlMutationField
   */
  static createPaste(vc: VC, fileName: string, content: string): Paste {
    const userId = vc.getUserId();
    if (userId == null || !vc.canCreatePaste()) {
      throw new Error("You don't have permission to create pastes");
    }

    INSERT_PASTE.run(userId, fileName, content);
    const row = GET_LAST_ID.get();
    if (!row) throw new Error("Failed to create paste");

    const paste = GET_PASTE_ANY.get(row.id);
    if (!paste) throw new Error("Failed to retrieve created paste");

    return new Paste(paste);
  }

  /**
   * Update an existing paste.
   * @gqlMutationField
   */
  static updatePaste(
    vc: VC,
    id: Int,
    fileName: string | null,
    content: string | null,
  ): Paste {
    const userId = vc.getUserId();
    if (userId == null) {
      throw new Error("You must be logged in");
    }

    // Check ownership (or admin)
    const existing = vc.canEditAnyPaste()
      ? GET_PASTE_ANY.get(id)
      : GET_PASTE_OWNED.get(id, userId);

    if (!existing) {
      throw new Error("Paste not found");
    }

    const newFileName = fileName ?? existing.file_name;
    const newContent = content ?? existing.content;

    if (vc.canEditAnyPaste()) {
      UPDATE_PASTE_ANY.run(newContent, newFileName, id);
    } else {
      UPDATE_PASTE_OWNED.run(newContent, newFileName, id, userId);
    }

    const updated = GET_PASTE_ANY.get(id);
    if (!updated) throw new Error("Failed to retrieve updated paste");
    return new Paste(updated);
  }

  /**
   * Delete a paste.
   * @gqlMutationField
   */
  static deletePaste(vc: VC, id: Int): boolean {
    if (!vc.canDeletePaste()) {
      throw new Error("Only admins can delete pastes");
    }
    DELETE_PASTE.run(id);
    return true;
  }
}

type PasteRow = {
  id: number;
  file_name: string;
  content: string;
  size: number;
  created_at: string;
};

const LIST_PASTES = prepare<[number], PasteRow>(sql`
  SELECT
    id,
    file_name,
    content,
    octet_length(content) AS size,
    created_at
  FROM
    pastes
  WHERE
    author_id = ?
  ORDER BY
    created_at DESC
`);

const GET_PASTE_OWNED = prepare<[number, number], PasteRow>(sql`
  SELECT
    id,
    file_name,
    content,
    octet_length(content) AS size,
    created_at
  FROM
    pastes
  WHERE
    id = ?
    AND author_id = ?
`);

const GET_PASTE_ANY = prepare<[number], PasteRow>(sql`
  SELECT
    id,
    file_name,
    content,
    octet_length(content) AS size,
    created_at
  FROM
    pastes
  WHERE
    id = ?
`);

const INSERT_PASTE = prepare<[number, string, string], void>(sql`
  INSERT INTO
    pastes (author_id, file_name, content)
  VALUES
    (?, ?, ?)
`);

const GET_LAST_ID = prepare<[], { id: number }>(sql`
  SELECT
    last_insert_rowid() AS id
`);

const UPDATE_PASTE_OWNED = prepare<[string, string, number, number], void>(sql`
  UPDATE pastes
  SET
    content = ?,
    file_name = ?
  WHERE
    id = ?
    AND author_id = ?
`);

const UPDATE_PASTE_ANY = prepare<[string, string, number], void>(sql`
  UPDATE pastes
  SET
    content = ?,
    file_name = ?
  WHERE
    id = ?
`);

const DELETE_PASTE = prepare<[number], void>(sql`
  DELETE FROM pastes
  WHERE
    id = ?
`);
