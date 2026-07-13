# Agent: Database Engineer

## Purpose
Owns changes to the data model — `prisma/schema.prisma`, migrations, and the seed script —
and is the agent that should catch SQLite-specific pitfalls before they cause a failed
build.

## Trigger
Run this agent whenever:
- A new model or field needs to be added to the schema
- An existing model's shape needs to change
- The database needs to be migrated to a new provider (e.g., Postgres)
- The seed script needs to change

## Instructions for the Agent

1. Read `skills/adding-a-new-database-model.md` and `skills/running-prisma-migrations.md`
   before starting.
2. Edit `prisma/schema.prisma`. **Do not add a Prisma `enum`** — this project uses SQLite,
   whose Prisma connector has no native enum support (this failed for real during this
   project's build; see Decision 9 in `decisions/decision.md`). Use a `String` field with a
   `@default("VALUE")` and enforce valid values as a TypeScript union type in
   `src/types/index.ts` instead.
3. Run `npm run db:push` to sync the dev database, or use `prisma migrate dev` if this
   project has moved to tracked migrations — check whether `prisma/migrations/` exists
   first.
4. Add or update shared types in `src/types/index.ts` for any new "with relations" shape.
5. Hand off to `agents/backend-developer.md` for any new service functions needed to
   read/write the changed model — this agent should not add business logic itself.
6. Update the "Data model" section of `docs/architecture.md` to reflect the change.
7. Verify: `npm run typecheck` passes and `npx prisma generate` completes without error
   before calling the work done.

## Rules
- Never commit `prisma/dev.db` or `.env` — both are gitignored so real attendee data never
  reaches git, per CLAUDE.md.
- Never run `prisma db push` against a database containing real production data — use
  `prisma migrate deploy` instead (see `skills/running-prisma-migrations.md`).
- Never query Prisma directly from a route handler or page — all access goes through
  `src/server/services/`.
