# POLICY.md — The Admin's draft-reply loop

## May change itself alone (no human needed)

| Action | Why this side of the line |
|---|---|
| Retry a failed draft with the critic's exact reason fed back, up to the 3-try cap | Bounded, reversible — nothing leaves the system regardless of outcome (`loop.js`) |
| Draft a reply to a new job in `tasks.json`, marked `needs_ok` | Already the approved Module 11 guardrail (8/10 autonomy) — a draft is not an action |
| Route to the correct doc via `CLAUDE.md`'s routing table | Pure information retrieval, no side effect |
| Append to `.beads/status.jsonl`, `.claude/session-log.md` | Observational record-keeping, not a decision |
| Run `critic.js` and record pass/fail | Mechanical check against an already-approved rule, no judgment call |

## Only with a person

| Action | Why this side of the line |
|---|---|
| Send, publish, or mark anything as sent | The one rule `guardrail.md` exists for — money/reputation risk, irreversible |
| Modify `guardrail.md`, `quality-rubric.md`, `CLAUDE.md`'s rules, `.claude/settings.json`, or `critic.js`'s checks | Letting the system rewrite the rules that govern itself is exactly what stays human, by default |
| Raise the retry cap or loosen the escalation threshold | A risk-tolerance decision, not a capacity setting the loop should adjust on itself |
| `git commit` / `git push` | Already enforced by the harness's own `ask` permission — same standard used throughout this project |
| Add a new critic check for a newly observed failure | Deciding what counts as a checkable failure is the judgment call Parts A–D exist to make deliberately, not something the loop should infer alone |
| Edit or delete a past `.beads/` entry | Append-only by design — "never edit a prior line; the history is the value" |
| Fine-tune or retrain the model | See the five-point check below — a different engineering job, not a setting to flip |

## The five-point fine-tune check

| # | Question | Answer |
|---|---|---|
| 1 | Narrow — one well-defined, repeating task? | **Yes** — drafting a reply to a parent/admin inquiry is well-scoped |
| 2 | High volume — worth the effort? | **No** — realistically a handful of drafts a week, not enough to justify it |
| 3 | Real dataset — actual good/bad examples? | **Partial** — Parts B–D produced real examples, but only a few dozen, not a curated dataset |
| 4 | Measurable — can prove a new model wins? | **Partial** — `critic.js` + `quality-rubric.md` give a scoring mechanism, but it hasn't been run at the scale needed to prove anything |
| 5 | Stable — task not changing every few weeks? | **Yes** — school policies and typical questions don't churn weekly |

**2.5 out of 5 — the answer is fix the system, not the model.** The rung actually being climbed here is **#5, the check** — Part D's real finding wasn't that the model can't draft well; it's that the critic's own regex was too narrow to recognize an equally-valid phrasing ("reply to this email by [date]"). That's an afternoon fix to a check, not a case for touching the weights.

*(Since the answer isn't 5/5, the three-lines-on-what-you'd-own section doesn't apply — noting that rather than writing it anyway.)*
