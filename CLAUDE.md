# jordaneldredge.com

Personal website built with Next.js 16, SQLite (better-sqlite3), and Grats for GraphQL.

## Key commands

- `pnpm dev` — Start dev server (Turbopack)
- `pnpm grats` — Regenerate GraphQL schema after changing `@gql*` annotations
- `pnpm run migrate` — Run database migrations
- `pnpm test` — Run tests (vitest)
- `bash scripts/deploy.sh` — Deploy (pushes to origin, builds on VPS, restarts service)

## Deploying the server

`deploy.sh` pushes to GitHub, SSHs into the VPS (`jordan`), pulls, installs deps, runs migrations, builds, and restarts the systemd service. The `sudo systemctl restart` step will prompt for a password.

## Shipping the `je` CLI

The CLI lives in `packages/je-cli/`. To ship a new version:

```bash
# 1. Bump version in packages/je-cli/src/cli.ts (.version("x.y.z"))
# 2. Build binaries for both Mac architectures
cd packages/je-cli
~/.bun/bin/bun build src/cli.ts --compile --target=bun-darwin-arm64 --outfile je-darwin-arm64
~/.bun/bin/bun build src/cli.ts --compile --target=bun-darwin-x64 --outfile je-darwin-x64

# 3. Upload binaries
capt upload je-darwin-arm64
capt upload je-darwin-x64

# 4. Update the URLs in packages/je-cli/install.sh with the new capt.dev URLs

# 5. Install locally
~/.bun/bin/bun build src/cli.ts --compile --outfile je
cp je ~/bin/je

# 6. Clean up
rm je-darwin-arm64 je-darwin-x64

# 7. Commit and deploy the server (so /je/install/ serves the updated script)
```

Users install with: `curl -fsSL https://jordaneldredge.com/je/install/ | bash`

## GraphQL

Schema is code-first via Grats (`@gqlType`, `@gqlField`, `@gqlQueryField`, `@gqlMutationField` annotations). After changes, run `pnpm grats` to regenerate `app/api/graphql/schema.ts` and `schema.graphql`.

## Database

SQLite at `content.db`. Migrations in `db-migrations/migrations/` (numbered `NNN-name.ts`). Run with `pnpm run migrate`.
