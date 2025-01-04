import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

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

export async function userIsAdmin() {
  const session = await getSession();
  return session.userId === Number(process.env.ADMIN_ID);
}
