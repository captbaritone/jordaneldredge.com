"use client";
import { logout } from "./register/auth";

export default function LogoutButton() {
  return (
    <button
      onClick={async () => {
        await logout();
        alert("Logged out");
        // Reload the page to show the authenticated state
        location.reload();
      }}
    >
      Logout
    </button>
  );
}
