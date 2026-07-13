# decision.md — Project Decision Log

A record of real choices made during this project, why we made them, and what we ruled out.

---

## Decision 1 — Use a fine-grained PAT with Contents: Read and write

**What we decided:**
Generate a new fine-grained Personal Access Token with explicit **Contents → Read and write** permission on the Tulip- repository.

**Why:**
The first token appeared valid — the GitHub API confirmed `"push": true` in the permissions response — but every `git push` returned a 403. After testing write access directly via the GitHub Contents API, the response was `"Resource not accessible by personal access token"`. The token had been created with only read access to contents, which is the default for fine-grained PATs.

**What we ruled out:**
- Keeping the first token and trying different push flags — the token itself was the problem, not the command.
- Using a classic PAT with the `repo` scope — would have worked, but regenerating a fine-grained token with the correct scope was the cleaner fix.

---

## Decision 2 — Keep CLAUDE.md at the project root

**What we decided:**
When we created the `instructions/` folder, we copied CLAUDE.md there for reference but kept the original at the project root.

**Why:**
Claude Code only reads project instructions from `CLAUDE.md` at the root of the working directory. Moving it into a subfolder would silently break the agent's ability to load the project rules — it would not raise an error, it would simply stop reading them.

**What we ruled out:**
- Moving CLAUDE.md fully into `instructions/` — would lose the agent integration.
- Using a symlink from root → instructions/CLAUDE.md — unnecessary complexity for a single file.

---

## Decision 3 — Implement Beads as a plain text `.beads` file

**What we decided:**
Use a simple text file with status symbols (`☐ ▶ ⌛ ☑`) rather than installing the full Beads CLI system.

**Why:**
The full Beads system from the GitHub repo requires installing the `bd` CLI via `curl`, a Dolt SQL database engine, and running `bd init`. On Windows, the curl install script is not directly runnable, and the exercise example itself showed a plain text file format — and `git add .beads` in the final step implies a single file, not a Dolt database directory.

**What we ruled out:**
- Installing the full `bd` CLI — too many dependencies for a Windows setup and beyond what the exercise required.
- Using a `.beads/` directory (Dolt format) — the exercise commit instruction and examples pointed to a single flat file.

---

## Decision 4 — Next.js full-stack architecture over separate frontend/backend

**What we decided:**
Build the Events Attendees Registration Tool as a single Next.js 14 (App Router) application — React frontend and API route handlers in one TypeScript codebase — instead of a separate React frontend and standalone Node/Express backend.

**Why:**
`CLAUDE.md`'s own folder layout (`src/`, `src/components/`, `prisma/`) already assumed a single-app structure. A combined app is simpler to run, deploy, and maintain for a solo/small team, with no cross-service networking or CORS to manage.

**What we ruled out:**
- Separate React (Vite) frontend + standalone Node/Express API — more moving parts, only worth it if the two ever needed to run on different hosts or be owned by different teams, which isn't the case here.

---

## Decision 5 — SQLite for the v1 database over PostgreSQL from day one

**What we decided:**
Use SQLite (via Prisma) as the database for v1, with the explicit expectation of migrating to PostgreSQL before a real production launch.

**Why:**
SQLite needs zero setup — no separate database server has to be running before the app works, which matters when scaffolding and testing locally. Prisma's schema/provider abstraction makes the future swap a config change (`datasource` provider + `DATABASE_URL`), not an application code change.

**What we ruled out:**
- PostgreSQL from the start — production-grade, but requires a running Postgres instance before the app can even be scaffolded and tested, which was unnecessary friction for v1.

---

## Decision 6 — Service-layer reads, API-route writes (read/write split)

**What we decided:**
Server-rendered pages call the service layer (`src/server/services/`) directly for reads. Writes (register, check in, create/edit/delete event, login/logout) go through `src/app/api/**` route handlers.

**Why:**
Calling the service layer directly for reads avoids a page fetching its own API over HTTP for data it could just query in-process — faster and simpler. Writes still need a real HTTP boundary because they're triggered from client (`"use client"`) components, which can only reach the server via `fetch()`.

**What we ruled out:**
- Building GET API routes for every read, purely for consistency — would add dead/unused endpoints, since no client component ever needed to fetch that data independently.
- Using Next.js Server Actions for all writes instead of API routes — would remove the need for route handlers entirely, but the project's brief explicitly asked for distinguishable "frontend" and "backend" deliverables, and a conventional REST-ish API layer is easier to point to and explain as "the backend."

---

## Decision 7 — Custom JWT session authentication over a third-party auth provider

**What we decided:**
Implement admin authentication ourselves: bcrypt-hashed password, a JWT (signed with `jose`) stored in an httpOnly cookie, verified by `src/middleware.ts` on every `/admin/**` request. The JWT signing/verification logic lives in `src/server/auth/jwt.ts`, separate from the cookie-reading/writing functions in `src/server/auth/session.ts`.

**Why:**
There's exactly one admin role and no OAuth/social login requirement, so a full auth library (e.g., NextAuth/Auth.js) would be more machinery than the problem needs. The `jwt.ts`/`session.ts` split exists because `session.ts` imports `next/headers` (via `cookies()`), which is not meant for use inside Edge Runtime middleware — keeping the JWT-only functions in a separate file with no such import means `src/middleware.ts` never risks pulling `next/headers` into the Edge bundle.

**What we ruled out:**
- NextAuth/Auth.js — unnecessary weight and configuration for a single hardcoded admin account with no social/OAuth login.
- Keeping JWT verification and cookie-store functions in one `session.ts` file — worked in this session but is a latent Edge Runtime risk the moment `src/middleware.ts` needs to import from it.

---

## Decision 8 — Idempotent registration and check-in instead of hard errors on retry

**What we decided:**
Registering again with an email that already has a registration for that event returns the existing registration instead of creating a duplicate or erroring. Checking in an attendee who is already checked in returns their current state instead of erroring.

**Why:**
Both are realistic accidental-retry scenarios — a parent double-submitting a form, an admin double-tapping "Check in" at a busy door — and neither should produce a user-facing error for something harmless. The unique `(eventId, attendeeId)` constraint on `Registration` makes the duplicate case detectable cheaply before it ever reaches the database as a conflict.

**What we ruled out:**
- Returning a `409 Conflict` for a repeat registration or repeat check-in — technically defensible, but a worse experience for what is almost always an accidental retry, not a real conflict.

---

## Decision 9 — `Registration.status` as a plain `String`, not a Prisma `enum`

**What we decided:**
Model `Registration.status` as `String @default("REGISTERED")` in `prisma/schema.prisma`, with the valid values (`"REGISTERED" | "CHECKED_IN" | "CANCELLED"`) enforced as a TypeScript union type (`RegistrationStatusValue` in `src/types/index.ts`) instead of a Prisma `enum`.

**Why:**
The schema originally used a Prisma `enum RegistrationStatus`. The first real `prisma generate` run (during dependency installation) failed with error `P1012`: SQLite's Prisma connector does not support native enum types. Switching to a `String` column fixed schema validation immediately; the TypeScript union type plus casts at each service function's return boundary (`as RegistrationWithAttendee`, etc.) preserves compile-time safety for consuming code (e.g., indexing `RegistrationTable`'s status-to-badge-color map) even though the database column itself is untyped.

**What we ruled out:**
- Switching the datasource off SQLite just to keep the enum — would have reversed Decision 5 to work around a modeling detail, a disproportionate fix.
- Leaving `status` as an untyped `string` everywhere with no narrower type — would have lost compile-time safety at every call site that assumes only three possible values.

---

## Decision 10 — `force-dynamic` on every page that reads live data

**What we decided:**
Add `export const dynamic = "force-dynamic";` to every page that reads from the database at render time (homepage, event detail, registration confirmation, admin dashboard, admin event editor, admin check-in).

**Why:**
Without it, Next.js can statically prerender a page with no explicit dynamic markers at `next build` time and serve that one frozen snapshot in production — invisible in `next dev`, where every page is always re-rendered per request regardless. A production build confirmed the fix: every one of those routes is listed as `ƒ` (dynamic) rather than `○` (static) in the build output.

**What we ruled out:**
- Relying on manual revalidation or on-demand cache invalidation — too easy to forget on a new page, and the wrong default for data (registration counts, check-in status) that changes on essentially every request.

---

## Decision 11 — Client-side attendee search instead of a new search API endpoint

**What we decided:**
The check-in screen's name/email search filters the registration list that was already loaded into the page, entirely in the browser — no new API route was added for it.

**Why:**
The full registration list for a single event is already fetched server-side and passed to `RegistrationTable` as props; filtering it client-side with `useMemo` is simpler than a new endpoint and has no perceptible downside at the attendee counts this app handles today.

**What we ruled out:**
- A server-side search/pagination endpoint — genuinely the right call at very large attendee counts, but unnecessary now; recorded as a deferred item in `docs/planning.md` rather than built speculatively.
