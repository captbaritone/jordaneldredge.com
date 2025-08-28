import { db } from "../../../../lib/db";
import { userCanManageRoles } from "../../../../lib/session";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import UserRoleForm from "./UserRoleForm";
import {
  getAllRoles,
  ROLE_DESCRIPTIONS,
  UserRole,
} from "../../../../lib/roles";
import { checkLastLoginColumn } from "./check-schema";

export const metadata: Metadata = {
  title: "Manage Users",
};

interface User {
  id: number;
  username: string;
  display_name: string | null;
  email: string; // This is actually just the username
  role: UserRole;
  created_at: string;
  last_login: string | null;
}

interface Role {
  name: string;
  description: string;
}

export default async function ManageUsers() {
  const canManageRoles = await userCanManageRoles();
  if (!canManageRoles) {
    notFound();
  }

  // Check if the last_login column exists
  const hasLastLoginColumn = await checkLastLoginColumn();

  // Adjust the SQL query based on whether the last_login column exists
  const userQuery = hasLastLoginColumn
    ? `
      SELECT 
        u.id, 
        u.username, 
        u.display_name, 
        u.username as email,
        u.role, 
        u.created_at,
        u.last_login
      FROM users u
      ORDER BY u.created_at DESC
    `
    : `
      SELECT 
        u.id, 
        u.username, 
        u.display_name, 
        u.role, 
        u.created_at,
        NULL as last_login
      FROM users u
      ORDER BY u.created_at DESC
    `;

  // Get all users with their detailed information
  const users = db.prepare(userQuery).all() as User[];

  // Get all available roles with descriptions
  const roles = getAllRoles().map((role) => ({
    name: role,
    description: ROLE_DESCRIPTIONS[role],
  }));

  return (
    <div className="markdown">
      <h1>Manage Users</h1>
      <p>View and manage users registered on the site.</p>

      <table className="w-full border-collapse my-4 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Username</th>
            <th className="p-2 text-left">Display Name</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Created</th>
            <th className="p-2 text-left">Last Login</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-t border-gray-300 hover:bg-gray-50"
            >
              <td className="p-2 font-medium">{user.username}</td>
              <td className="p-2">{user.display_name || "-"}</td>
              <td className="p-2">
                <UserRoleForm
                  userId={user.id}
                  currentRole={user.role}
                  roles={roles}
                />
              </td>
              <td className="p-2 text-gray-600">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="p-2 text-gray-600">
                {user.last_login
                  ? new Date(user.last_login).toLocaleDateString()
                  : "Never"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-8">Role Definitions</h2>
      <table className="w-full border-collapse my-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.name} className="border-t border-gray-300">
              <td className="p-2 font-medium">{role.name}</td>
              <td className="p-2">{role.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
