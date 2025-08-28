"use client";

import { useTransition, useState } from "react";
import { deleteUser } from "./actions";

interface DeleteUserButtonProps {
  userId: number;
  username: string;
}

export default function DeleteUserButton({ userId, username }: DeleteUserButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openConfirm = () => setIsConfirmOpen(true);
  const closeConfirm = () => setIsConfirmOpen(false);

  // Form action that will be called when the form is submitted
  async function formAction(formData: FormData) {
    setError(null);
    
    startTransition(async () => {
      try {
        const result = await deleteUser(userId);
        closeConfirm();
        
        // Show alert with success message
        alert(result.message);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete user";
        setError(errorMessage);
        
        // Show alert with error message
        alert(`Error: ${errorMessage}`);
      }
    });
  }

  return (
    <>
      <button
        onClick={openConfirm}
        className="text-red-600 hover:text-red-800 font-medium text-sm"
        aria-label={`Delete user ${username}`}
      >
        Delete
      </button>

      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm User Deletion</h3>
            <p className="mb-4">
              Are you sure you want to delete user <strong>{username}</strong>? This action cannot be undone.
            </p>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <form action={formAction}>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeConfirm}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                  disabled={isPending}
                >
                  {isPending ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
