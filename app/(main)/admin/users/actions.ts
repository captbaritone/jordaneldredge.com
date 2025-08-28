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
