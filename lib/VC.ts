import { UserRole } from "./roles";
import { getSession } from "./session";
import { User } from "./data/User";
import { prepare, sql } from "./db";

/**
 * Viewer Context (VC) class
 *
 * Contains the current session and user information.
 * This class is created once at the top of relevant requests
 * and passed through to any function that needs access to session information.
 * Makes permission helpers synchronous after initial async setup.
 */
export class VC {
  private role: UserRole;
  private _userId: number | null;

  /**
   * Create a new Viewer Context.
   * This constructor is private to enforce using the static create method.
   */
  private constructor(role: UserRole, userId: number | null = null) {
    this.role = role;
    this._userId = userId;
  }

  /**
   * Create a new Viewer Context from the current session.
   * This is an async factory method that should be called once at the top of a request.
   */
  static async create(request?: Request): Promise<VC> {
    // Check for Bearer token auth first
    if (request) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const row = GET_USER_BY_TOKEN.get(token);
        if (row) {
          const user = User.findById(row.user_id);
          if (user) {
            return new VC(user.role, user.id);
          }
        }
        return new VC("anonymous");
      }
    }

    const session = await getSession();

    // Not logged in
    if (!session.userId) {
      return new VC("anonymous");
    }

    // Look up user role from database using User model
    const user = User.findById(session.userId);
    const role = user?.role || "untrusted";

    return new VC(role, session.userId);
  }

  /**
   * Create a Viewer Context for scripts with admin privileges.
   * Use this when running scripts that need admin access.
   */
  static forScripts(): VC {
    return new VC("admin");
  }

  /**
   * Create a Viewer Context for backup scripts that excludes draft content.
   * Use this when running backup scripts to exclude drafts.
   */
  static forBackup(): VC {
    return new VC("anonymous");
  }

  /**
   * Get the user's role.
   */
  getRole(): UserRole {
    return this.role;
  }

  /**
   * Get the user's ID, or null if not logged in.
   */
  getUserId(): number | null {
    return this._userId;
  }

  /**
   * Check if the user can view content debug information.
   */
  canViewContentDebug(): boolean {
    return this.role === "admin";
  }

  /**
   * Check if the user can view draft content.
   */
  canViewDraftContent(): boolean {
    return this.role === "admin";
  }

  /**
   * Check if the user can view the admin UI.
   */
  canViewAdminUI(): boolean {
    return this.role === "admin";
  }

  /**
   * Check if the user can view any paste.
   */
  canViewAnyPaste(): boolean {
    return this.role === "admin";
  }

  /**
   * Check if the user can edit any paste.
   */
  canEditAnyPaste(): boolean {
    return this.role === "admin";
  }

  /**
   * Check if the user can view their own pastes.
   */
  canViewOwnPastes(): boolean {
    return ["admin", "trusted", "untrusted"].includes(this.role);
  }

  /**
   * Check if the user can create pastes.
   */
  canCreatePaste(): boolean {
    return ["admin", "trusted"].includes(this.role);
  }

  /**
   * Check if the user can delete pastes.
   */
  canDeletePaste(): boolean {
    return this.role === "admin";
  }

  /**
   * Check if the user can post comments.
   */
  canPostComments(): boolean {
    return ["admin", "trusted"].includes(this.role);
  }
}

const GET_USER_BY_TOKEN = prepare<[string], { user_id: number }>(sql`
  SELECT
    user_id
  FROM
    api_tokens
  WHERE
    token = ?
`);
