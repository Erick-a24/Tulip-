---
type: L2
last_verified: 2026-09-25
owner: it@silverleaf.co.tz
---

# The Claude Code harness loop (L2)

This is a second, separate system from the live chat app in `docs/architecture.md`
— it's how *Claude Code* (not a live parent) drafts and verifies content for this
project, offline, outside the `/api/chat` request path.

## The job queue — `tasks.json`
Shape: `{ settings, jobs: [...], log: [...], corrections: [...] }`. Each job has
`id, title, description, priority, status, result_note, created_at, updated_at`.
Status moves `waiting → working → needs_ok | done | stuck`.

## The scripts — `app-loop/`
- `pick-job.ps1` — picks the oldest highest-priority `waiting` job, marks it
  `working`, logs `"Started"`.
- `save-result.ps1` — writes the result back (`-Status`, `-Note`, three
  `-Score*` args), logs `"Completed | Scores: ..."`.
- `watcher.ps1` — polls `tasks.json` every 20s, prints `NEW_JOB_WAITING` when a
  new one appears.

## The agents — `.claude/agents/`
- `task-doer.md` — does one job at a time, drafts, never marks its own work
  done, never sends anything.
- `verifier.md` — scores Completeness/Accuracy/Usability (1–5 each) against
  `quality-rubric.md`'s rubric; pass = avg ≥4, nothing <3.

## The skill — `.claude/skills/draft-reply/SKILL.md`
The recipe `task-doer` follows for "draft a reply" jobs — extract, draft,
placeholder anything unconfirmed, close with a *concrete* next step, mark
"needs my OK", never send.

## Sensors — `.claude/hooks/`

**Wired into the repo-root `.claude/settings.json`, not this folder's own
`.claude/settings.json`.** `school-admissions-assistant/` has no `.git` of its
own, so Claude Code never reads a nested `.claude/settings.json` — confirmed
the hard way (`.beads/failures.jsonl`, `fail-001`). Each script below checks
`file_path` for a `school-admissions-assistant/` prefix before acting, so it
doesn't misfire on Tulip's own files.

- `check-secrets.ps1` — blocks writing an API key/password/token to any file.
- `protect-rules.ps1` — blocks overwriting `guardrail.md`, `quality-rubric.md`,
  or `.claude/settings.json`.
- `check-dangerous.ps1` — blocks destructive shell commands, including a
  force-push.
- `check-code.ps1` — syntax-checks a written code file (green/amber/red).
- `check-env-commit.ps1` — blocks a `git commit` while `.env` is staged.
- `check-claude-md-length.ps1` — blocks writing The Admin's `CLAUDE.md` past
  150 lines.
- `session-start-beads.ps1` — a `SessionStart` hook, prints open
  `.beads/status.jsonl` entries at session start.
- `session-end-log.ps1` — a `Stop` hook, appends a timestamped line to
  `.claude/session-log.md` when a session ends.

All hooks are silent on success (exit 0) and give a specific fix message on
failure (exit 2) — see the root `.claude/settings.json` for exactly which
lifecycle event each one fires on.

## Memory — `.beads/`
Append-only JSONL that survives a context reset: `status.jsonl` (open/closed
work items), `decisions.jsonl` (real architectural decisions + why),
`failures.jsonl` (real incidents + the lesson that prevents recurrence). A
`SessionStart` hook re-injects open beads at the start of every session.

## Report card — `.claude/evals/`
Eval tasks proving this router actually routes: for each, the question, the
doc that should load, the docs that should NOT load, and `max_hops`. Results
recorded as average hops and wrong-route rate.
