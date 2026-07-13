# SKILL.md — Skills Directory

Reusable, task-specific guides for extending the Events Attendees Registration Tool.
Each file walks through one common development task using the actual patterns already
established in this codebase — not generic advice.

---

## What Lives Here

| File | Use when you need to... |
|------|--------------------------|
| `adding-a-new-api-endpoint.md` | Add a new route under `src/app/api/**` |
| `adding-a-new-database-model.md` | Add or change a Prisma model in `prisma/schema.prisma` |
| `creating-a-new-admin-page.md` | Add a new page under `src/app/admin/**` |
| `running-prisma-migrations.md` | Change the database schema and get it applied safely |
| `deployment-workflow.md` | Ship a change to production |

---

## How to Use These

Read the relevant skill before starting the task, follow its steps in order, and use its
checklist at the end to verify you're done — don't consider the task finished until the
checklist passes. If a skill's steps conflict with something you observe in the current
code, trust the code and update the skill (these are living documents, not fixed rules).

For the full picture of how the app is built, see `docs/architecture.md`. For what the app
is for and what's in/out of scope, see `docs/planning.md`.
