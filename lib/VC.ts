import { UserRole } from "./roles";
import { getSession } from "./session";
import { User } from "./data/User";

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

  /**
   * Create a new Viewer Context.
   * This constructor is private to enforce using the static create method.
   */
  private constructor(role: UserRole) {
    this.role = role;
  }

  /**
   * Create a new Viewer Context from the current session.
   * This is an async factory method that should be called once at the top of a request.
   */
  static async create(): Promise<VC> {
    const session = await getSession();

    // Not logged in
    if (!session.userId) {
      return new VC("anonymous");
    }

    // Look up user role from database using User model
    const user = User.findById(session.userId);
    const role = user?.role || "untrusted";

    return new VC(role);
  }

  /**
   * Create a Viewer Context for scripts with admin privileges.
   * Use this when running scripts that need admin access.
   */
  static forScripts(): VC {
    return new VC("admin");
  }

  /**
   * Get the user's role.
   */
  getRole(): UserRole {
    return this.role;
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
   * Check if the user can post comments.
   */
  canPostComments(): boolean {
    return ["admin", "trusted"].includes(this.role);
  }
}
