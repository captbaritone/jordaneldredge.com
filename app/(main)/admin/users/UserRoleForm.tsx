"use client";

import { useTransition } from "react";
import { updateUserRole } from "./actions";
import { UserRole } from "../../../../lib/roles";

interface Role {
  name: UserRole;
  description: string;
}

interface UserRoleFormProps {
  userId: number;
  currentRole: UserRole;
  roles: Role[];
}

export default function UserRoleForm({
  userId,
  currentRole,
  roles,
}: UserRoleFormProps) {
  const [isPending, startTransition] = useTransition();

  // Form action that will be called when the form is submitted
  async function formAction(formData: FormData) {
    const newRole = formData.get("role") as UserRole;

    if (newRole === currentRole) {
      return;
    }

    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
      } catch (error) {
        console.error("Failed to update role:", error);
      }
    });
  }

  // Handle change event to auto-submit the form
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value !== currentRole) {
      const form = e.target.form;
      if (form) {
        form.requestSubmit();
      }
    }
  }

  return (
    <form action={formAction} className="flex items-center">
      <select
        name="role"
        defaultValue={currentRole}
        onChange={handleChange}
        disabled={isPending}
        className="p-1 border rounded text-sm w-32 min-w-max"
        title="Change user role"
      >
        {roles.map((role) => (
          <option key={role.name} value={role.name}>
            {role.name}
          </option>
        ))}
      </select>

      {isPending && (
        <span className="ml-2 text-xs text-gray-600">Updating...</span>
      )}
    </form>
  );
}
