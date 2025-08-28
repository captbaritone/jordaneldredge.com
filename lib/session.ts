import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { UserRole } from "./roles";
import { db } from "./db";

export interface SessionData {
  userId?: number;
  username?: string;
  challenge?: string;
}

export const sessionOptions: SessionOptions = {
  // You need to create a secret key at least 32 characters long.
  password: process.env.SESSION_SECRET!,
  cookieName: "jordaneldredge-session",
  cookieOptions: {
    httpOnly: true,
    // Secure only works in `https` environments. So if the environment is `https`, it'll return true.
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  // https://github.com/vvo/iron-session/issues/690
  return await getIronSession<SessionData>(
    // In version 14 and earlier, cookies was a synchronous function. To help
    // with backwards compatibility, you can still access it synchronously in
    // Next.js 15, but this behavior will be deprecated in the future.
    //
    // https://nextjs.org/docs/app/api-reference/functions/cookies#good-to-know
    (await cookies()) as any,
    sessionOptions,
  );
}

// Helper function to get user's role
async function getUserRole(): Promise<UserRole> {
  const session = await getSession();
  
  // Not logged in
  if (!session.userId) return 'anonymous';
  
  // Legacy support: if user is admin by ID
  if (session.userId === Number(process.env.ADMIN_ID)) return 'admin';
  
  // Look up user role from database
  const result = db.prepare("SELECT role FROM users WHERE id = ?").get(session.userId) as { role: UserRole } | undefined;
  return result?.role || 'untrusted';
}

// Specific permission checkers with simple role checks
export async function userCanCreatePaste(): Promise<boolean> {
  const role = await getUserRole();
  return ['admin', 'trusted'].includes(role);
}

export async function userCanEditPaste(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin' || role === 'trusted';
}

export async function userCanDeletePaste(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

export async function userCanDebugContent(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

export async function userCanReindexContent(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

// Admin-only access functions
export async function userCanManageRoles(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

export async function userCanViewContentDebug(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

export async function userCanViewAdminUI(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

export async function userCanViewAnyPaste(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

export async function userCanEditAnyPaste(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

export async function userCanViewOwnPastes(): Promise<boolean> {
  const role = await getUserRole();
  return ['admin', 'trusted', 'untrusted'].includes(role);
}

export async function userCanPostComments(): Promise<boolean> {
  const role = await getUserRole();
  return ['admin', 'trusted'].includes(role);
}

// Legacy function for backward compatibility
export async function userIsAdmin(): Promise<boolean> {
  console.warn('userIsAdmin is deprecated. Use a more specific permission function instead.');
  const role = await getUserRole();
  return role === 'admin';
}
