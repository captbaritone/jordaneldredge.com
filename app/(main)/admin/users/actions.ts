"use server";

import { userCanManageRoles } from "../../../../lib/session";
import { revalidatePath } from "next/cache";
import { User } from "../../../../lib/data/User";

export async function updateUserRole(
  userId: number,
  newRole: string,
): Promise<{ success: boolean; message: string }> {
  // Check if the current user has permission to manage roles
  const canManageRoles = await userCanManageRoles();
  if (!canManageRoles) {
    throw new Error("You do not have permission to update user roles");
  }

  // Update the user's role using the User model
  User.updateRole(userId, newRole);

  // Revalidate the users page
  revalidatePath("/admin/users");

  return {
    success: true,
    message: `User role updated to ${newRole}`,
  };
}

export async function deleteUser(
  userId: number,
): Promise<{ success: boolean; message: string }> {
  // Check if the current user has permission to manage roles/users
  const canManageRoles = await userCanManageRoles();
  if (!canManageRoles) {
    throw new Error("You do not have permission to delete users");
  }

  try {
    // Find the user to get their username for the success message
    const user = User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Delete the user using the User model
    User.delete(userId);

    // Revalidate the users page
    revalidatePath("/admin/users");

    return {
      success: true,
      message: `User ${user.username} deleted successfully`,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete user";
    throw new Error(message);
  }
}
