import { userCanManageRoles } from "../../../../lib/session";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import UserRoleForm from "./UserRoleForm";
import DeleteUserButton from "./DeleteUserButton";
import { getAllRoles, ROLE_DESCRIPTIONS } from "../../../../lib/roles";
import { User } from "../../../../lib/data/User";

export const metadata: Metadata = {
  title: "Manage Users",
};

interface Role {
  name: string;
  description: string;
}

export default async function ManageUsers() {
  const canManageRoles = await userCanManageRoles();
  if (!canManageRoles) {
    notFound();
  }

  // Get all users with their detailed information
  const users = User.findAll();

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
            <th className="p-2 text-left">Actions</th>
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
              <td className="p-2">
                {/* Don't allow deleting admin users */}
                {user.role === "admin" ? (
                  <span className="text-gray-400 text-sm">Administrator</span>
                ) : (
                  <DeleteUserButton userId={user.id} username={user.username} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
