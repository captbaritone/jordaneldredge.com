# jordaneldredge.com

Personal website of Jordan Eldredge. Blog posts, notes, and pastes.

## GraphQL API

Endpoint: `https://jordaneldredge.com/api/graphql` (GraphiQL available at same URL)

Authenticated requests use `Authorization: Bearer <token>`. Tokens are obtained via the `je` CLI login flow.

**Queries:** search content, list blog posts, list notes, get content by slug, list/get pastes (authenticated).

**Mutations (authenticated):** create/update/delete pastes.

Use introspection queries to discover the full schema.

## CLI Tool (`je`)

Standalone binary for interacting with the site. Use `je --help` and `je <command> --help` for details. `je schema` dumps full command structure as JSON.

**Commands:** `je login`, `je paste list|create|get|edit|delete`.

**Agent-friendly:** Auto JSON when piped, stderr for messages, structured responses, `je schema` for introspection, distinct exit codes (0=ok, 1=usage, 3=auth, 4=not found, 5=API error), `--quiet` flag.
