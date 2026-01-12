# JordanEldredge.com Context

This is Jordan Eldredge's personal website built with Next.js. It's a hybrid content platform combining blog posts (markdown files in git) and Notes (from Notion API), all normalized into a SQLite database.

## Project Overview

**Tech Stack:**
- Next.js 16 with React 19
- TypeScript
- SQLite database (content.db) for content management and caching
- Notion API for Notes content
- GraphQL API (via GraphQL Yoga + Grats)
- Tailwind CSS for styling
- Iron Session for authentication
- Vitest for testing

**Package Manager:** pnpm

## Architecture

### Content System
1. **Two Content Types:**
   - **Blog Posts**: Markdown files in `_posts/` directory with frontmatter metadata, committed to git
   - **Notes**: Written in Notion, fetched via Notion API

2. **Providers**: Each content type has a provider (`lib/providers/`) that:
   - Fetches content from its source
   - Normalizes to common markdown format
   - Writes to SQLite database
   - Handles incremental updates via timestamps

3. **SQLite Database** (`content.db`):
   - Central content cache
   - Full-text search (FTS5 virtual tables)
   - Metadata storage
   - PageRank calculations
   - Related posts computation

### Key Features

**Search**: SQLite FTS5 full-text search across all content

**Tags**: Posts have tags (from frontmatter or Notion attributes) used for:
- Related posts calculation
- Tag pages at `/tag/{tagName}`
- PageRank graph enrichment

**Related Posts**: Computed by tag overlap, tie-broken by PageRank

**PageRank**: Custom implementation ranking content importance based on:
- Internal links within content
- Tag relationships
- External notable links (manually curated)
- Powers the `/all` page

**Backups**: Notion content backed up to git via `pnpm run backup`

**RSS Feeds**: Generated from SQLite database

## Directory Structure

```
_posts/          # Blog post markdown files
_notes/          # Cached Notion content (git backup)
_drafts/         # Draft posts
_pages/          # Static pages
app/             # Next.js app directory
lib/
  components/    # React components (e.g., Markdown.js for rendering)
  providers/     # Content providers (posts, notes)
db-migrations/   # SQLite schema migrations
scripts/         # Utility scripts (backup, reindex, etc.)
build/           # Build output
content.db       # SQLite database
```

## Common Commands

```bash
pnpm dev              # Start dev server (with Turbopack)
pnpm build            # Production build
pnpm test             # Run Vitest tests
pnpm lint             # Run ESLint + remark
pnpm lint-md          # Lint markdown files
pnpm reindex          # Rebuild content index (smart: only updates changed content)
pnpm reindex -- --force          # Force reindex all content (ignores timestamps)
pnpm reindex -- --filter=slug    # Reindex only content matching slug substring
pnpm backup           # Backup Notion content to git
pnpm rebuild-search-index  # Rebuild FTS search index
pnpm migrate          # Run database migrations
pnpm grats            # Generate GraphQL schema
```

### Reindex Command Details

The reindex command (`pnpm reindex`) intelligently updates the SQLite database:

- **Smart indexing (default)**: Only reindexes content that has changed since last index
  - Blog posts: Compares file modification timestamps
  - Notes: Compares Notion's `last_edited_time`
  - Skips unchanged content with "Skipping indexing {slug}" message

- **Flags:**
  - `--force`: Forces reindexing of all content, ignoring timestamps
    - Useful after code changes to indexing logic or markdown processing
    - Example: `pnpm reindex -- --force`

  - `--filter=substring`: Only reindexes content where slug contains substring
    - Useful for debugging specific posts or testing changes
    - Example: `pnpm reindex -- --filter=aliasing`
    - Can be combined with `--force`: `pnpm reindex -- --force --filter=alias`

- **Process**: For each content item being indexed:
  1. Provider enumerates all available content (posts + notes)
  2. Checks if reindex needed (timestamp comparison, unless --force)
  3. Resolves full content from provider (fetches from Notion or reads file)
  4. Processes markdown and extracts metadata
  5. Updates SQLite with content, images, links, tweets, YouTube embeds
  6. Updates full-text search index

## Key Files

- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration
- `content.db` - SQLite database (binary)
- `lib/components/Markdown.js` - Markdown AST renderer with custom directives
- `README.md` - Detailed architecture documentation

## Custom Markdown Directives

The site supports custom remark directives:
- `:tweet{status="id"}` - Embed tweets
- `:youtube{token="id"}` - Embed YouTube videos
- `:audio{src="url"}` - Audio players
- `:animatedCursor{url="..." selector="..."}` - Animated cursors

Audio/video links (`.mp3`, `.mp4`, etc.) are auto-converted to media players.

## Development Notes

- **Reindexing**: Visit `/api/reindex` endpoint or run `pnpm reindex` to update content cache
- **Content Changes**: Blog posts are auto-detected via file timestamps, Notion via `last_edited_time`
- **Notion API**: Requires API key in `.env`
- **GraphQL**: Schema generated via Grats from TypeScript types
- **Linting**: Uses remark for markdown, ESLint for code
- **Testing**: Vitest with React Testing Library

## Authentication

Uses iron-session with WebAuthn support for admin features.

## External Integrations

- Notion API for Notes content
- AWS S3 for media storage (via `@aws-sdk/client-s3`)
- OpenAI API (for AI features)

## Style Guide

This project has specific markdown style preferences enforced via remark:
- Fenced code blocks (not indented)
- Consistent heading hierarchy
- See `.remarkrc.mjs` and `remarkConfig` in package.json

## Important Patterns

1. **Always read files before editing** - Understand existing patterns
2. **Preserve git-based content** - Blog posts are version-controlled
3. **Respect the provider abstraction** - Content normalization happens in providers
4. **SQLite is the source of truth** - All rendered content comes from the database
5. **PageRank matters** - Link structure and tags affect content visibility

## When Working on Features

- **Content changes**: Consider both blog posts and Notes
- **Search changes**: May need to rebuild FTS index
- **Link changes**: May affect PageRank calculations
- **Schema changes**: Create migration in `db-migrations/`
- **GraphQL changes**: Run `pnpm grats` to regenerate schema
