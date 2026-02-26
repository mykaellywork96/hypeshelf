# HypeShelf

> Collect and share the stuff you're hyped about.

A shared recommendations hub where friends log their favourite movies on one clean, public shelf.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Auth | Clerk |
| Backend / DB | Convex |
| Language | TypeScript |
| Styling | Tailwind CSS |

---

## Getting Started

### 1 – Prerequisites

- Node.js ≥ 18
- A free [Clerk](https://clerk.com) account
- A free [Convex](https://convex.dev) account

### 2 – Install dependencies

```bash
cd hypeshelf
npm install
```

### 3 – Set up Convex

```bash
npx convex dev
```

This initialises a new Convex project and writes `NEXT_PUBLIC_CONVEX_URL` into `.env.local` automatically.

### 4 – Set up Clerk

1. Create a new Clerk application at [dashboard.clerk.com](https://dashboard.clerk.com).
2. Copy `.env.local.example` → `.env.local` and fill in:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

### 5 – Wire Clerk → Convex (JWT)

This is the handshake that lets Convex verify Clerk-issued JWTs.

1. In Clerk dashboard → **JWT Templates** → **New template** → select **Convex**.
2. Copy the **Issuer URL** (e.g. `https://your-slug.clerk.accounts.dev`).
3. In Convex dashboard → **Settings → Environment Variables**, add:
   ```
   CLERK_JWT_ISSUER_DOMAIN = https://your-slug.clerk.accounts.dev
   ```
4. Update `convex/auth.config.ts` if needed (it reads `process.env.CLERK_JWT_ISSUER_DOMAIN`).

### 6 – (Optional) Set admin users

In Convex dashboard → **Settings → Environment Variables**, add:

```
ADMIN_EMAILS = alice@example.com,bob@example.com
```

Any email in this list will be granted the `admin` role on first sign-up.
Everyone else gets the `user` role. Existing users keep their current role — change it directly in the Convex dashboard if needed.

### 7 – Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
hypeshelf/
├── __tests__/
│   ├── validateLink.test.ts     # URL validation unit tests (10 cases)
│   ├── utils.test.ts            # cn() helper tests
│   └── genres.test.ts           # Genre data integrity tests
├── app/
│   ├── layout.tsx               # Root layout — anti-flash script + Providers
│   ├── page.tsx                 # Public landing page
│   ├── providers.tsx            # ThemeProvider + ClerkProvider + ConvexProviderWithClerk
│   ├── (auth)/                  # Clerk sign-in / sign-up pages
│   └── shelf/
│       ├── page.tsx             # Protected shelf (server shell + client view)
│       └── loading.tsx          # Route-level skeleton shown before JS loads
├── components/
│   ├── Navbar.tsx               # Top nav bar with admin badge + theme toggle
│   ├── UserSync.tsx             # Syncs Clerk identity → Convex users table
│   ├── PublicFeed.tsx           # Read-only preview on landing page
│   ├── ShelfView.tsx            # Full authenticated shelf with filters + pagination
│   ├── RecommendationCard.tsx   # Shared card component (public + shelf)
│   ├── AddRecommendationModal.tsx  # Modal form with client + server validation
│   ├── GenreFilter.tsx          # Horizontal filter strip
│   ├── ThemeProvider.tsx        # Dark/light state + useTheme() hook
│   ├── ThemeToggle.tsx          # Sun/Moon icon button
│   ├── Toaster.tsx              # Sonner toast wrapper (theme-aware)
│   └── ErrorBoundary.tsx        # Class-based error boundary with reset
├── convex/
│   ├── schema.ts                # DB schema (users + recommendations)
│   ├── auth.config.ts           # Clerk JWT configuration
│   ├── users.ts                 # upsertUser, getCurrentUser
│   └── recommendations.ts       # getLatest, getAll (paginated), add, remove, toggleStaffPick
├── lib/
│   ├── utils.ts                 # cn() Tailwind class helper
│   ├── validateLink.ts          # URL validation logic — used by unit tests
│   └── genres.ts                # Genre list with Tailwind colour mappings
└── vitest.config.ts             # Test runner config (@/ alias + node environment)
```

---

## Running Tests

```bash
npm test           # run once
npm run test:watch # re-run on file changes
```

Three test suites covering the security-critical and utility paths:

| Suite | What it tests |
|---|---|
| `validateLink.test.ts` | Valid URLs pass; blocked protocols (`javascript:`, `data:`, `ftp:`) throw |
| `utils.test.ts` | `cn()` class merging, Tailwind conflict resolution |
| `genres.test.ts` | Genre data integrity — no duplicates, all fields non-empty, GENRE_MAP consistency |

---

## Architecture & Design Decisions

### RBAC (Role-Based Access Control)

Roles are stored in the **Convex `users` table** — the server-side source of truth.

```
users.role: "admin" | "user"
```

**Why not Clerk's `publicMetadata`?**
Clerk metadata is fine for roles, but requires a webhook to keep Convex in sync (extra infra complexity). Storing roles in Convex lets us check them inside Convex mutations where they're already being evaluated — one less hop, same security.

**Permission matrix:**

| Action | User | Admin |
|---|---|---|
| View public feed | ✅ | ✅ |
| View full shelf | ✅ (authenticated) | ✅ |
| Add recommendation | ✅ | ✅ |
| Delete own recommendation | ✅ | ✅ |
| Delete any recommendation | ❌ | ✅ |
| Mark Staff Pick | ❌ | ✅ |

All checks happen **inside Convex mutations** (`ctx.auth.getUserIdentity()` + DB role lookup). The client never sends a role claim — it's always derived from the database.

### User Sync Pattern

A small `<UserSync>` client component calls `upsertUser` on mount after Clerk provides the session. This keeps name/email/avatar fresh on every sign-in without needing a webhook for the take-home scope.

### Real-time Updates

Convex queries are reactive by default. The shelf updates live when anyone adds or removes a recommendation — no polling, no websocket boilerplate.

### Security Considerations

- **No client-supplied roles** — roles are resolved server-side from `ctx.auth`.
- **Auth checks at mutation level** — public queries are intentionally read-only; mutations all gate on `ctx.auth.getUserIdentity()`.
- **URL validation** — link field is validated client-side (UX) and **server-side** in the Convex `add` mutation via `validateLink()`, which blocks non-http/https protocols (`javascript:`, `data:`, `ftp:`, etc.).
- **Ownership check** — `remove` checks `rec.userId === user._id` before allowing deletion.
- **External links** — all `<a>` tags to user-supplied URLs use `rel="noopener noreferrer"` and `target="_blank"`.
- **Admin assignment** — done via env var at first sign-up, not a self-service endpoint.

---

## Features

### Public page
- HypeShelf brand + tagline
- Live preview of the latest 10 picks (read-only)
- "Sign in to add yours" CTA wired to Clerk

### Authenticated shelf (`/shelf`)
- Full list of all recommendations with real-time updates
- Filter by genre (10 genres)
- Add recommendation modal with client-side validation
- Author avatars + names on each card
- Staff Pick badge (⭐) for admin-curated picks

### Roles

**Admin**
- Delete any recommendation
- Toggle Staff Pick on any recommendation
- Admin badge in the navbar

**User**
- Add recommendations
- Delete only their own recommendations
