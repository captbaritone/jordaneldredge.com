"use server";

import { db } from "../../../../lib/db";
import { userCanManageRoles } from "../../../../lib/session";
import { revalidatePath } from "next/cache";
import { isValidRole } from "../../../../lib/roles";

export async function updateUserRole(
  userId: number,
  newRole: string,
): Promise<{ success: boolean; message: string }> {
  // Check if the current user has permission to manage roles
  const canManageRoles = await userCanManageRoles();
  if (!canManageRoles) {
    throw new Error("You do not have permission to update user roles");
  }

  // Verify the role is valid
  if (!isValidRole(newRole)) {
    throw new Error(`Role '${newRole}' is not valid`);
  }

  // Update the user's role
  db.prepare("UPDATE users SET role = ? WHERE id = ?").run(newRole, userId);

  // Revalidate the users page
  revalidatePath("/admin/users");

  return {
    success: true,
    message: `User role updated to ${newRole}`,
  };
}

export async function deleteUser(
  userId: number
): Promise<{ success: boolean; message: string }> {
  // Check if the current user has permission to manage roles/users
  const canManageRoles = await userCanManageRoles();
  if (!canManageRoles) {
    throw new Error("You do not have permission to delete users");
  }

  try {
    // First, check if the user exists
    const user = db.prepare("SELECT id, username, role FROM users WHERE id = ?").get(userId) as { id: number; username: string; role: string } | undefined;
    
    if (!user) {
      throw new Error("User not found");
    }

    // Prevent deleting any admin users
    if (user.role === 'admin') {
      throw new Error("Cannot delete administrator accounts");
    }

    // Start a transaction
    db.exec("BEGIN TRANSACTION");

    // Delete user's credentials
    db.prepare("DELETE FROM webauthn_credentials WHERE user_id = ?").run(userId);
    
    // Delete user's pastes if the table exists
    try {
      db.prepare("DELETE FROM pastes WHERE author_id = ?").run(userId);
    } catch (error) {
      // Ignore if table doesn't exist
      console.log("Note: pastes table might not exist, continuing deletion");
    }
    
    // Delete the user
    db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    
    // Commit the transaction
    db.exec("COMMIT");

    // Revalidate the users page
    revalidatePath("/admin/users");

    return {
      success: true,
      message: `User ${user.username} deleted successfully`,
    };
  } catch (error) {
    // Rollback the transaction on error
    db.exec("ROLLBACK");
    throw error;
  }
}
