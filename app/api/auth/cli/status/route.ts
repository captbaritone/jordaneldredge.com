import { NextRequest, NextResponse } from "next/server";
import { prepare, sql } from "../../../../../lib/db";

// GET /api/auth/cli/status?code=XXXX — poll for CLI auth approval
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }

  const row = GET_AUTH_REQUEST.get(code);
  if (!row) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 404 });
  }

  if (new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: "Code expired" }, { status: 410 });
  }

  if (row.status === "approved" && row.token) {
    // Clean up the auth request after successful retrieval
    DELETE_AUTH_REQUEST.run(code);
    return NextResponse.json({ status: "approved", token: row.token });
  }

  return NextResponse.json({ status: row.status });
}

const GET_AUTH_REQUEST = prepare<
  [string],
  { status: string; token: string | null; expires_at: string }
>(sql`
  SELECT
    status,
    token,
    expires_at
  FROM
    cli_auth_requests
  WHERE
    code = ?
`);

const DELETE_AUTH_REQUEST = prepare<[string], void>(sql`
  DELETE FROM cli_auth_requests
  WHERE
    code = ?
`);
