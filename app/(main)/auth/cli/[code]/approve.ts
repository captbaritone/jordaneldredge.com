"use server";

import { randomBytes } from "crypto";
import { getSession } from "../../../../../lib/session";
import { prepare, sql } from "../../../../../lib/db";
import { User } from "../../../../../lib/data/User";

export async function approve(code: string) {
  const session = await getSession();
  if (!session.userId) {
    throw new Error("You must be logged in");
  }

  const user = User.findById(session.userId);
  if (!user || !["admin", "trusted"].includes(user.role)) {
    throw new Error("You don't have permission to use the CLI");
  }

  // Verify the auth request exists and is pending
  const request = GET_AUTH_REQUEST.get(code);
  if (!request) {
    throw new Error("Invalid or expired authorization code");
  }

  if (request.status !== "pending") {
    throw new Error("This code has already been used");
  }

  if (new Date(request.expires_at) < new Date()) {
    throw new Error("This code has expired");
  }

  // Generate a token and store it
  const token = randomBytes(32).toString("hex");

  INSERT_TOKEN.run(session.userId, token, `CLI (${new Date().toISOString()})`);
  APPROVE_AUTH_REQUEST.run(token, session.userId, code);

  return { success: true, username: user.username };
}

const GET_AUTH_REQUEST = prepare<
  [string],
  { status: string; expires_at: string }
>(sql`
  SELECT
    status,
    expires_at
  FROM
    cli_auth_requests
  WHERE
    code = ?
`);

const INSERT_TOKEN = prepare<[number, string, string], void>(sql`
  INSERT INTO
    api_tokens (user_id, token, name)
  VALUES
    (?, ?, ?)
`);

const APPROVE_AUTH_REQUEST = prepare<[string, number, string], void>(sql`
  UPDATE cli_auth_requests
  SET
    status = 'approved',
    token = ?,
    user_id = ?
  WHERE
    code = ?
`);
