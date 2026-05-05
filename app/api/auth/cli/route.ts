import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prepare, sql } from "../../../../lib/db";

// POST /api/auth/cli — initiate a CLI auth request
// Returns a short code for the user to approve in their browser
export async function POST(request: Request) {
  const code = randomBytes(4).toString("hex"); // 8 char hex code
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  INSERT_AUTH_REQUEST.run(code, expiresAt.toISOString());

  const origin = new URL(request.url).origin;

  return NextResponse.json({
    code,
    expires_at: expiresAt.toISOString(),
    auth_url: `${origin}/auth/cli/${code}`,
  });
}

const INSERT_AUTH_REQUEST = prepare<[string, string], void>(sql`
  INSERT INTO
    cli_auth_requests (code, status, expires_at)
  VALUES
    (?, 'pending', ?)
`);
