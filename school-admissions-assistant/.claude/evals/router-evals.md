---
type: L3
last_verified: 2026-09-25
owner: it@silverleaf.co.tz
---

# Router evals — The Admin

Four eval tasks proving `CLAUDE.md` actually routes to the right doc, fast.
Each was run as a fresh Agent-tool dispatch (no prior context of this repo)
given only the question and told to read `CLAUDE.md` first, then find the
answer. Hops = number of files read *after* `CLAUDE.md` to reach the answer.

## 1. Explicit

**Question:** "What is the autonomy dial and rule for drafting a marketing/communications reply?"
**Should load:** `guardrail.md` (L3)
**Should NOT load:** `docs/architecture.md`, `db/schema.sql`, `README.md`
**max_hops:** 1

## 2. Implicit

**Question:** "How is a drafted reply scored before it's marked done?"
**Should load:** `quality-rubric.md` (L3)
**Should NOT load:** `docs/architecture.md`, `db/schema.sql`
**max_hops:** 1

## 3. Contextual

**Question:** "When a browser user visits the site without being logged in, what happens?"
**Should load:** `docs/architecture.md` (L2)
**Should NOT load:** `docs/harness-loop.md`, `tasks.json`, `app-loop/*`
**max_hops:** 1

## 4. Negative

**Question:** "What Postgres tables does the live chat app read from for parent and fee records?"
**Should load:** `docs/architecture.md` (L2) — and the correct answer is *none*;
`db/schema.sql` is documented there as not wired into `server.js`.
**Wrong route:** treating `db/schema.sql`'s tables as live/current without
the `docs/architecture.md` caveat.
**max_hops:** 1

## Results

Run 2026-09-25, four independent Agent-tool dispatches (fresh context each,
no prior knowledge of this repo, told only to read `CLAUDE.md` first).

| # | Type | Files read after CLAUDE.md | Hops | Correct? | Wrong-route? |
|---|---|---|---|---|---|
| 1 | Explicit | `guardrail.md` | 1 | ✅ | No |
| 2 | Implicit | `quality-rubric.md` | 1 | ✅ | No |
| 3 | Contextual | `docs/architecture.md` → `server.js` (grep) | 2 | ✅ (right doc, over `max_hops`) | No |
| 4 | Negative | `docs/architecture.md` only | 1 | ✅ | No |

**Average hops: 1.25** (target ≤2 — met).
**Wrong-route rate: 0/4 = 0%** (target <5% — met). No eval loaded a file from
its "should NOT load" list or reached an incorrect/misleading answer.

**Honest miss:** eval 3 exceeded its own per-task `max_hops: 1` — the agent
read the correct L2 doc but took a second hop into `server.js` to verify the
auth mechanism against source rather than trusting the doc's own description.
Not a wrong route (no excluded file was touched), but not a clean 1-hop
answer either — a real signal that `docs/architecture.md`'s auth section
could be made more self-sufficient.

**Cost:** `subagent_tokens` reported per dispatch: 40,301 / 41,014 / 41,879 /
41,590 = **164,784 tokens total**. This is an aggregate figure, not a
verified input/output split, so the dollar figure below is an **estimate**,
not an exact billed cost: assuming ~97% input / ~3% output (reasonable for a
short read-and-answer task, dominated by file-content and system-prompt
tokens against a capped ~100-word answer) at Sonnet 5 rates ($2.00/MTok in,
$10.00/MTok out): **≈ $0.37 total, ≈ $0.09 per eval.**
