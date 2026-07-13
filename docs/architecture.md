# Architecture — Events Attendees Registration Tool

## Stack

- **Framework:** Next.js 14 (App Router), TypeScript throughout.
- **Database:** SQLite via Prisma (swap the `datasource` provider in `prisma/schema.prisma` for Postgres/MySQL later — the app code does not change).
- **Auth:** Custom session cookie (JWT signed with `jose`), bcrypt-hashed admin password. No third-party auth provider.
- **Styling:** Tailwind CSS, mobile-first.

## Layers

```
src/
├── app/                 Routes only — pages and API handlers. Kept thin.
│   ├── (site)/          Public pages: browse events, register, confirmation.
│   ├── admin-login/     Public admin sign-in page.
│   ├── admin/           Guarded by src/middleware.ts — dashboard, event editor, check-in.
│   └── api/             REST handlers for client-triggered mutations, plus the CSV export.
├── components/          Frontend — UI primitives (ui/) and feature components.
├── server/              Backend — all business logic lives here, framework-agnostic.
│   ├── db/prisma.ts     Prisma client singleton.
│   ├── auth/session.ts  JWT session issuing/verification, cookie helpers.
│   ├── validation/      Zod schemas — the single source of truth for input shape.
│   ├── services/        eventService, registrationService, authService.
│   └── errors.ts        Typed errors mapped to HTTP status codes.
└── types/               Shared TypeScript types derived from Prisma models.
```

**Rule of thumb:** route handlers and pages never contain business logic — they validate input, call a service, and shape the response. All rules (capacity limits, duplicate registration handling, check-in idempotency) live in `src/server/services/`.

## Data model

- `Event` — title, description, location, start/end time, optional capacity.
- `Attendee` — name, email (unique), optional phone. Looked up/created by email so the same person can register for multiple events without duplicate records.
- `Registration` — links an `Attendee` to an `Event`, holds a unique `checkInCode` and a status (`REGISTERED` → `CHECKED_IN`, or `CANCELLED`). One registration per attendee per event (enforced by a unique constraint).
- `Admin` — organizer accounts. Seeded from `.env`, never fabricated.

## Read/write split

- **Reads** on server-rendered pages call the service layer directly (no self-fetch over HTTP) for speed and simplicity.
- **Writes** (register, check in, create/edit/delete event, login/logout) go through `src/app/api/**` route handlers so the browser has a real HTTP boundary to call from client components.

## Auth flow

1. Admin submits email/password to `POST /api/auth/login`.
2. `authService.login` verifies against the bcrypt hash, and on success a signed JWT is set as an httpOnly cookie.
3. `src/middleware.ts` checks that cookie on every `/admin/**` request and redirects to `/admin-login` if missing/invalid.
4. Admin-only API routes (`POST /api/events`, `PATCH/DELETE /api/events/[id]`, `POST /api/registrations/[id]/check-in`, `GET /api/events/[id]/registrations/export`) independently verify the session — middleware only protects page routes.

## Check-in tools

- The check-in screen (`/admin/events/[eventId]/check-in`) has a client-side name/email search over the already-loaded registration list — fine at typical event sizes; would need server-side search if a single event routinely has thousands of registrants.
- `GET /api/events/[eventId]/registrations/export` streams a CSV (`Content-Disposition: attachment`) of all registrations for an event — name, email, phone, status, check-in time, registration time. Linked from the check-in page as "Export CSV".

## Known gaps for a v2

- No password reset / multi-admin management UI.
- No email confirmation sent to attendees (the confirmation page + QR code is the only receipt today).
- No camera-based QR scanning at check-in — the admin looks up and clicks "Check in" manually; the QR code is there for a future scanner integration.
- No rate limiting on `/api/auth/login` or the public registration endpoint.
- SQLite is fine for one instance but not for concurrent writes across multiple server instances — swap to Postgres before scaling past a single box.
