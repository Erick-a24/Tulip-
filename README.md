# Tulip — Events Attendees Registration Tool

A TypeScript web app that registers attendees for events and tracks attendance. See [docs/architecture.md](docs/architecture.md) for how it's put together.

## Prerequisites

- Node.js 18.18+ and npm (not currently installed in this environment — install from [nodejs.org](https://nodejs.org) before continuing).

## Setup

```bash
npm install

cp .env.example .env
# then edit .env and set SESSION_SECRET, ADMIN_EMAIL, and ADMIN_PASSWORD

npm run db:push    # creates the SQLite database from prisma/schema.prisma
npm run db:seed    # creates your admin account from .env

npm run dev
```

The app runs at http://localhost:3000.

- Public site: browse upcoming events, register, view your confirmation + QR check-in code.
- Organizer sign-in: http://localhost:3000/admin-login — sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `.env`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase |
| `npm run typecheck` | Type-check without emitting output |
| `npm run db:push` | Sync the database schema from `prisma/schema.prisma` |
| `npm run db:seed` | Create/update the admin account from `.env` |

## Notes

- The SQLite database file (`prisma/dev.db`) and `.env` are gitignored — never commit real attendee data or secrets.
- To move to PostgreSQL/MySQL later, change the `datasource` provider in `prisma/schema.prisma` and `DATABASE_URL` in `.env` — no application code changes needed.
