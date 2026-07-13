#CLAUDE.md
## Purpose
Build and maintain an Events Attendees Registration Tool that registers customers for events and accurately tracks their attendance.

## Technology Stack
- Next.js 14 (App Router) — frontend and backend in a single TypeScript app
- Prisma + SQLite — data layer (see docs/architecture.md for the Postgres upgrade path)
- Tailwind CSS — mobile-first styling
- Custom session auth — JWT (`jose`) in an httpOnly cookie, bcrypt-hashed admin password
- Zod — validation for all external input

## Project Architecture Summary
- `src/app/` — routes only: pages and API route handlers, kept thin
- `src/components/` — frontend: UI primitives and feature components
- `src/server/` — backend: Prisma client, auth/session, validation schemas, and the service layer
- `src/types/` — shared TypeScript types
- Reads on server-rendered pages call the service layer directly; writes go through `src/app/api/**` route handlers
- **Business logic (capacity limits, duplicate-registration handling, check-in rules, etc.) belongs in `src/server/services/` — never in route handlers or page components.**
- For full implementation details — data model, auth flow, and known gaps — see `docs/architecture.md`.

## Rules – never break
- Always protect attendee personal data and ensure privacy.
- Never invent or fabricate attendee information.
- Use TypeScript for all new code.
- Never commit real attendee data or secrets to git.
- Keep all user-facing text professional and friendly.
# Where things live
- Main code → `src/` folder
- Documentation & specs → `docs/` folder
- Database schema/migrations → `db/` or `prisma/` folder
- UI components → `src/components/`
- Business logic → `src/server/services/` (not in routes or pages)

## Coding Conventions
- Write clean, readable TypeScript with good names.
- Route handlers and pages validate input, call a service, and shape the response — they never contain business logic themselves.
- Validate all external input with the Zod schemas in `src/server/validation/`.
- Typed errors (`src/server/errors.ts`) map to HTTP status codes — don't hand-roll error responses per route.

## How we work
- Prefer small, focused tasks and commits.
- Make the app mobile-friendly and easy to use.
- Break complex features into simple steps.
- Keep language simple and professional.