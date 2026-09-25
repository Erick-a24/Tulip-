# CLAUDE.md — The Admin

## What this project is
The Admin is Silverleaf Academy's School Admissions & Marketing Assistant — an
Express + SQLite chat app (`server.js`) that answers parent/admissions/marketing
questions and drafts communications, plus a Claude Code job-queue loop
(`tasks.json` + `app-loop/`) that performs the same drafting task offline.

## Rules — never break
- Never invent a specific fact (fee, date, deadline, policy). If it isn't known,
  use an obvious placeholder like `[INSERT FEE AMOUNT]` — see `guardrail.md`.
- Never send, publish, or mark a draft as sent — always "needs my OK".
- Never touch `.env` or put a secret/key in any file, log, or commit.
- Never modify `guardrail.md`, `quality-rubric.md`, or `.claude/settings.json`
  without the owner's explicit review — same standard as the approved Module 11
  guardrail.
- Keep tone professional and friendly; never fabricate attendee/parent data.

## Where things live
- `server.js` — the live chat app (`/api/chat`), login, SQLite history.
- `views/`, `public/` — the chat UI.
- `db/` — SQLite schema/scripts for chat history.
- `guardrail.md` — the approved autonomy boundary (Module 11).
- `quality-rubric.md` — the 5-criterion quality bar (Module 10).
- `tasks.json` — the job queue (waiting → working → needs_ok/done).
- `app-loop/` — `pick-job.ps1`, `save-result.ps1`, `watcher.ps1`.
- `.claude/agents/` — `task-doer.md` (drafts), `verifier.md` (scores against
  `quality-rubric.md`'s rubric).
- `.claude/skills/draft-reply/` — the recipe for drafting a reply.
- `.claude/hooks/` — secret/dangerous-command/protected-file guards.

## How we work
- One job at a time; draft, then verify against the scorecard before marking done.
- Small, focused changes. Re-read this file every run.
