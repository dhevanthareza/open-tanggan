# Build Plan: Open Tanggan — Open-Source RW Data Management

> **Open Tanggan** ("my warga") — a free, open-source neighborhood data management app for Indonesian RW units. Nuxt SSR + Google Sheets + Cloudflare Pages. Designed to run free forever.

## 1. Project Overview

Build a serverless web app to manage resident data for an Indonesian RW (Rukun Warga / neighborhood unit). Data is grouped by family (Kepala Keluarga + members). The app must be free to host and run.

**Source data shape (from physical form):**

Each family unit has:
- Family head info: `Nama Kepala Keluarga`, `Alamat`, `RT`, `RW`, `Nomor Telp. Rumah`
- Members table: `No`, `Nama Lengkap`, `Tempat tanggal lahir`, `Hub. kel.` (Suami/Istri/Anak), `Gol. darah`, `No. HP`

One family → many members. Typical scale: 50–200 families, 200–800 people total per RW.

## 2. Core Principles (READ FIRST)

This project is intentionally **small**. Optimize for clarity over cleverness.

### KISS — Keep It Simple
- **One way to do things.** Don't add abstractions until they're needed twice. YAGNI applies.
- **Flat over nested.** Prefer flat file structure and shallow component trees.
- **Vanilla first.** Use platform/framework defaults before reaching for libraries. If Nuxt has a built-in way, use it.
- **No premature optimization.** Caching, memoization, etc. only where measured to matter.
- **Boring code wins.** A junior dev should read any file and understand it in 30 seconds.

### DRY — But Not Religiously
- **Extract on the third repetition, not the second.** Two similar things can stay separate.
- **Shared types in `types/index.ts`** — define `Family`, `Member`, `Admin`, `SessionUser` once, import everywhere.
- **One Zod schema per entity** — reuse for API validation AND form validation.
- **One Sheets helper per entity** — `families.ts`, `members.ts`, `admins.ts` in `server/utils/`. Don't repeat the `getRows().map(...)` pattern.
- **Composables/queries for repeated client logic** — but only after you've written the same code 3+ times.

### Anti-Patterns to Avoid
- ❌ Wrapping `$fetch` with a wrapper that adds no value
- ❌ Generic "BaseForm" / "BaseTable" components for a 5-page app
- ❌ Multiple layers of indirection (service → repository → DAO)
- ❌ Custom hooks for things that work fine with framework primitives
- ❌ Speculative configuration ("we might need this someday")
- ❌ Over-typing — `any` is fine for OAuth library payloads we don't control

## 3. Tech Stack (Locked Decisions)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Nuxt 3 (SSR mode)** | SSR keeps API keys server-side, supports PWA |
| Language | **TypeScript** | Type safety end-to-end |
| Auth | **`nuxt-auth-utils` + Google OAuth** | Minimal, encrypted cookie sessions |
| Data store | **Google Sheets** (via `google-spreadsheet` + Service Account) | Free, familiar to non-technical admins |
| Authorization | **`admins` sheet (email allowlist + role)** | Non-coders can manage admins by editing a sheet |
| **Data fetching (client)** | **TanStack Query (`@tanstack/vue-query`)** | Caching, mutations, optimistic updates, devtools |
| PWA | **`@vite-pwa/nuxt`** | Installable, offline reads |
| Styling | **Tailwind CSS** (via `@nuxtjs/tailwindcss`) | Fast UI, mobile-friendly |
| UI components | **shadcn-vue** | Copy-paste components, no runtime dep, full ownership |
| Hosting | **Cloudflare Pages** (preferred) or Vercel | Free, edge in Jakarta = low latency for Indonesia |
| Caching (server) | **`defineCachedFunction`** from Nitro | Reduce Sheets API calls |
| Package manager | **pnpm** | Fast, disk-efficient |
| Node version | **20.x LTS** | Required by Nuxt 3 |
| Validation | **Zod** | Same schema for API + forms |

**Do NOT use:**
- Pinia (TanStack Query handles server state; `useState` handles local UI state)
- Headless UI, PrimeVue, Vuetify, etc. (we have shadcn-vue)
- Any paid service (Auth0, Clerk, Firebase paid tier, etc.)
- Client-side Sheets API calls (security risk)
- Apps Script (we have a real server now)
- `useFetch` / `useAsyncData` for client interactions — use TanStack Query (see §8.11)

## 4. Functional Requirements

### MVP Features
1. **Auth**
   - Login via "Sign in with Google" button
   - Server checks email against `admins` sheet — non-admins are rejected at OAuth callback
   - Session stored in encrypted cookie (7-day expiry)
   - Logout button

2. **Family list (`/`)**
   - Table/cards showing all families: `Kepala Keluarga`, `Alamat`, `RT`, jumlah anggota
   - Search by name (kepala keluarga or any member)
   - Filter by RT
   - Pagination if >50 families

3. **Family detail (`/family/[id]`)**
   - All family head fields + table of members
   - Edit button (rw_admin always, rt_admin only for same RT)

4. **Add family (`/family/new`)**
   - Form for family head info + dynamic member rows (add/remove)
   - Validates required fields

5. **Edit family (`/family/[id]/edit`)**
   - Same form, pre-populated
   - Edit members inline (add/remove/modify)
   - Delete family button (with confirm)

6. **Export**
   - "Export to Excel" button → downloads `.xlsx` of all data the user can see

### Roles
- `rw_admin`: full access (all RTs)
- `rt_admin`: read all, edit only own RT

### Out of Scope (for MVP)
- Photo uploads (KTP, family photo)
- Statistics dashboard
- Import from existing Excel
- Public-facing pages for warga
- Offline writes (only offline reads)

## 5. Google Sheets Schema

Create ONE Google Spreadsheet with **three tabs**:

### Tab: `families`
| Column | Type | Notes |
|---|---|---|
| id | string | Format: `F` + timestamp, e.g. `F1737000000000` |
| kepala_keluarga | string | Required |
| alamat | string | Required |
| rt | string | Required, e.g. `01` |
| rw | string | Required, e.g. `XI` |
| no_telp_rumah | string | Optional |
| created_at | ISO datetime | Auto-filled |
| updated_at | ISO datetime | Auto-filled |

### Tab: `members`
| Column | Type | Notes |
|---|---|---|
| id | string | Format: `M` + timestamp + random suffix |
| family_id | string | FK to families.id |
| urutan | number | 1, 2, 3... (display order in family) |
| nama_lengkap | string | Required |
| tempat_lahir | string | Optional |
| tanggal_lahir | string | ISO date `YYYY-MM-DD`, optional |
| hub_kel | string | One of: `Suami`, `Istri`, `Anak`, `Lainnya` |
| gol_darah | string | One of: `A`, `B`, `AB`, `O`, `-` |
| no_hp | string | Optional |
| created_at | ISO datetime | Auto-filled |

### Tab: `admins`
| Column | Type | Notes |
|---|---|---|
| email | string | Google account email |
| nama | string | Display name |
| role | string | `rw_admin` or `rt_admin` |
| rt | string | `*` for rw_admin, specific RT for rt_admin |
| active | boolean | TRUE/FALSE to enable/disable without deleting |

**Seed `admins` with at least your own email as `rw_admin` / `*` / TRUE before testing.**

## 6. Project Structure

Flat and minimal. No `services/`, `repositories/`, or other layers.

```
data-warga-rw/
├── nuxt.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── .env.example
├── .env                          # gitignored
├── .gitignore
├── README.md
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── apple-touch-icon.png
│   └── favicon.ico
├── assets/css/main.css           # Tailwind directives
├── server/
│   ├── routes/auth/google.get.ts # OAuth callback
│   ├── api/
│   │   ├── auth/
│   │   │   └── logout.post.ts
│   │   ├── families/
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   ├── [id].get.ts
│   │   │   ├── [id].put.ts
│   │   │   └── [id].delete.ts
│   │   └── export.get.ts         # xlsx export
│   └── utils/
│       ├── sheets.ts             # Doc + getSheet helper
│       ├── families.ts           # Family CRUD against sheet
│       ├── members.ts            # Member CRUD against sheet
│       ├── admins.ts             # Admin lookup (cached)
│       └── authz.ts              # requireAdmin, canEditRt
├── plugins/
│   └── vue-query.ts              # TanStack Query setup (SSR-aware)
├── middleware/
│   └── auth.global.ts            # Redirect to /login if no session
├── queries/                      # ALL TanStack Query keys + fns live here
│   └── families.ts               # familyKeys, useFamilies, useFamily, useCreateFamily, etc.
├── components/
│   ├── ui/                       # shadcn-vue components (Button, Input, Dialog, Table, etc.)
│   ├── AppHeader.vue
│   ├── FamilyForm.vue            # Used by both /family/new and /family/[id]/edit
│   ├── MemberRow.vue
│   └── ConfirmButton.vue         # Small inline confirm; no modal library
├── lib/
│   └── utils.ts                  # shadcn-vue's cn() helper
├── pages/
│   ├── index.vue                 # Family list
│   ├── login.vue
│   ├── unauthorized.vue
│   └── family/
│       ├── new.vue
│       └── [id]/
│           ├── index.vue         # Detail
│           └── edit.vue
├── types/index.ts                # All shared types
├── schemas/index.ts              # All Zod schemas (shared API + forms)
├── app.vue
└── error.vue
```

**Why this structure:**
- `queries/families.ts` co-locates query keys, query fns, and mutations for the families entity — one file, one entity.
- `server/utils/families.ts` co-locates Sheets read/write for the families entity. Mirror structure to API for low cognitive load.
- `schemas/index.ts` is one file because the schemas are small. Split only if it grows past ~150 lines.
- No `composables/` folder yet — none needed. Add when there's repeated client logic.

## 7. Environment Variables

`.env.example`:
```bash
# Session encryption (REQUIRED) — generate with: openssl rand -hex 32
NUXT_SESSION_PASSWORD=

# Google OAuth credentials (for user login)
# From Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web app)
NUXT_OAUTH_GOOGLE_CLIENT_ID=
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=

# Google Service Account (for Sheets API)
# From Google Cloud Console → IAM → Service Accounts → Keys → JSON
NUXT_GOOGLE_SERVICE_ACCOUNT_EMAIL=
NUXT_GOOGLE_SERVICE_ACCOUNT_KEY=    # Private key with literal \n escapes

# Google Sheet
NUXT_SHEET_ID=                       # From sheet URL between /d/ and /edit

# App
NUXT_PUBLIC_APP_NAME="Data Warga RW XI"
```

**Critical:** `NUXT_GOOGLE_SERVICE_ACCOUNT_KEY` contains literal `\n` characters (not real newlines) in `.env`. The code must replace them: `key.replace(/\\n/g, '\n')`. This is the #1 thing that breaks first-time setups.

## 8. Implementation Details

### 8.0 shadcn-vue setup

shadcn-vue is **not a dependency** — it's a CLI that copies component source code into `components/ui/`. You own the code, can edit it freely, and have no runtime npm dependency to maintain.

**One-time setup:**

```bash
# Init shadcn-vue (interactive — pick defaults: TypeScript yes, Tailwind yes, components/ui, lib/utils.ts)
pnpm dlx shadcn-vue@latest init
```

This creates `components/ui/`, `lib/utils.ts` (with the `cn()` helper), and updates `tailwind.config.ts`.

**Add only the components we need** (don't add the whole library upfront — KISS):

```bash
pnpm dlx shadcn-vue@latest add button input label card table dialog
```

For later steps you may add: `form`, `select`, `dropdown-menu`, `toast`, `skeleton`. Add them only when you actually need them. **Do not pre-emptively add every component.**

**Usage pattern:**

```vue
<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
</script>

<template>
  <div class="space-y-2">
    <Label for="nama">Nama</Label>
    <Input id="nama" v-model="name" />
    <Button @click="submit">Simpan</Button>
  </div>
</template>
```

**Why shadcn-vue fits the KISS principle:**
- Zero runtime dependency — components are just `.vue` files in your repo
- You can read every line of every component you use
- Customize freely (change Button's variants, add new ones) without "fighting the library"
- Built on `radix-vue` for accessibility primitives — keyboard nav, focus management, ARIA all handled

**Rules for using shadcn-vue in this project:**
1. **Don't wrap shadcn primitives in your own components** unless you use the same wrapper in 3+ places. Just import `Button` directly in each page.
2. **Don't modify `components/ui/*` files** unless you have a real reason. They're the design system baseline.
3. **Custom components** (`FamilyForm.vue`, `MemberRow.vue`) compose shadcn primitives. They live in `components/` (not `components/ui/`).
4. **Theme tweaks** go in `assets/css/main.css` (the CSS variables shadcn-vue uses) — not by editing individual components.

### 8.1 `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: [
    'nuxt-auth-utils',
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-only (NOT exposed to client)
    sessionPassword: '',
    oauthGoogleClientId: '',
    oauthGoogleClientSecret: '',
    googleServiceAccountEmail: '',
    googleServiceAccountKey: '',
    sheetId: '',

    public: {
      appName: 'Data Warga RW',
    },
  },

  nitro: {
    preset: 'cloudflare-pages',  // change to 'vercel' or remove if using Vercel
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Data Warga RW',
      short_name: 'Warga RW',
      description: 'Manajemen data warga RW',
      theme_color: '#1e40af',
      background_color: '#ffffff',
      display: 'standalone',
      lang: 'id',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      navigateFallback: null,  // SSR app; don't fallback to index
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/api/families'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-families',
            expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,  // PWA in dev causes confusing caching
    },
  },
})
```

### 8.2 `server/utils/sheets.ts`

```typescript
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

let cachedDoc: GoogleSpreadsheet | null = null
let cachedAt = 0
const DOC_TTL = 10 * 60 * 1000  // 10 min

export async function getDoc(): Promise<GoogleSpreadsheet> {
  const now = Date.now()
  if (cachedDoc && now - cachedAt < DOC_TTL) return cachedDoc

  const config = useRuntimeConfig()
  const jwt = new JWT({
    email: config.googleServiceAccountEmail,
    key: config.googleServiceAccountKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const doc = new GoogleSpreadsheet(config.sheetId, jwt)
  await doc.loadInfo()

  cachedDoc = doc
  cachedAt = now
  return doc
}

export async function getSheet(title: 'families' | 'members' | 'admins') {
  const doc = await getDoc()
  const sheet = doc.sheetsByTitle[title]
  if (!sheet) throw createError({ statusCode: 500, message: `Sheet "${title}" not found` })
  return sheet
}
```

### 8.3 `server/utils/admins.ts` + `server/utils/authz.ts`

Split into two small files — one for data access, one for the request-level guard.

**`server/utils/admins.ts`:**

```typescript
import { defineCachedFunction } from 'nitropack/runtime'
import { getSheet } from './sheets'
import type { Admin } from '~/types'

// Cache admins list for 60s — auth check runs on most requests
export const getAdmins = defineCachedFunction(
  async (): Promise<Admin[]> => {
    const sheet = await getSheet('admins')
    const rows = await sheet.getRows()
    return rows
      .map(r => ({
        email: String(r.get('email') ?? '').toLowerCase().trim(),
        nama: String(r.get('nama') ?? ''),
        role: r.get('role') as Admin['role'],
        rt: String(r.get('rt') ?? ''),
        active: String(r.get('active')).toUpperCase() === 'TRUE',
      }))
      .filter(a => a.active && a.email)
  },
  { maxAge: 60, name: 'admins-list', getKey: () => 'all' },
)

export async function findAdmin(email: string): Promise<Admin | null> {
  const admins = await getAdmins()
  return admins.find(a => a.email === email.toLowerCase()) ?? null
}
```

**`server/utils/authz.ts`:**

```typescript
import type { H3Event } from 'h3'
import type { SessionUser } from '~/types'

export async function requireAdmin(event: H3Event): Promise<SessionUser> {
  const session = await requireUserSession(event)
  return session.user as SessionUser
}

export function canEditRt(user: SessionUser, targetRt: string): boolean {
  if (user.role === 'rw_admin') return true
  return user.role === 'rt_admin' && user.rt === targetRt
}

export function assertCanEditRt(user: SessionUser, targetRt: string): void {
  if (!canEditRt(user, targetRt)) {
    throw createError({ statusCode: 403, message: 'Tidak boleh mengubah data RT lain' })
  }
}
```

### 8.4 `server/routes/auth/google.get.ts`

```typescript
import { findAdmin } from '~/server/utils/admins'

export default defineOAuthGoogleEventHandler({
  config: { scope: ['email', 'profile'] },
  async onSuccess(event, { user }) {
    const admin = await findAdmin(user.email)
    if (!admin) return sendRedirect(event, '/unauthorized')

    await setUserSession(event, {
      user: {
        email: admin.email,
        nama: admin.nama,
        picture: user.picture,
        role: admin.role,
        rt: admin.rt,
      },
    })
    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('OAuth error:', error)
    return sendRedirect(event, '/login?error=oauth')
  },
})
```

### 8.5 `types/index.ts` — All shared types in one place

```typescript
export type Role = 'rw_admin' | 'rt_admin'

export interface SessionUser {
  email: string
  nama: string
  picture?: string
  role: Role
  rt: string  // '*' for rw_admin, specific RT for rt_admin
}

export interface Admin extends Omit<SessionUser, 'picture'> {
  active: boolean
}

export interface Family {
  id: string
  kepala_keluarga: string
  alamat: string
  rt: string
  rw: string
  no_telp_rumah: string
  created_at: string
  updated_at: string
}

export interface FamilyWithCount extends Family {
  member_count: number
}

export interface Member {
  id: string
  family_id: string
  urutan: number
  nama_lengkap: string
  tempat_lahir: string
  tanggal_lahir: string  // YYYY-MM-DD
  hub_kel: 'Suami' | 'Istri' | 'Anak' | 'Lainnya'
  gol_darah: 'A' | 'B' | 'AB' | 'O' | '-'
  no_hp: string
  created_at: string
}

export interface FamilyDetail extends Family {
  members: Member[]
}
```

### 8.6 `schemas/index.ts` — One Zod file, shared by API + forms

```typescript
import { z } from 'zod'

export const memberInput = z.object({
  nama_lengkap: z.string().min(1, 'Nama wajib diisi'),
  tempat_lahir: z.string().optional().default(''),
  tanggal_lahir: z.string().optional().default(''),
  hub_kel: z.enum(['Suami', 'Istri', 'Anak', 'Lainnya']),
  gol_darah: z.enum(['A', 'B', 'AB', 'O', '-']).optional().default('-'),
  no_hp: z.string().optional().default(''),
})

export const familyInput = z.object({
  kepala_keluarga: z.string().min(1, 'Nama kepala keluarga wajib diisi'),
  alamat: z.string().min(1, 'Alamat wajib diisi'),
  rt: z.string().min(1),
  rw: z.string().min(1),
  no_telp_rumah: z.string().optional().default(''),
  members: z.array(memberInput).min(1, 'Minimal 1 anggota'),
})

export type FamilyInput = z.infer<typeof familyInput>
export type MemberInput = z.infer<typeof memberInput>
```

Use the same schemas in API handlers (`familyInput.parse(body)`) and in forms (for client-side validation).

### 8.7 `server/utils/families.ts` — All Sheets read/write for families

Co-locate the Sheets logic. API handlers stay thin.

```typescript
import { getSheet } from './sheets'
import type { Family, FamilyWithCount } from '~/types'
import type { FamilyInput } from '~/schemas'

function rowToFamily(r: any): Family {
  return {
    id: r.get('id'),
    kepala_keluarga: r.get('kepala_keluarga'),
    alamat: r.get('alamat'),
    rt: r.get('rt'),
    rw: r.get('rw'),
    no_telp_rumah: r.get('no_telp_rumah') ?? '',
    created_at: r.get('created_at'),
    updated_at: r.get('updated_at'),
  }
}

export async function listFamilies(): Promise<FamilyWithCount[]> {
  const [famSheet, memSheet] = await Promise.all([getSheet('families'), getSheet('members')])
  const [famRows, memRows] = await Promise.all([famSheet.getRows(), memSheet.getRows()])

  const counts = memRows.reduce<Record<string, number>>((acc, r) => {
    const fid = r.get('family_id')
    acc[fid] = (acc[fid] ?? 0) + 1
    return acc
  }, {})

  return famRows.map(rowToFamily).map(f => ({ ...f, member_count: counts[f.id] ?? 0 }))
}

export async function findFamily(id: string): Promise<Family | null> {
  const sheet = await getSheet('families')
  const rows = await sheet.getRows()
  const row = rows.find(r => r.get('id') === id)
  return row ? rowToFamily(row) : null
}

export async function createFamily(input: FamilyInput): Promise<string> {
  const now = new Date().toISOString()
  const id = `F${Date.now()}`

  const sheet = await getSheet('families')
  await sheet.addRow({
    id,
    kepala_keluarga: input.kepala_keluarga,
    alamat: input.alamat,
    rt: input.rt,
    rw: input.rw,
    no_telp_rumah: input.no_telp_rumah,
    created_at: now,
    updated_at: now,
  })
  return id
}

export async function updateFamily(id: string, input: Omit<FamilyInput, 'members'>): Promise<void> {
  const sheet = await getSheet('families')
  const rows = await sheet.getRows()
  const row = rows.find(r => r.get('id') === id)
  if (!row) throw createError({ statusCode: 404, message: 'Keluarga tidak ditemukan' })

  row.assign({ ...input, updated_at: new Date().toISOString() })
  await row.save()
}

export async function deleteFamily(id: string): Promise<void> {
  const sheet = await getSheet('families')
  const rows = await sheet.getRows()
  const row = rows.find(r => r.get('id') === id)
  if (row) await row.delete()
}
```

### 8.8 `server/utils/members.ts` — Same shape for members

```typescript
import { getSheet } from './sheets'
import type { Member } from '~/types'
import type { MemberInput } from '~/schemas'

function rowToMember(r: any): Member {
  return {
    id: r.get('id'),
    family_id: r.get('family_id'),
    urutan: Number(r.get('urutan') ?? 0),
    nama_lengkap: r.get('nama_lengkap'),
    tempat_lahir: r.get('tempat_lahir') ?? '',
    tanggal_lahir: r.get('tanggal_lahir') ?? '',
    hub_kel: r.get('hub_kel'),
    gol_darah: r.get('gol_darah') ?? '-',
    no_hp: r.get('no_hp') ?? '',
    created_at: r.get('created_at'),
  }
}

export async function listMembersByFamily(familyId: string): Promise<Member[]> {
  const sheet = await getSheet('members')
  const rows = await sheet.getRows()
  return rows
    .filter(r => r.get('family_id') === familyId)
    .map(rowToMember)
    .sort((a, b) => a.urutan - b.urutan)
}

export async function addMembers(familyId: string, members: MemberInput[]): Promise<void> {
  const sheet = await getSheet('members')
  const now = new Date().toISOString()
  const rows = members.map((m, i) => ({
    id: `M${Date.now()}${i}`,
    family_id: familyId,
    urutan: i + 1,
    ...m,
    created_at: now,
  }))
  await sheet.addRows(rows)
}

export async function replaceMembers(familyId: string, members: MemberInput[]): Promise<void> {
  // Delete existing members, then add new ones.
  // Simple and correct; fine at our scale (<20 members per family).
  const sheet = await getSheet('members')
  const rows = await sheet.getRows()
  const toDelete = rows.filter(r => r.get('family_id') === familyId)
  // Delete in reverse order to keep indices stable
  for (const row of toDelete.reverse()) await row.delete()
  await addMembers(familyId, members)
}

export async function deleteMembersByFamily(familyId: string): Promise<void> {
  const sheet = await getSheet('members')
  const rows = await sheet.getRows()
  const toDelete = rows.filter(r => r.get('family_id') === familyId)
  for (const row of toDelete.reverse()) await row.delete()
}
```

### 8.9 API endpoints — now slim

All API files now read like a checklist: auth → validate → call util → return.

**`server/api/families/index.get.ts`:**

```typescript
import { listFamilies } from '~/server/utils/families'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  return listFamilies()
})
```

**`server/api/families/index.post.ts`:**

```typescript
import { familyInput } from '~/schemas'
import { requireAdmin, assertCanEditRt } from '~/server/utils/authz'
import { createFamily } from '~/server/utils/families'
import { addMembers } from '~/server/utils/members'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const body = familyInput.parse(await readBody(event))
  assertCanEditRt(user, body.rt)

  const id = await createFamily(body)
  await addMembers(id, body.members)
  return { id }
})
```

**`server/api/families/[id].get.ts`:**

```typescript
import { findFamily } from '~/server/utils/families'
import { listMembersByFamily } from '~/server/utils/members'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')!

  const family = await findFamily(id)
  if (!family) throw createError({ statusCode: 404 })

  const members = await listMembersByFamily(id)
  return { ...family, members }
})
```

**`server/api/families/[id].put.ts`:**

```typescript
import { familyInput } from '~/schemas'
import { requireAdmin, assertCanEditRt } from '~/server/utils/authz'
import { findFamily, updateFamily } from '~/server/utils/families'
import { replaceMembers } from '~/server/utils/members'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const body = familyInput.parse(await readBody(event))

  const existing = await findFamily(id)
  if (!existing) throw createError({ statusCode: 404 })
  assertCanEditRt(user, existing.rt)
  assertCanEditRt(user, body.rt)  // also check new RT if changed

  const { members, ...familyFields } = body
  await updateFamily(id, familyFields)
  await replaceMembers(id, members)
  return { id }
})
```

**`server/api/families/[id].delete.ts`:**

```typescript
import { requireAdmin } from '~/server/utils/authz'
import { findFamily, deleteFamily } from '~/server/utils/families'
import { deleteMembersByFamily } from '~/server/utils/members'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  if (user.role !== 'rw_admin') {
    throw createError({ statusCode: 403, message: 'Hanya RW admin yang bisa hapus keluarga' })
  }
  const id = getRouterParam(event, 'id')!

  const existing = await findFamily(id)
  if (!existing) return { ok: true }

  await deleteMembersByFamily(id)
  await deleteFamily(id)
  return { ok: true }
})
```

That's the entire API. Five files, ~15 lines each.

### 8.10 `middleware/auth.global.ts`

```typescript
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  const publicPages = ['/login', '/unauthorized']
  if (!loggedIn.value && !publicPages.includes(to.path)) {
    return navigateTo('/login')
  }
})
```

Global middleware — runs on every route. No `definePageMeta` boilerplate per page.

### 8.11 `plugins/vue-query.ts` — TanStack Query, SSR-aware

```typescript
import {
  QueryClient,
  VueQueryPlugin,
  dehydrate,
  hydrate,
  type DehydratedState,
} from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxtApp) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,        // 30s — Sheets data isn't fast-changing
        gcTime: 5 * 60 * 1000,       // 5 min
        refetchOnWindowFocus: false, // calmer UX, fewer Sheets API hits
        retry: 1,
      },
    },
  })

  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient })

  if (import.meta.server) {
    nuxtApp.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }

  if (import.meta.client) {
    hydrate(queryClient, vueQueryState.value)
  }
})
```

### 8.12 `queries/families.ts` — Query keys, queries, mutations in one place

This is where DRY pays off. The page components stay tiny because all data logic lives here.

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { FamilyWithCount, FamilyDetail } from '~/types'
import type { FamilyInput } from '~/schemas'

// Query keys — one source of truth for cache invalidation
export const familyKeys = {
  all: ['families'] as const,
  list: () => [...familyKeys.all, 'list'] as const,
  detail: (id: string) => [...familyKeys.all, 'detail', id] as const,
}

// Queries
export const useFamilies = () =>
  useQuery({
    queryKey: familyKeys.list(),
    queryFn: () => $fetch<FamilyWithCount[]>('/api/families'),
  })

export const useFamily = (id: MaybeRefOrGetter<string>) =>
  useQuery({
    queryKey: computed(() => familyKeys.detail(toValue(id))),
    queryFn: () => $fetch<FamilyDetail>(`/api/families/${toValue(id)}`),
  })

// Mutations
export const useCreateFamily = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: FamilyInput) =>
      $fetch<{ id: string }>('/api/families', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: familyKeys.all }),
  })
}

export const useUpdateFamily = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: FamilyInput) =>
      $fetch(`/api/families/${id}`, { method: 'PUT', body: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: familyKeys.list() })
      qc.invalidateQueries({ queryKey: familyKeys.detail(id) })
    },
  })
}

export const useDeleteFamily = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => $fetch(`/api/families/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: familyKeys.all }),
  })
}
```

### 8.13 Pages using TanStack Query

**`pages/index.vue` (family list):**

```vue
<script setup lang="ts">
import { useFamilies } from '~/queries/families'

const { data: families, isLoading, error } = useFamilies()
const search = ref('')
const rtFilter = ref('')

const filtered = computed(() => {
  if (!families.value) return []
  return families.value.filter((f) => {
    const matchSearch = !search.value
      || f.kepala_keluarga.toLowerCase().includes(search.value.toLowerCase())
    const matchRt = !rtFilter.value || f.rt === rtFilter.value
    return matchSearch && matchRt
  })
})
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Data Warga</h1>
      <NuxtLink to="/family/new" class="bg-blue-600 text-white px-4 py-2 rounded">
        + Tambah Keluarga
      </NuxtLink>
    </div>

    <input v-model="search" placeholder="Cari nama..." class="border p-2 rounded w-full mb-4" />

    <p v-if="isLoading">Memuat...</p>
    <p v-else-if="error" class="text-red-600">Gagal memuat: {{ error.message }}</p>
    <div v-else class="space-y-2">
      <NuxtLink
        v-for="family in filtered"
        :key="family.id"
        :to="`/family/${family.id}`"
        class="block border rounded p-3 hover:bg-gray-50"
      >
        <div class="font-medium">{{ family.kepala_keluarga }}</div>
        <div class="text-sm text-gray-600">{{ family.alamat }} · RT {{ family.rt }}</div>
        <div class="text-xs text-gray-500">{{ family.member_count }} anggota</div>
      </NuxtLink>
    </div>
  </div>
</template>
```

**`pages/family/new.vue`:**

```vue
<script setup lang="ts">
import { useCreateFamily } from '~/queries/families'
import { familyInput, type FamilyInput } from '~/schemas'

const router = useRouter()
const { mutate, isPending, error } = useCreateFamily()

const submit = (data: FamilyInput) => {
  const parsed = familyInput.safeParse(data)
  if (!parsed.success) {
    alert(parsed.error.issues.map(i => i.message).join('\n'))
    return
  }
  mutate(parsed.data, {
    onSuccess: ({ id }) => router.push(`/family/${id}`),
  })
}
</script>

<template>
  <FamilyForm :loading="isPending" :error="error?.message" @submit="submit" />
</template>
```

**`pages/family/[id]/index.vue`:**

```vue
<script setup lang="ts">
import { useFamily, useDeleteFamily } from '~/queries/families'

const route = useRoute()
const id = computed(() => route.params.id as string)
const { data: family, isLoading } = useFamily(id)
const { mutate: remove } = useDeleteFamily()
const router = useRouter()
const { user } = useUserSession()

const onDelete = () => {
  if (!confirm('Yakin hapus keluarga ini?')) return
  remove(id.value, { onSuccess: () => router.push('/') })
}
</script>

<template>
  <div v-if="isLoading" class="p-4">Memuat...</div>
  <div v-else-if="family" class="p-4 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold">{{ family.kepala_keluarga }}</h1>
    <p class="text-gray-600">{{ family.alamat }}</p>
    <p class="text-sm">RT {{ family.rt }} / RW {{ family.rw }} · {{ family.no_telp_rumah }}</p>

    <h2 class="text-lg font-semibold mt-6 mb-2">Anggota Keluarga</h2>
    <table class="w-full border">
      <thead class="bg-gray-100">
        <tr>
          <th class="p-2 text-left">No</th>
          <th class="p-2 text-left">Nama</th>
          <th class="p-2 text-left">TTL</th>
          <th class="p-2 text-left">Hub</th>
          <th class="p-2 text-left">Gol Darah</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in family.members" :key="m.id" class="border-t">
          <td class="p-2">{{ m.urutan }}</td>
          <td class="p-2">{{ m.nama_lengkap }}</td>
          <td class="p-2">{{ m.tempat_lahir }}, {{ m.tanggal_lahir }}</td>
          <td class="p-2">{{ m.hub_kel }}</td>
          <td class="p-2">{{ m.gol_darah }}</td>
        </tr>
      </tbody>
    </table>

    <div class="mt-4 flex gap-2">
      <NuxtLink :to="`/family/${id}/edit`" class="bg-blue-600 text-white px-4 py-2 rounded">
        Edit
      </NuxtLink>
      <button
        v-if="user?.role === 'rw_admin'"
        @click="onDelete"
        class="bg-red-600 text-white px-4 py-2 rounded"
      >
        Hapus
      </button>
    </div>
  </div>
</template>
```

**`pages/login.vue`:**

```vue
<script setup lang="ts">
const route = useRoute()
const error = computed(() => route.query.error)
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white p-8 rounded-lg shadow max-w-sm w-full">
      <h1 class="text-2xl font-bold mb-2">Data Warga RW</h1>
      <p class="text-gray-600 mb-6">Login dengan akun Google Anda</p>
      <a href="/auth/google" class="block w-full bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700">
        Sign in with Google
      </a>
      <p v-if="error" class="text-red-600 text-sm mt-4">Login gagal. Coba lagi.</p>
    </div>
  </div>
</template>
```

### 8.14 `components/FamilyForm.vue` — One form, used by new + edit

```vue
<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { FamilyInput, MemberInput } from '~/schemas'

const props = defineProps<{
  initial?: FamilyInput
  loading?: boolean
  error?: string
}>()

const emit = defineEmits<{ submit: [data: FamilyInput] }>()

const blankMember = (): MemberInput => ({
  nama_lengkap: '', tempat_lahir: '', tanggal_lahir: '',
  hub_kel: 'Anak', gol_darah: '-', no_hp: '',
})

const form = ref<FamilyInput>(props.initial ?? {
  kepala_keluarga: '', alamat: '', rt: '', rw: '', no_telp_rumah: '',
  members: [blankMember()],
})

const addMember = () => form.value.members.push(blankMember())
const removeMember = (i: number) => form.value.members.splice(i, 1)
</script>

<template>
  <form @submit.prevent="emit('submit', form)" class="p-4 max-w-3xl mx-auto space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Data Kepala Keluarga</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="space-y-1">
          <Label for="kk">Nama Kepala Keluarga</Label>
          <Input id="kk" v-model="form.kepala_keluarga" />
        </div>
        <div class="space-y-1">
          <Label for="alamat">Alamat</Label>
          <Input id="alamat" v-model="form.alamat" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <Label for="rt">RT</Label>
            <Input id="rt" v-model="form.rt" />
          </div>
          <div class="space-y-1">
            <Label for="rw">RW</Label>
            <Input id="rw" v-model="form.rw" />
          </div>
        </div>
        <div class="space-y-1">
          <Label for="telp">No Telp Rumah</Label>
          <Input id="telp" v-model="form.no_telp_rumah" />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Anggota Keluarga</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <MemberRow
          v-for="(_, i) in form.members"
          :key="i"
          v-model="form.members[i]"
          @remove="removeMember(i)"
        />
        <Button type="button" variant="outline" @click="addMember">
          + Tambah Anggota
        </Button>
      </CardContent>
    </Card>

    <p v-if="error" class="text-destructive text-sm">{{ error }}</p>
    <Button :disabled="loading" type="submit" class="w-full">
      {{ loading ? 'Menyimpan...' : 'Simpan' }}
    </Button>
  </form>
</template>
```

`MemberRow.vue` is a small component that composes `Input`, `Label`, and a `Select` from `components/ui/select` for `hub_kel` and `gol_darah` dropdowns. Add the `select` shadcn component when you build it: `pnpm dlx shadcn-vue@latest add select`.

## 9. Google Cloud Console Setup (One-Time, Manual)

These steps MUST be done in a browser before the app will work. The agent cannot do these.

1. **Create project**: https://console.cloud.google.com → New Project → name it `data-warga-rw`
2. **Enable APIs**: APIs & Services → Library → enable:
   - Google Sheets API
   - Google Drive API
3. **OAuth consent screen**:
   - APIs & Services → OAuth consent screen → External → fill required fields
   - Add test users (your email + admin emails) if in testing mode
4. **OAuth credentials**:
   - APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/google`
     - `https://YOUR-PRODUCTION-DOMAIN/auth/google`
   - Save Client ID and Secret → `.env`
5. **Service account**:
   - IAM & Admin → Service Accounts → Create
   - Name: `sheets-access`
   - Grant role: none needed (sheet is shared directly)
   - Create JSON key → download
   - From the JSON, copy `client_email` → `NUXT_GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Copy `private_key` (the full multi-line string with `\n` escapes) → `NUXT_GOOGLE_SERVICE_ACCOUNT_KEY`
6. **Create the Google Spreadsheet**:
   - Create new Google Sheet
   - Add three tabs: `families`, `members`, `admins` with the columns above (row 1 = headers)
   - Share the sheet with the service account email (give **Editor** access)
   - Copy sheet ID from URL → `NUXT_SHEET_ID`
   - Add your email to `admins` tab: `your@gmail.com | Your Name | rw_admin | * | TRUE`
7. **Generate session password**: run `openssl rand -hex 32` → `NUXT_SESSION_PASSWORD`

## 10. Implementation Order

Work in this order. Verify each step before moving on. **Pause for the human to verify at each "Test" checkpoint.**

1. **Scaffold project**
   - `pnpm dlx nuxi@latest init open-tanggan`
   - Install dependencies (see §11)
   - Set up Tailwind via `@nuxtjs/tailwindcss`
   - **Initialize shadcn-vue**: `pnpm dlx shadcn-vue@latest init` (see §8.0)
   - Add starter components: `pnpm dlx shadcn-vue@latest add button input label card`
   - Set up `app.vue` with header + logout using shadcn's `Button`

2. **Shared foundations** (so everything types-check from the start)
   - `types/index.ts` with all interfaces (§8.5)
   - `schemas/index.ts` with Zod schemas (§8.6)

3. **Auth flow first** (nothing else works without it)
   - `nuxt.config.ts` with runtimeConfig (§8.1)
   - `server/utils/sheets.ts` (§8.2)
   - `server/utils/admins.ts` + `authz.ts` (§8.3)
   - `server/routes/auth/google.get.ts` (§8.4)
   - `middleware/auth.global.ts` (§8.10)
   - `pages/login.vue`, `pages/unauthorized.vue`
   - Manually add your email to `admins` sheet
   - **Test**: visit `/login` → click Google → land on `/` → session cookie set; non-admin email lands on `/unauthorized`

4. **TanStack Query setup**
   - `plugins/vue-query.ts` (§8.11)
   - `queries/families.ts` skeleton (just `useFamilies` first) (§8.12)
   - **Test**: install Vue Query devtools; confirm hydration works (no "hydration mismatch" warnings)

5. **Read flows**
   - `server/utils/families.ts`, `members.ts` (§8.7, §8.8)
   - `GET /api/families`, `GET /api/families/[id]` (§8.9)
   - `pages/index.vue` (list), `pages/family/[id]/index.vue` (detail) (§8.13)
   - **Test**: seed 2-3 families manually in the sheet → confirm they show up; reload doesn't double-fetch (TanStack Query cache works)

6. **Write flows**
   - `POST /api/families` with Zod validation (§8.9)
   - `useCreateFamily` mutation in `queries/families.ts`
   - Add shadcn components needed now: `pnpm dlx shadcn-vue@latest add select`
   - `components/FamilyForm.vue` + `MemberRow.vue` (§8.14)
   - `pages/family/new.vue`
   - **Test**: create a family with 3 members → rows appear in sheet → list refetches automatically (invalidation works)

7. **Edit/delete flows**
   - `PUT /api/families/[id]`, `DELETE /api/families/[id]` (§8.9)
   - `useUpdateFamily`, `useDeleteFamily` mutations
   - `pages/family/[id]/edit.vue` (reuses `FamilyForm` with `initial` prop)
   - **Test**: edit a family, delete a member, delete the whole family → both list and detail caches refresh

8. **Authorization checks**
   - Add `rt_admin` test entry to admins sheet
   - Verify rt_admin can't edit other RTs (UI hides Edit/Hapus buttons via `canEditRt` check; API returns 403 even if curl'd)

9. **Export**
   - `server/api/export.get.ts` using `exceljs`
   - Button on index page (plain `<a href="/api/export">`, no need for TanStack Query)

10. **PWA**
    - Add icons (use https://realfavicongenerator.net)
    - Configure `@vite-pwa/nuxt` in `nuxt.config.ts`
    - **Test**: `pnpm build && pnpm preview` → install to home screen on phone → confirm offline read works (after first load)

11. **Polish**
    - Loading states, error toasts, confirm dialogs
    - Mobile responsive layout (test at 360px width)
    - README with setup instructions

12. **Deploy**
    - Push to GitHub
    - Cloudflare Pages: connect repo, framework preset "Nuxt.js"
    - Add all env vars in CF Pages dashboard
    - Enable `nodejs_compat` flag (Settings → Functions → Compatibility flags)
    - Update OAuth redirect URI in Google Cloud to production URL
    - Deploy and test

## 11. Dependencies

```bash
# Core
pnpm add nuxt-auth-utils google-spreadsheet google-auth-library zod

# UI + PWA
pnpm add @nuxtjs/tailwindcss @vite-pwa/nuxt

# shadcn-vue runtime peers (the CLI will install these on `init`)
# - reka-ui (the underlying primitive lib, formerly radix-vue)
# - class-variance-authority
# - clsx + tailwind-merge
# Don't install these manually — let `shadcn-vue init` handle it.

# Icons (commonly needed alongside shadcn-vue components)
pnpm add lucide-vue-next

# Data fetching (client)
pnpm add @tanstack/vue-query

# Export
pnpm add exceljs

# Types
pnpm add -D @types/node
```

Optionally during dev, add the Vue Query devtools panel:

```bash
pnpm add -D @tanstack/vue-query-devtools
```

Mount it in `app.vue` behind `import.meta.dev`.

**Note on shadcn-vue:** It's not an npm dependency — the CLI copies component source into your repo. Run `pnpm dlx shadcn-vue@latest init` then `add <component>` as needed. See §8.0.

## 12. Gotchas (Read Before Coding)

1. **Private key newlines** — `.env` stores `\n` as literal characters. Code must do `.replace(/\\n/g, '\n')` when loading. If you get "ERR_OSSL_UNSUPPORTED" or "invalid private key", this is why.

2. **Service account access** — The sheet MUST be shared with the service account email (`xxx@xxx.iam.gserviceaccount.com`) with Editor permission. Forgetting this gives a 403 from Sheets API.

3. **OAuth redirect URI** — Must match EXACTLY (including http vs https, trailing slash, port). Localhost dev uses `http://localhost:3000/auth/google`.

4. **Cloudflare Pages Node compatibility** — Set `compatibility_flags = ["nodejs_compat"]` in CF Pages settings. Without it, `google-auth-library` may fail with crypto errors.

5. **Sheets API rate limits** — 60 reads/min per user, 300 per project. With caching (§8.3 uses `defineCachedFunction`) you'll stay well under.

6. **Row deletion shifts indices** — `google-spreadsheet`'s `row.delete()` shifts other rows. Always delete in **reverse order** (see `replaceMembers` in §8.8).

7. **`active` field type** — Sheets returns strings. Compare with `String(value).toUpperCase() === 'TRUE'`, not `Boolean(value)`.

8. **Session expiry** — `nuxt-auth-utils` defaults to 7 days. To change, configure in module options.

9. **PWA dev mode** — Disable PWA in dev (`devOptions.enabled: false`) — caching makes auth changes confusing during development.

10. **Vercel ToS** — Hobby tier is "non-commercial". RW community use is fine. If unsure, use Cloudflare Pages (no such clause).

11. **TanStack Query + SSR hydration** — Always use the plugin in §8.11 with both `dehydrate` (server) and `hydrate` (client). Without it, you'll see "hydration mismatch" warnings and queries re-fetching on mount.

12. **TanStack Query keys must be stable** — When `id` comes from a route param, wrap the key in `computed()` so it reacts to changes (see `useFamily` in §8.12). Hard-coding `route.params.id` once won't update on navigation.

13. **Don't mix `useFetch` and TanStack Query** — Pick one per data path. We use TanStack Query for everything client-driven. `useFetch` is only acceptable for SSR-only static data (we have none).

14. **Mutation error handling** — `useMutation` returns `error` as a ref. Don't try to `try/catch` around `mutate()` — that's not how it works. Use `onError` callback or read `error.value`.

## 13. README Template

The agent should also write a `README.md` covering:
- Project description (in Indonesian + English)
- Prerequisites (Node 20, pnpm, Google account)
- Step-by-step Google Cloud setup (mirroring §9)
- Local dev: `cp .env.example .env`, fill values, `pnpm install`, `pnpm dev`
- Deployment to Cloudflare Pages
- How to add new admins (edit `admins` sheet, no redeploy needed)
- How to back up data (File → Download → xlsx from Sheets, or use built-in export)
- Troubleshooting section (the gotchas above, in user-friendly language)

## 14. Acceptance Criteria

The app is "done" when:

**Functional:**
- [ ] An admin can log in with Google and see family list
- [ ] A non-admin email is rejected and redirected to `/unauthorized`
- [ ] rw_admin can CRUD any family
- [ ] rt_admin can read all but only edit own RT
- [ ] Deleting a family deletes all its members
- [ ] Data persists in Google Sheets and can be edited there directly without breaking the app
- [ ] App is installable as PWA on Android Chrome and shows app icon
- [ ] Family list works offline (from cache) after first load
- [ ] Excel export downloads with all data
- [ ] No API keys appear in browser DevTools → Sources or Network
- [ ] Deployed to Cloudflare Pages (or Vercel) on free tier
- [ ] README is clear enough for a non-developer Ketua RW to follow

**Code quality (KISS/DRY checks):**
- [ ] No file exceeds 200 lines (split if it does)
- [ ] No component nests deeper than 3 levels
- [ ] No "BaseX" / "AbstractY" generic wrappers
- [ ] Each entity has exactly one place for: types, schema, server util, query
- [ ] No duplicate fetch logic across components (all goes through `queries/`)
- [ ] Form validation uses the same Zod schemas as the API
- [ ] No Pinia, no `useFetch` for client-driven flows, no Apps Script

## 15. Future Enhancements (Not in MVP)

Track these for later:
- Photo upload for family head / KTP (Cloudinary free tier, or base64 in sheet)
- Statistics page (jumlah warga, distribusi umur, gol darah, dll)
- Import wizard (upload existing Excel → map columns → bulk create)
- Audit log sheet (who edited what, when)
- Per-RT subdomains or paths
- Print-friendly family card (PDF)
- WhatsApp notification on data update
- Background sync for offline writes (Workbox Background Sync API)
- i18n (Bahasa Indonesia + English) for international contributors
- Dark mode (shadcn-vue supports this out of the box — just add a toggle)

## 16. Open-Source Preparation

The app will be open-sourced, so the agent should set up these files alongside the code.

### Files to include in repo root

- **`LICENSE`** — Use **MIT License**. Permissive, well-understood, widely accepted in civic-tech. Add copyright line: `Copyright (c) 2026 [your name or org]`.
- **`README.md`** — covered in §13. Bilingual (Indonesian first, English second) since the primary audience is Indonesian RW admins.
- **`CONTRIBUTING.md`** — short. Cover:
  - Code of conduct reference
  - How to set up locally (link to README)
  - Branch naming: `feat/`, `fix/`, `docs/`
  - Commit style: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)
  - PR template expectations
- **`CODE_OF_CONDUCT.md`** — Contributor Covenant v2.1 (standard, copy-paste).
- **`SECURITY.md`** — how to report vulnerabilities (email, not public issues for security).
- **`.github/`**:
  - `ISSUE_TEMPLATE/bug_report.md`
  - `ISSUE_TEMPLATE/feature_request.md`
  - `PULL_REQUEST_TEMPLATE.md`
  - `workflows/ci.yml` — runs `pnpm install`, `pnpm typecheck`, `pnpm lint`, `pnpm build` on PRs
- **`.env.example`** — already in §7; ensure it's in repo with placeholders (never commit `.env`)
- **`.editorconfig`** — basic 2-space, LF line endings
- **`SCREENSHOTS/`** or `docs/screenshots/` — a few PNGs for the README

### README structure (bilingual)

```markdown
# Open Tanggan

> Aplikasi open-source untuk manajemen data warga RW. Gratis, tanpa server berbayar, data tersimpan di Google Sheets.

> Open-source app to manage neighborhood resident data for Indonesian RW units. Free hosting, data stored in Google Sheets.

[Screenshot]

## Fitur / Features
- ✅ Login dengan Google
- ✅ CRUD data keluarga & anggota
- ✅ Role-based: RW admin & RT admin
- ✅ Export ke Excel
- ✅ PWA — install ke handphone, bisa offline
- ✅ 100% gratis (Google Sheets + Cloudflare Pages free tier)

## Quick Start (untuk RW yang mau pakai)
[link to docs/SETUP-ID.md — Indonesian setup guide]

## For Developers
[link to docs/DEVELOPMENT.md]

## Tech Stack
Nuxt 3 • TypeScript • TanStack Query • shadcn-vue • Tailwind CSS • Google Sheets API • Cloudflare Pages

## License
MIT
```

### Repo settings checklist (after first push)

- [ ] Repo description filled in (1 sentence, mentions "Indonesian RW data management")
- [ ] Topics added: `nuxt`, `vue`, `google-sheets`, `pwa`, `indonesia`, `civic-tech`, `shadcn-vue`, `tanstack-query`
- [ ] License selected: MIT
- [ ] Issues enabled
- [ ] Discussions enabled (better than Issues for "how do I use this for my RW?" questions)
- [ ] GitHub Pages or external docs link (optional, only if you build a landing page)
- [ ] Star/fork-friendly: pin to your profile if it's a flagship project

### Things NOT to commit (`.gitignore`)

```
.env
.env.local
.env.production
.output/
.nuxt/
node_modules/
dist/
*.log
.DS_Store
service-account-*.json
```

### Naming consistency

Once the name is locked, find-and-replace these in the codebase:
- Project name in `package.json` (`"name": "Open Tanggan"`)
- `<title>` in `nuxt.config.ts`
- PWA manifest `name` and `short_name`
- README headings
- GitHub repo URL in any docs

---

**End of plan. Ask clarifying questions before starting if anything is ambiguous. Otherwise, proceed in the order in §10.**