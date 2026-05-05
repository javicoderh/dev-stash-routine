# Dev Stash

A daily intelligence briefing app for developers who want to stay on top of AI, Rust, and emerging tech — without the noise.

Every morning, an automated Claude Code routine scans the frontier and writes a curated briefing directly into Firestore. Dev Stash is the reading surface: clean, fast, and opinionated.

Live at **[dev-stash-routine.vercel.app](https://dev-stash-routine.vercel.app)**

---

## What it does

Dev Stash delivers six streams of curated daily content, each generated automatically by a Claude-powered bot:

| Section | What it contains |
|---|---|
| **Briefings** | Daily AI/tech news with image, summary, source and reading time |
| **Rust Tasks** | Daily Rust learning item — pattern, theory, real-world case, or ecosystem highlight |
| **Rust Readings** | Deep-read articles on Rust concepts with full markdown content |
| **Agent Items** | Changelogs, patterns, and news about AI agents and tooling |
| **Business Ideas** | Daily business idea structured as context → problem → solution → market |
| **AI Tips** | Practical AI prompting and workflow tips, categorized by use case |

Content is read-only for visitors. Authenticated users can mark items as read/unread. An admin dashboard (`/admin`) allows full CRUD on all collections.

---

## Current architecture

```
Browser (SPA)
    │
    ├── Firebase Auth (Anonymous for visitors, Email/Password for admin)
    ├── Firestore (read: all signed-in users, write: bot UID + admin)
    └── Vercel (static hosting + SPA rewrites)

Content pipeline (external, not in this repo)
    └── Claude Code routine → writes to Firestore every morning
```

### Tech stack

- **Vite 5** — bundler and dev server
- **React 18 + TypeScript** (strict mode) — UI framework
- **React Router v6** — client-side routing with lazy-loaded pages
- **TanStack Query v5** — data fetching, caching, and optimistic mutations
- **Firebase Web SDK v10** (modular) — Auth + Firestore
- **Tailwind CSS** — styling via design tokens (CSS custom properties)
- **lucide-react** — icons

### Typography

- **Fraunces** — display / headings
- **Inter** — body / UI
- **Source Serif 4** — long-form reading content
- **JetBrains Mono** — dates, code, technical labels

### Design system

Light/dark mode via CSS custom properties. Warm off-white base in light (`#F5F4EE`), dark warm neutral in dark (`#141311`). Accent color: Claude orange (`#CC785C`). No component library — all UI is custom-built to spec.

---

## Pages and routes

| Route | Description |
|---|---|
| `/login` | Email-only entry form — signs in anonymously, persists email to Firestore |
| `/` | Home: QuickNav → AI Tips → News carousel + Rust Tasks aside → Business Ideas → Agent Items → Rust Readings |
| `/archive/news` | Full news archive, grouped by month |
| `/archive/rust-tasks` | Rust tasks archive, filterable by status and format type |
| `/archive/rust-readings` | Rust readings archive, filterable by status |
| `/archive/agents` | Agent items archive |
| `/archive/business-ideas` | Business ideas archive |
| `/archive/ai-tips` | AI tips archive |
| `/rust-tasks/:id` | Full task detail with markdown + syntax-highlighted code |
| `/rust-readings/:id` | Full reading detail with markdown |
| `/agent-items/:id` | Full agent item detail |
| `/business-ideas/:id` | Full business idea detail |
| `/ai-tips/:id` | Full AI tip detail |
| `/admin/login` | Admin login (email + password) |
| `/admin` | Admin dashboard — CRUD for all 6 Firestore collections |

---

## Auth model

**Visitors** sign in with Firebase Anonymous Auth. They enter their email once — it's saved to Firestore for the mailing list — and are auto-signed-in on return visits via localStorage. No password, no friction.

**Admin** signs in with email + password (`signInWithEmailAndPassword`). Detected via `user.isAnonymous === false`. The admin Firestore UID is also hardcoded as the bot identity for write access.

---

## Data model (Firestore)

Content is written by an external bot. The frontend only reads and toggles `status`/`readAt`.

### `briefings/{YYYY-MM-DD}`
```ts
{ date, news: NewsItem[], deepRead: DeepRead, generatedAt: Timestamp }
// NewsItem: { imageUrl, title, summary, source, url }
// DeepRead: { title, author, url, readingTime, summary }
```

### `rustTasks/{autoId}`
```ts
{ date, formatType, title, content, codeSnippet, sources, status, readAt, createdAt }
// formatType: 'patron' | 'teoria' | 'aplicacion_real' | 'caso_real' | 'ecosistema'
```

### `rustReadings/{autoId}`
```ts
{ date, title, content, sources, status, readAt, createdAt }
```

### `agentItems/{autoId}`
```ts
{ date, agentName, type, title, content, codeSnippet, version, sources, status, readAt, createdAt }
// type: 'news' | 'changelog' | 'pattern'
```

### `businessIdeas/{autoId}`
```ts
{ date, title, worldContext, problem, solution, market, sources, createdAt }
```

### `aiTips/{autoId}`
```ts
{ date, title, content, toolName, category, sources, status, readAt, createdAt }
// category: 'productividad' | 'escritura' | 'estudio' | 'trabajo' | 'vida_diaria' | 'investigacion'
```

### `visitors/{email}`
```ts
{ email, uid, createdAt }
```

---

## Read status

Read/unread state is stored in **localStorage** (not Firestore), keyed by item ID. This means it's local to the device and doesn't require a write to the database on every tap. The `useToggleStatus` hook uses `useSyncExternalStore` to keep the UI in sync across components.

---

## Admin dashboard (`/admin`)

Six collapsible section panels, one per collection. Each panel shows:
- Item count
- Scrollable list of items (date + title, up to 50 most recent)
- Inline create form ("New" button)
- Inline edit form (per row)
- Delete with confirmation step

Complex fields (briefing `news` array, `deepRead` object) are edited as raw JSON. Sources are one URL per line.

---

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Firebase credentials
npm run dev
```

Required env vars:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## Scripts

```bash
npm run dev        # dev server (Vite HMR)
npm run build      # tsc + vite build → dist/
npm run preview    # preview production build locally
npm run deploy     # build + firebase deploy --only hosting
```

Deploy to Vercel (current production):
```bash
npx vercel deploy --prod
```

Deploy Firestore rules:
```bash
npx firebase deploy --only firestore:rules
```

---

## Current state vs. public product

Dev Stash was built as a **single-user personal tool**. It works, but several things would need to change to open it to a wider audience:

### What's personal-only today
- One hardcoded admin/bot UID in Firestore rules
- No per-user read status (stored in localStorage, not tied to account)
- No user accounts beyond anonymous auth
- Content pipeline is a private Claude Code routine (not open)
- No onboarding, no empty states for new users
- No subscription / notification layer
- UI copy and categories are in Spanish (some labels)
- No SEO, no OG metadata, no shareable URLs

### What's already public-ready
- Zero-friction entry (email only, no password)
- Mobile-responsive layout
- Dark/light mode
- Fast page loads (SPA with lazy routes, TanStack Query cache)
- Clean design system that scales
- Admin CRUD to manage content independently of the bot

---

## Project structure

```
src/
├── components/
│   ├── auth/          AuthProvider, RequireAuth
│   ├── home/          QuickNav, NewsCarousel, RustTasksAside, etc.
│   ├── layout/        AppShell, Header, ThemeToggle
│   ├── archive/       ArchiveGrid, ArchiveCard, ArchiveFilters
│   └── ui/            Button, StatusBadge, MonoLabel, Toast, Skeleton, etc.
├── hooks/
│   ├── useAuth.ts
│   ├── useAdminAuth.ts
│   ├── useTheme.ts
│   └── useToggleStatus.ts
├── lib/
│   ├── firebase.ts
│   ├── queries.ts      all TanStack Query hooks (read)
│   ├── adminQueries.ts admin CRUD mutations
│   └── dates.ts        Intl formatters (es-CL, America/Santiago)
├── pages/
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Admin.tsx
│   ├── AdminLogin.tsx
│   └── [Archive + Detail pages for each collection]
└── types/
    └── firestore.ts    TypeScript types for all collections
```
