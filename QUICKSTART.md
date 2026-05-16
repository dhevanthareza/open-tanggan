# Quick Start Guide

## What Was Done

A complete Nuxt 3 + TypeScript application has been scaffolded with all the architecture in place. Everything is ready for you to configure with your Google Cloud credentials.

## Project Structure

```
open-tanggan/
├── .env.example           # Copy to .env and fill in your credentials
├── package.json          # Dependencies installed
├── nuxt.config.ts        # Nuxt configuration
├── types/index.ts        # All TypeScript types
├── schemas/index.ts      # Zod validation schemas
├── server/
│   ├── api/             # REST API endpoints (fully implemented)
│   ├── routes/          # OAuth routes
│   └── utils/           # Sheets API helpers (fully implemented)
├── pages/               # Routes (all CRUD pages ready)
├── components/          # Vue components (FamilyForm ready)
├── queries/             # TanStack Query hooks (fully implemented)
├── middleware/          # Auth middleware (ready)
├── plugins/             # TanStack Query setup (ready)
└── README.md, CONTRIBUTING.md, etc.  # Docs ready
```

## Next Steps

### 1. Setup Google Cloud (Required)

Follow the instructions in [README.md](./README.md#quick-start-for-developers):

1. Create a Google Cloud project
2. Enable Sheets API & Drive API
3. Create OAuth credentials (Web app)
4. Create a Service Account and download JSON key
5. Create a Google Spreadsheet with 3 tabs: `families`, `members`, `admins`
6. Share the spreadsheet with the service account email

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Generate a session password
openssl rand -hex 32
# Copy the output to NUXT_SESSION_PASSWORD

# Fill in the rest:
NUXT_OAUTH_GOOGLE_CLIENT_ID=<from Google Cloud>
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=<from Google Cloud>
NUXT_GOOGLE_SERVICE_ACCOUNT_EMAIL=<from service account JSON>
NUXT_GOOGLE_SERVICE_ACCOUNT_KEY=<from service account JSON, with literal \n>
NUXT_SHEET_ID=<from spreadsheet URL between /d/ and /edit>
NUXT_PUBLIC_APP_NAME="Data Warga RW XI"  # Change as needed
```

**Important:** The `NUXT_GOOGLE_SERVICE_ACCOUNT_KEY` must contain literal `\n` characters (not actual newlines). Copy exactly as it appears in the JSON.

### 3. Seed Admin User

Add your email to the `admins` sheet in Google Sheets:

```
email:   your@gmail.com
nama:    Your Name
role:    rw_admin
rt:      *
active:  TRUE
```

### 4. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000/login` and sign in with Google.

## What's Already Implemented

✅ **Auth**
- Google OAuth callback handler
- Session management with encrypted cookies
- Admin validation & authorization

✅ **API Endpoints** (all 5)
- GET `/api/families` — list all families
- POST `/api/families` — create family
- GET `/api/families/[id]` — get family detail
- PUT `/api/families/[id]` — update family
- DELETE `/api/families/[id]` — delete family
- POST `/api/auth/logout` — logout

✅ **Pages** (all 6)
- `/login` — sign in page
- `/` — family list
- `/family/[id]` — family detail
- `/family/new` — create family
- `/family/[id]/edit` — edit family
- `/unauthorized` — access denied page

✅ **Data Layer**
- `server/utils/sheets.ts` — Google Sheets API wrapper
- `server/utils/families.ts` — Family CRUD
- `server/utils/members.ts` — Member CRUD
- `server/utils/admins.ts` — Admin lookup + caching

✅ **Client Layer**
- TanStack Query setup with SSR hydration
- Query hooks for families (list, detail, create, update, delete)
- Global auth middleware
- FamilyForm component (used by new & edit pages)

✅ **Configuration**
- All environment variables externalized
- Tailwind CSS configured
- TypeScript strict mode
- Zod validation schemas shared between API & forms

## What's NOT Yet Done (Future/Enhancement)

- Excel export endpoint (API stub exists, needs `exceljs` implementation)
- PWA icons
- Logging/audit trails
- Statistics dashboard
- Import wizard
- Photo uploads

## Development Commands

```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm typecheck    # TypeScript type checking
```

## Deployment

Ready to deploy to:
- **Cloudflare Pages** (recommended, free tier)
- **Vercel** (free tier, limited Node features)

See README.md for deployment instructions.

## Troubleshooting

**"Invalid private key"?**
- Make sure `NUXT_GOOGLE_SERVICE_ACCOUNT_KEY` has literal `\n` characters

**"403 Forbidden from Sheets API"?**
- Verify service account email has Editor access to the spreadsheet

**"OAuth redirect URI mismatch"?**
- Exact match in Google Cloud OAuth settings required
- Include http/https, port, and path

See README.md for more gotchas.

## Project Philosophy

- **KISS**: Keep It Simple. No premature abstractions.
- **DRY**: But not religiously. Extract on 3rd repetition.
- **Boring code wins**: A junior dev should understand any file in 30 seconds.
- **One place per entity**: types, schema, server util, query hook — all in predictable locations.

## Questions?

See `README.md` for full documentation, or open an issue on GitHub.

---

**You're ready to code! Start with Google Cloud setup, then `cp .env.example .env` and fill it in.** 🚀
