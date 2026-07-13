# Skill: Deployment Workflow

## Pre-deploy checklist

Run these locally and require all three to pass clean before deploying — this is the exact
sequence used to verify every change in this project so far:

```
npm run lint
npm run typecheck
npm run build
```

## Environment variables

Set these on your hosting platform's environment/secrets config — never commit them:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Production database connection string |
| `SESSION_SECRET` | Long random string, **different from your dev value** — signs admin session JWTs |
| `ADMIN_EMAIL` | Used once by `npm run db:seed` to create the admin account |
| `ADMIN_PASSWORD` | Same — change it immediately after first deploy if it was ever typed in plaintext anywhere |

## Database

SQLite (the current dev database) is a file on disk — it does not survive most
container/serverless redeploys, and it doesn't support concurrent writes from multiple
server instances. **Migrate to Postgres (or another server-based database) before a real
production launch.** The schema is already written to make this a config-only change:
update `provider` and `url` in `prisma/schema.prisma`'s `datasource` block and the
`DATABASE_URL` env var — no application code changes are required.

Before the app serves traffic:
1. Apply the schema: `npx prisma migrate deploy` (once real migrations exist — see
   `running-prisma-migrations.md`) or `npx prisma db push` (current pre-migration approach).
2. Seed the admin account: `npm run db:seed`, with production `ADMIN_EMAIL` /
   `ADMIN_PASSWORD` set in the environment.

## Known gaps to close before a real production launch

Carried over from `docs/architecture.md` — review before going live with real users:

- No rate limiting on `/api/auth/login` or the public registration endpoint.
- Single admin account only — no invite flow or password reset.
- No camera-based QR scanning at check-in (manual search-and-click only).
- SQLite doesn't scale past one server instance (see Database section above).

## Git workflow

Commit and push to `main` before or as part of deploying — see `agents/github-push.md` for
this project's commit hygiene rules (never blind `git add -A`, never commit `.env` or real
attendee data, specific present-tense commit messages).

## After deploying

Smoke-test the same flows verified locally during this project's build, then clean up any
test data:
1. Homepage loads and lists events.
2. Admin login works; `/admin` is reachable when signed in and redirects to `/admin-login`
   when not.
3. Create a test event, register for it as a public attendee, confirm the QR/check-in code
   page loads.
4. Check the test registration in as admin; confirm status updates.
5. Export the CSV and confirm it reflects the check-in.
6. Delete the test event (cascades its registrations) so no test data lingers in production.
