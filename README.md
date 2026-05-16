# Open Tanggan

> **Open Tanggan** ("my warga") — aplikasi open-source untuk manajemen data warga RW. Gratis, tanpa server berbayar, data tersimpan di Google Sheets.

> Open-source app to manage neighborhood resident data for Indonesian RW units. Free hosting, data stored in Google Sheets.

## Fitur / Features

- ✅ Login dengan Google / Sign in with Google
- ✅ CRUD data keluarga & anggota / Family & member management
- ✅ Role-based access: RW admin & RT admin
- ✅ Export ke Excel / Export to Excel
- ✅ PWA — install ke handphone, bisa offline / Installable as PWA
- ✅ 100% gratis (Google Sheets + Cloudflare Pages) / Free hosting

## Tech Stack

- **Framework**: Nuxt 3 (SSR)
- **Language**: TypeScript
- **UI**: shadcn-vue + Tailwind CSS
- **Data**: Google Sheets API
- **Auth**: Google OAuth + nuxt-auth-utils
- **Data Fetching**: TanStack Query
- **Hosting**: Cloudflare Pages (or Vercel)

## Prerequisites / Persyaratan

- Node.js 20.x LTS
- pnpm (or npm/yarn)
- Google account with Cloud Project setup

## Quick Start (For Developers)

### 1. Clone & Install

```bash
cd open-tanggan
cp .env.example .env
pnpm install
```

### 2. Setup Google Cloud

#### 2a. Create Project & Enable APIs

1. Go to https://console.cloud.google.com → **New Project** → name it (e.g. `open-tanggan`)
2. Go to **APIs & Services → Library** and enable:
   - **Google Sheets API**
   - **Google Drive API**

#### 2b. Create OAuth Credentials (for user login)

1. Go to **APIs & Services → OAuth consent screen**
   - Choose **External** → fill in App name, support email → Save
   - Add your email as a **Test user** (required while app is in testing mode)
2. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs — add both:
     - `http://localhost:3000/auth/google` (for local dev)
     - `https://your-production-domain.com/auth/google` (for production)
3. Click **Create** → copy **Client ID** and **Client Secret**

#### 2c. Create Service Account (for Sheets API)

The service account lets the app read/write Google Sheets without user interaction.

1. Go to **IAM & Admin → Service Accounts → Create Service Account**
2. Fill in a name (e.g. `sheets-access`) → **Create and Continue**
3. **Skip** the "Grant this service account access to project" step — **no role needed**
4. **Skip** the "Grant users access" step → **Done**
5. Click the new service account → **Keys tab → Add Key → Create new key → JSON → Create**
6. A JSON file downloads — open it and copy:
   - `client_email` value → `NUXT_GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` value → `NUXT_GOOGLE_SERVICE_ACCOUNT_KEY`

> **Note:** The `private_key` contains literal `\n` characters. Copy it exactly as-is (including the `\n`). Do NOT convert them to real newlines.

#### 2d. Create & Configure Google Spreadsheet

1. Go to https://sheets.google.com → **Create a new spreadsheet**
2. Get the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_IS_HERE/edit
   ```
   Copy the long string between `/d/` and `/edit` → `NUXT_SHEET_ID`

3. Create **3 tabs** (click `+` at the bottom) named exactly:
   - `families`
   - `members`
   - `admins`

4. Add **headers in Row 1** for each tab (exact spelling required):

   **`families` tab — Row 1 headers:**
   ```
   id | kepala_keluarga | alamat | rt | rw | no_telp_rumah | created_at | updated_at
   ```

   **`members` tab — Row 1 headers:**
   ```
   id | family_id | urutan | nama_lengkap | tempat_lahir | tanggal_lahir | hub_kel | gol_darah | no_hp | created_at
   ```

   **`admins` tab — Row 1 headers:**
   ```
   email | nama | role | rt | active
   ```

5. **Share the spreadsheet** with the service account email:
   - Click **Share** (top right)
   - Paste the `client_email` from the JSON key (looks like `xxx@xxx.iam.gserviceaccount.com`)
   - Set permission to **Editor** → **Send**

### 3. Configure `.env`

```bash
# Generate a session password: run `openssl rand -hex 32` in your terminal
NUXT_SESSION_PASSWORD=<64-character hex string>

# From step 2b (OAuth credentials)
NUXT_OAUTH_GOOGLE_CLIENT_ID=<Client ID>
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=<Client Secret>

# From step 2c (Service account JSON file)
NUXT_GOOGLE_SERVICE_ACCOUNT_EMAIL=<client_email from JSON>
NUXT_GOOGLE_SERVICE_ACCOUNT_KEY=<private_key from JSON, with literal \n characters>

# From step 2d (Spreadsheet URL between /d/ and /edit)
NUXT_SHEET_ID=<your spreadsheet ID>

# Customize the app name shown in the UI
NUXT_PUBLIC_APP_NAME="Data Warga RW XI"
```

### 4. Seed Admin User

Before logging in, add your email to the `admins` sheet so the app recognizes you.

In the **`admins` tab**, Row 2 (below the headers):

| email | nama | role | rt | active |
|---|---|---|---|---|
| `your@gmail.com` | `Your Name` | `rw_admin` | `*` | `TRUE` |

**Field rules:**
- **`role`**: must be exactly `rw_admin` (full access) or `rt_admin` (own RT only)
- **`rt`**: use `*` for rw_admin, or a specific RT like `01` for rt_admin
- **`active`**: must be `TRUE` in all caps — `False` or `false` will not work

> Admin list is cached for 60 seconds. After adding a new admin, wait up to 1 minute before they can log in.

### 5. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000/login` and sign in with your Google account.

## Folder Structure

```
├── types/              # Shared TypeScript types
├── schemas/            # Zod validation schemas
├── pages/              # Nuxt pages (routes)
├── components/         # Vue components
├── server/
│   ├── api/           # API endpoints
│   ├── routes/        # Route handlers
│   └── utils/         # Server utilities
├── queries/           # TanStack Query hooks
├── plugins/           # Nuxt plugins
├── middleware/        # Route middleware
├── assets/            # CSS & images
└── public/            # Static files
```

## Configuration

All configuration is done via environment variables in `.env`:

- `NUXT_SESSION_PASSWORD` - Session encryption key
- `NUXT_OAUTH_GOOGLE_*` - Google OAuth credentials
- `NUXT_GOOGLE_SERVICE_ACCOUNT_*` - Google Sheets API credentials
- `NUXT_SHEET_ID` - Google Spreadsheet ID
- `NUXT_PUBLIC_APP_NAME` - App name displayed in UI

## Development

```bash
# Start dev server
pnpm dev

# Type checking
pnpm typecheck

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Deployment

### Cloudflare Pages

1. Push code to GitHub
2. Connect repo to Cloudflare Pages
3. Set framework preset to "Nuxt.js"
4. Add all environment variables
5. Enable `nodejs_compat` compatibility flag
6. Deploy

### Environment Variables

Add these in Cloudflare Pages dashboard:
- All `.env` variables (except `NUXT_OAUTH_GOOGLE_CLIENT_SECRET` which CF adds via GitHub sync)

## Authorization

**rw_admin**
- Read all families
- Edit all families
- Delete families
- Manage admins (edit `admins` sheet directly)

**rt_admin**
- Read all families
- Edit only own RT families
- Cannot delete families

## Common Issues

### Private Key Error

If you get "ERR_OSSL_UNSUPPORTED" or "invalid private key":
- Make sure `NUXT_GOOGLE_SERVICE_ACCOUNT_KEY` contains literal `\n` characters (not actual newlines)

### Service Account Access Denied

- Verify service account email has Editor access to the Spreadsheet
- Check that all required scopes are in the JWT

### OAuth Redirect URI Mismatch

- Ensure redirect URI in `.env` exactly matches Google Cloud OAuth settings
- Include protocol (http/https) and port if on localhost

## Gotchas

1. **Sheets API rate limits**: 60 reads/min per user, 300 per project. Caching helps.
2. **Row deletion**: Always delete from end to start to maintain indices
3. **PWA in dev**: Disable in dev (`devOptions.enabled: false`) - caching causes confusion
4. **Session expiry**: Defaults to 7 days. Can be configured in `nuxt-auth-utils` module options

## License

MIT

## Contributing

See `CONTRIBUTING.md` for guidelines.

---

**Made with ❤️ for Indonesian RW communities**
