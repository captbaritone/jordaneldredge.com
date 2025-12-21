import { db, prepare, sql } from "../db";
import { UserRole, isValidRole } from "../roles";

/**
 * User model type
 */
export interface User {
  id: number;
  username: string;
  display_name: string | null;
  role: UserRole;
  created_at: string;
  last_login: string | null;
  email?: string; // This is actually just the username (used in admin UI)
}

/**
 * User model for database operations
 *
 * Uses dynamic caching of prepared statements for better performance.
 * Statements are only prepared when they're first used, then cached for future use.
 */
export class User {
  /**
   * Get a user by ID
   */
  static findById(id: number): User | null {
    const stmt = prepare<[number], User>(sql`
      SELECT
        id,
        username,
        display_name,
        role,
        created_at,
        last_login
      FROM
        users
      WHERE
        id = ?
    `);
    const user = stmt.get(id);
    return user || null;
  }

  /**
   * Find a user by username
   */
  static findByUsername(username: string): User | null {
    const stmt = prepare<[string], User>(sql`
      SELECT
        id,
        username,
        display_name,
        role,
        created_at,
        last_login
      FROM
        users
      WHERE
        username = ?
    `);
    const user = stmt.get(username);
    return user || null;
  }

  /**
   * Get all users
   */
  static findAll(): User[] {
    const stmt = prepare<[], User>(sql`
      SELECT
        id,
        username,
        display_name,
        username AS email,
        role,
        created_at,
        last_login
      FROM
        users
      ORDER BY
        created_at DESC
    `);
    return stmt.all();
  }

  /**
   * Create a new user
   */
  static create(data: {
    username: string;
    display_name?: string;
    role?: UserRole;
  }): User {
    const displayName = data.display_name || data.username;
    const role = data.role || "untrusted";

    const stmt = prepare<[string, string, string], void>(sql`
      INSERT INTO
        users (username, display_name, role)
      VALUES
        (?, ?, ?)
    `);
    stmt.run(data.username, displayName, role);

    const newUser = this.findByUsername(data.username);
    if (!newUser) {
      throw new Error(
        "Failed to create user: could not find newly created user",
      );
    }
    return newUser;
  }

  /**
   * Update a user's role
   */
  static updateRole(userId: number, newRole: string): boolean {
    if (!isValidRole(newRole)) {
      throw new Error(`Role '${newRole}' is not valid`);
    }

    const stmt = prepare<[string, number], void>(sql`
      UPDATE users
      SET
        role = ?
      WHERE
        id = ?
    `);
    stmt.run(newRole, userId);
    return true;
  }

  /**
   * Update a user's last login time to now
   */
  static updateLastLogin(userId: number): boolean {
    const stmt = prepare<[number], void>(sql`
      UPDATE users
      SET
        last_login = datetime('now')
      WHERE
        id = ?
    `);
    stmt.run(userId);
    return true;
  }

  /**
   * Delete a user and all associated records
   */
  static delete(userId: number): boolean {
    try {
      // First, get the user to ensure they exist
      const user = this.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Check if user is an admin
      if (user.role === "admin") {
        throw new Error("Cannot delete administrator accounts");
      }

      // Start a transaction
      db.exec("BEGIN TRANSACTION");

      // Delete user's credentials
      const deleteCredentials = prepare<[number], void>(sql`
        DELETE FROM webauthn_credentials
        WHERE
          user_id = ?
      `);
      deleteCredentials.run(userId);

      // Delete user's pastes if the table exists
      try {
        const deletePastes = prepare<[number], void>(sql`
          DELETE FROM pastes
          WHERE
            author_id = ?
        `);
        deletePastes.run(userId);
      } catch (_error) {
        // Ignore if table doesn't exist
        console.log("Note: pastes table might not exist, continuing deletion");
      }

      // Delete the user
      const deleteUser = prepare<[number], void>(sql`
        DELETE FROM users
        WHERE
          id = ?
      `);
      deleteUser.run(userId);

      // Commit the transaction
      db.exec("COMMIT");

      return true;
    } catch (_error) {
      // Rollback the transaction on error
      db.exec("ROLLBACK");
      throw error;
    }
  }

  /**
   * Get the total number of users
   */
  static count(): number {
    const stmt = prepare<[], { count: number }>(sql`
      SELECT
        COUNT(*) AS COUNT
      FROM
        users
    `);
    const result = stmt.get();
    return result ? result.count : 0;
  }
}
