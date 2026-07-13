# Skill: Adding a New Database Model

Use this when the app needs to persist a new kind of data (e.g., a new entity beyond
`Admin`, `Event`, `Attendee`, `Registration`).

## Steps

1. **Add the model to `prisma/schema.prisma`.** Follow the existing style: `id` as
   `String @id @default(cuid())`, explicit relation fields, `onDelete: Cascade` where a
   child record has no meaning without its parent (see how `Registration` relates to
   `Event` and `Attendee`).

2. **Watch for the SQLite enum gotcha.** This project uses SQLite, and Prisma's SQLite
   connector does **not** support native `enum` types — `prisma generate` will fail with
   `P1012` if you add one. Instead:
   - Use a `String` field with a `@default("SOME_VALUE")`.
   - Define the allowed values as a TypeScript union type in `src/types/index.ts` (see
     `RegistrationStatusValue` for the existing example) and enforce it in application code,
     not the database.
   - Prisma's return type for that field will be plain `string` — cast to your narrower
     union type at the service boundary (see the `as RegistrationWithAttendee` casts in
     `src/server/services/registrationService.ts`).

3. **Sync the database.** Run `npm run db:push` (dev-only, no migration history — see
   `running-prisma-migrations.md` for when to switch to real migrations).

4. **Add shared types.** If the model needs a "with relations" shape used across multiple
   files (e.g., an event with its attendee count), add it to `src/types/index.ts` rather
   than redefining it inline wherever it's used.

5. **Add a service, not raw queries elsewhere.** Create a new file in
   `src/server/services/` (or extend an existing one if it clearly belongs there) with only
   the functions the app actually needs right now — don't build generic CRUD speculatively.
   Never call `prisma.yourModel.*` directly from a route handler or a page component.

6. **Add validation.** If the model is created/updated from user input, add a Zod schema to
   `src/server/validation/schemas.ts`.

7. **Update the docs.** Add the new model to the "Data model" section of
   `docs/architecture.md` so it stays accurate.

## Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run db:push` ran without errors
- [ ] No raw `prisma.*` calls outside `src/server/services/`
- [ ] `docs/architecture.md`'s data model section updated
