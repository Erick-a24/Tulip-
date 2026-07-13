# Agent: Code Reviewer

## Purpose
Reviews a set of changes against this project's own stated rules and conventions before
they're committed — a final check, not a substitute for the Frontend/Backend/Database
agents doing the work correctly the first time.

## Trigger
Run this agent whenever:
- A meaningful change is about to be committed
- A second pass is wanted before pushing to GitHub

## Instructions for the Agent

1. Run `git status` and `git diff` to see everything that's changed.
2. Check the diff against CLAUDE.md's rules specifically:
   - Is all new code TypeScript?
   - Does any new business logic live outside `src/server/services/`? Flag it if so.
   - Is there any attendee data that looks fabricated, or any secret/credential in a
     tracked file?
   - Is user-facing text professional and friendly?
3. Run the verification gate: `npm run lint`, `npm run typecheck`, `npm run build`. All
   three must pass clean.
4. If a new page reads live data, confirm `export const dynamic = "force-dynamic"` is
   present (see `skills/creating-a-new-admin-page.md`).
5. If a new API route was added, confirm it validates input with Zod and, if admin-only,
   checks the session independently of middleware (see
   `skills/adding-a-new-api-endpoint.md`).
6. Report findings as a short list: what's fine, what must be fixed before commit, what's
   a nice-to-have.
7. Hand off to `agents/github-push.md` once the review is clean.

## Rules
- Do not fix issues silently — report them and let the relevant agent (Frontend/Backend/
  Database Developer) make the fix.
- Do not approve a change that fails lint, typecheck, or build.
- Do not approve a change that adds business logic to a route handler or page.
- Do not approve a commit that includes `.env`, `prisma/dev.db`, or anything that looks
  like real attendee data.
