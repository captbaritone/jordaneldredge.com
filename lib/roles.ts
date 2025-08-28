/**
 * User role definitions for the application
 */

// Define all available roles as a union type
export type UserRole = 'admin' | 'trusted' | 'untrusted' | 'anonymous';

// Role descriptions for display in the UI
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  'admin': 'Administrator with full access to all features',
  'trusted': 'Trusted user with expanded permissions',
  'untrusted': 'Standard user with limited permissions',
  'anonymous': 'Not logged in (no account)'
};

// Check if a string is a valid role
export function isValidRole(role: string): role is UserRole {
  return ['admin', 'trusted', 'untrusted', 'anonymous'].includes(role as UserRole);
}

// Get all available roles
export function getAllRoles(): UserRole[] {
  return ['admin', 'trusted', 'untrusted', 'anonymous'];
}
