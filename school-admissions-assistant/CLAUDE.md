---
type: L1
last_verified: 2026-09-25
owner: it@silverleaf.co.tz
---

# CLAUDE.md — The Admin (router)

The Admin is Silverleaf Academy's School Admissions & Marketing Assistant: a live
Express chat app (`server.js`) plus a Claude Code job-queue loop that drafts the
same kind of content offline. This file is navigation only — detail lives in the
L2/L3 docs below. Read this first, every run.

## Critical rules — never break
- Never invent a specific fact (fee, date, deadline, policy). Use an obvious
  placeholder like `[INSERT FEE AMOUNT]` if it isn't known — see `guardrail.md`.
- Never send, publish, or mark a draft as sent — always "needs my OK".
- Never touch `.env` or put a secret/key in any file, log, or commit.
- Never modify `guardrail.md`, `quality-rubric.md`, `POLICY.md`, or
  `.claude/settings.json` without the owner's explicit review.
- Never write `CLAUDE.md` past 150 lines — a hook blocks it (see
  `docs/harness-loop.md`).

## Routing table — read the L2/L3 doc for your task, not everything

| Your task | Read |
|---|---|
| Understand the live chat app (auth, storage, request flow) | `docs/architecture.md` (L2) |
| Understand or run the Claude Code job-queue loop | `docs/harness-loop.md` (L2) |
| Draft a parent/admin reply | `.claude/skills/draft-reply/SKILL.md` (L3) |
| Check the autonomy boundary for a drafting task | `guardrail.md` (L3) |
| Score a drafted reply | `quality-rubric.md` (L3) |
| Check this harness's routing/reliability proof | `.claude/evals/` + its results |
| Check what's already been decided, tried, or broken | `.beads/decisions.jsonl`, `.beads/failures.jsonl` |
| Check what may change itself vs. what needs a person | `POLICY.md` (L3) |

## Where things live (pointers only — detail is in the docs above)
- `server.js`, `views/`, `public/`, `db/` — the live chat app.
- `guardrail.md`, `quality-rubric.md` — Module 10/11 rules (L3).
- `tasks.json`, `app-loop/` — the job queue (L2: `docs/harness-loop.md`).
- `.claude/agents/`, `.claude/skills/` — task-doer, verifier, draft-reply.
- `.claude/hooks/`, `.claude/settings.json` — sensors (L2: `docs/harness-loop.md`).
- `.beads/` — memory that survives a context reset.
- `.claude/evals/` — the report card.
