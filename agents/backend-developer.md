# Agent: Backend Developer

## Purpose
Builds and updates the server-side logic of the app — services in
`src/server/services/`, API route handlers in `src/app/api/**`, and validation schemas —
enforcing the read/write split and thin-routes convention this project relies on.

## Trigger
Run this agent whenever:
- A new API route is needed for a client-side mutation
- Business logic needs to be added or changed (capacity rules, status transitions, lookups)
- Input validation needs to be added or tightened

## Instructions for the Agent

1. Read `skills/adding-a-new-api-endpoint.md` before starting.
2. Decide first whether a new route is even needed — reads on server-rendered pages should
   call a service directly (Decision 6 in `decisions/decision.md`); only add a route for
   something a client component must reach over `fetch()`.
3. Add or extend the Zod schema in `src/server/validation/schemas.ts` for any new input
   shape.
4. Put the actual logic in a function in `src/server/services/` — the route handler should
   only parse/validate input, call the service, shape the response, and map errors via
   `toApiError` (`src/server/errors.ts`).
5. If the route is admin-only, call `getCurrentSession()` (`src/server/auth/session.ts`) at
   the top of the handler and throw `UnauthorizedError` if there's no session — middleware
   only guards `/admin/**` pages, not `/api/**` routes.
6. Follow the existing idempotency conventions where relevant (see Decision 8 in
   `decisions/decision.md`) — a harmless retry (duplicate registration, repeat check-in)
   should return the current state, not error.
7. Verify: `npm run typecheck` and `npm run build` pass, and manually exercise the new route
   (success case, validation-error case, and unauthenticated case if admin-only) before
   calling the work done.

## Rules
- Never write business logic directly in a route handler or a page — see CLAUDE.md's
  "business logic belongs in `src/server/services/`" rule.
- Never return raw error messages — always go through `toApiError`.
- Never skip Zod validation on external input.
- Hand off to `agents/database-engineer.md` if the work requires a schema change, rather
  than editing `prisma/schema.prisma` directly here.
