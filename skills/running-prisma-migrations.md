# Skill: Running Prisma Migrations

## Current workflow (v1 — solo dev, SQLite)

This project currently uses `prisma db push` — it syncs the database to match
`prisma/schema.prisma` directly, with **no migration history file** generated or committed.
That's a deliberate, acceptable shortcut while there's a single developer and no production
database with real attendee data on the line yet. It is not appropriate once either of those
stops being true.

1. Edit `prisma/schema.prisma`.
2. Run `npm run db:push` (wraps `prisma db push`, then regenerates the Prisma Client).
3. Run `npm run db:seed` if the change affects seed data (e.g., a fresh admin account).

## Switching to real migrations (do this before production)

`db push` can silently drop columns or data when a change isn't backward-compatible, and it
leaves no record of what changed or when. Before this app holds real attendee data, or once
more than one person touches the schema, switch to Prisma's migration system:

1. Establish a baseline from the current schema:
   ```
   npx prisma migrate dev --name init
   ```
   This creates a timestamped folder under `prisma/migrations/` — **commit this folder to
   git.** Unlike `db push`, migration files are meant to be version-controlled.

2. For every schema change after that:
   ```
   npx prisma migrate dev --name describe-the-change
   ```
   This generates a new migration file and applies it to your local dev database.

3. In production, use:
   ```
   npx prisma migrate deploy
   ```
   **Never run `prisma db push` against a database containing real data** — it has no
   safety checks for destructive changes. `migrate deploy` only applies migrations that
   haven't run yet, in order, and is the safe production command.

## The SQLite enum gotcha (will bite you during a migration)

Prisma's SQLite connector has no native `enum` support. If you add an `enum` block to
`schema.prisma`, `prisma generate` (and thus both `db push` and `migrate dev`) will fail
with error `P1012`. Use a `String` field with a `@default("VALUE")` instead, and enforce the
allowed values as a TypeScript union type in application code — see
`adding-a-new-database-model.md` and `RegistrationStatusValue` in `src/types/index.ts` for
the pattern already used in this codebase.

## After any schema change

Regenerate the Prisma Client so TypeScript sees the new types:
```
npx prisma generate
```
This already runs automatically via the `postinstall` npm script, but re-run it manually if
your editor is showing stale types.
