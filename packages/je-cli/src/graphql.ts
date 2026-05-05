import { getToken, getBaseUrl } from "./config";
import { info } from "./output";

// Exit codes
export const EXIT_USAGE = 1;
export const EXIT_AUTH = 3;
export const EXIT_NOT_FOUND = 4;
export const EXIT_API = 5;

export async function gql<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const token = getToken();
  if (!token) {
    info("Not logged in. Run: je login");
    process.exit(EXIT_AUTH);
  }

  const base = getBaseUrl();
  const res = await fetch(`${base}/api/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      info("Authentication failed. Try: je login");
      process.exit(EXIT_AUTH);
    }
    info(`API error: ${res.status} ${res.statusText}`);
    process.exit(EXIT_API);
  }

  const json = await res.json();
  if (json.errors?.length) {
    const msg = json.errors[0].message;
    info(`Error: ${msg}`);
    if (msg.includes("permission") || msg.includes("logged in")) {
      process.exit(EXIT_AUTH);
    }
    if (msg.includes("not found") || msg.includes("Not found")) {
      process.exit(EXIT_NOT_FOUND);
    }
    process.exit(EXIT_API);
  }

  return json.data;
}
