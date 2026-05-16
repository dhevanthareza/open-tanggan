# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Open Tanggan is a Nuxt 3 app for managing Indonesian neighborhood (RW) resident data. It uses Google Sheets as the database — there is no traditional DB. All persistent data lives in a Google Spreadsheet with three tabs: `families`, `members`, and `admins`.

## Commands

```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Build for production (Cloudflare Pages preset)
pnpm preview      # Preview production build
pnpm typecheck    # TypeScript type checking (no test suite exists)
```

## Architecture

### Data Layer — Google Sheets as Database

`server/utils/sheets.ts` provides the entry point: `getDoc()` (cached 10 min) and `getSheet(title)`. All server utilities call these to read/write rows via the `google-spreadsheet` library.

- `server/utils/families.ts` — CRUD for the `families` sheet
- `server/utils/members.ts` — CRUD for the `members` sheet; **always delete rows in reverse order** to preserve indices
- `server/utils/admins.ts` — reads `admins` sheet, cached 60 seconds via Nitro's `defineCachedFunction`

IDs are generated as `F${Date.now()}` (families) and `M${Date.now()}${index}` (members) — no UUID library.

### Auth Flow

1. User hits `/auth/google` → `server/routes/auth/google.get.ts` (OAuth handler from `nuxt-auth-utils`)
2. On success, checks the `admins` sheet via `findAdmin(email)`; redirects to `/unauthorized` if not found
3. Session is set with `SessionUser` shape: `{ email, nama, picture, role, rt }`
4. Client-side `middleware/auth.global.ts` gates all pages except `/login` and `/unauthorized`

### Authorization

`server/utils/authz.ts` has two helpers used in every API route:
- `requireAdmin(event)` — ensures a valid session exists, returns `SessionUser`
- `assertCanEditRt(user, targetRt)` — throws 403 if `rt_admin` tries to edit a different RT's data

`rw_admin` (rt = `'*'`) has full access. `rt_admin` can only edit their own RT.

### API Routes

File-based routing in `server/api/families/`:
- `index.get.ts` — list all families with member counts
- `index.post.ts` — create family + members atomically
- `[id].get.ts` — get family detail with members
- `[id].put.ts` — update family + replace all members
- `[id].delete.ts` — rw_admin only; deletes members first, then family

### Client Data Fetching

`queries/families.ts` — TanStack Query composables (`useFamilies`, `useFamily`, `useCreateFamily`, `useUpdateFamily`, `useDeleteFamily`). All mutations invalidate relevant query keys. The plugin `plugins/vue-query.ts` sets up the QueryClient.

### Validation

`schemas/index.ts` — Zod schemas (`familyInput`, `memberInput`) used on the server side in API routes via `.parse()`. Types in `types/index.ts` are the source of truth for shapes across client and server.

### Deployment Target

`nuxt.config.ts` sets `nitro.preset: 'cloudflare-pages'`. PWA is disabled in dev (`devOptions.enabled: false`).

## Key Environment Variables

| Variable | Purpose |
|---|---|
| `NUXT_SESSION_PASSWORD` | Session encryption (64-char hex) |
| `NUXT_OAUTH_GOOGLE_CLIENT_ID/SECRET` | Google OAuth |
| `NUXT_GOOGLE_SERVICE_ACCOUNT_EMAIL/KEY` | Sheets API service account |
| `NUXT_SHEET_ID` | Google Spreadsheet ID |
| `NUXT_PUBLIC_APP_NAME` | UI display name |

The `private_key` in `NUXT_GOOGLE_SERVICE_ACCOUNT_KEY` must use literal `\n` characters (not real newlines). `sheets.ts` handles the conversion with `.replace(/\\n/g, '\n')`.

## Gotchas

- **No test suite** — use `pnpm typecheck` to catch type errors
- **Sheets API rate limits**: 60 reads/min per user, 300/min per project — avoid unnecessary reads
- **Admin cache**: `getAdmins()` is cached 60s by Nitro — newly added admins can take up to 1 minute to gain access
- **Row deletion**: must always delete from end-to-start (`.reverse()`) to avoid index shifting corrupting other rows
- **`active` field**: must be the string `'TRUE'` in the spreadsheet — `'false'` or `'False'` is treated as active due to the uppercase comparison
