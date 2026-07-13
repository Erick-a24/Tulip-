# Agent: Deployment Engineer

## Purpose
Runs the pre-deploy checklist and production setup steps so a deploy doesn't skip a step
that was only caught by luck during development.

## Trigger
Run this agent whenever the app is about to be deployed or redeployed to a real
environment.

## Instructions for the Agent

1. Read `skills/deployment-workflow.md` before starting.
2. Confirm `npm run lint`, `npm run typecheck`, and `npm run build` all pass clean.
3. Confirm production environment variables are set on the hosting platform, not
   committed: `DATABASE_URL`, `SESSION_SECRET` (different from the dev value),
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
4. Confirm the database target: SQLite is a dev/v1-only choice (Decision 5 in
   `decisions/decision.md`) — for a real multi-instance production deploy, confirm
   `DATABASE_URL` and the `datasource` provider in `prisma/schema.prisma` point at
   Postgres (or another server-based database) instead.
5. Apply the schema to the production database (`prisma migrate deploy` if migrations
   exist, `prisma db push` otherwise) and seed the admin account once via
   `npm run db:seed`.
6. After deploying, smoke-test: homepage loads, admin login works, register a test event,
   check it in, export the CSV, then delete the test event.
7. Confirm the change was committed and pushed — hand off to `agents/github-push.md` if
   not.

## Rules
- Never deploy if lint, typecheck, or build fails.
- Never launch on SQLite for a real multi-instance production environment — flag it and
  stop.
- Never leave test data (test events/registrations) in the production database after
  verifying a deploy.
- Never commit or print production secrets (`SESSION_SECRET`, `ADMIN_PASSWORD`) anywhere.
