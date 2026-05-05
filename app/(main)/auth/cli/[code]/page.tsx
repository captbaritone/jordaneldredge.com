import { notFound } from "next/navigation";
import { getSession } from "../../../../../lib/session";
import { prepare, sql } from "../../../../../lib/db";
import { ApproveButton } from "./ApproveButton";
import LoginButton from "../../../../LoginButton";

export default async function CliAuthPage(props: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await props.params;
  const session = await getSession();

  if (!session.userId) {
    return (
      <div className="markdown">
        <h1>Authorize CLI</h1>
        <p>You must log in before authorizing the CLI.</p>
        <div className="mb-4 [&>button]:bg-blue-600 [&>button]:text-white [&>button]:px-4 [&>button]:py-2 [&>button]:rounded [&>button]:hover:bg-blue-700">
          <LoginButton />
        </div>
      </div>
    );
  }

  const request = GET_AUTH_REQUEST.get(code);
  if (!request || request.status !== "pending") {
    return notFound();
  }

  if (new Date(request.expires_at) < new Date()) {
    return (
      <div className="markdown">
        <h1>Code Expired</h1>
        <p>This authorization code has expired. Please try again from the CLI.</p>
      </div>
    );
  }

  return (
    <div className="markdown">
      <h1>Authorize CLI</h1>
      <p>
        A CLI tool is requesting access to your account. If you initiated this
        request, click the button below to authorize it.
      </p>
      <p>
        Code: <code>{code}</code>
      </p>
      <ApproveButton code={code} />
    </div>
  );
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
