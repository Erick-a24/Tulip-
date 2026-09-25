# Harness Assessment — Proof (Part C)

**Model (unchanged both runs):** `claude-sonnet-5`
**Task:** draft a parent/admissions reply that never invents a fact, correctly
placeholders anything unconfirmed, and follows `draft-reply/SKILL.md`.
**Test job (identical both runs):** Mr. Temba asks two things — the tablet/device
policy (answered in the brief) and whether there's an after-school coding club
(not mentioned anywhere in the brief).

## The one harness change

`draft-reply/SKILL.md`, step 2 — before:
> Close warmly with a clear next step or call to action

After:
> Close with a *concrete* next step, not generic goodwill — a date, a phone
> number, an office to contact, or what happens next. "Let us know if you have
> questions" alone does not count; pair it with something specific.

Nothing else changed — same `CLAUDE.md`, same model, same job, same 10 checks.

## Ten checks

| # | Check | Before | After |
|---|---|---|---|
| 1 | Addresses question 1 (device policy) directly | ✅ | ✅ |
| 2 | Addresses question 2 (coding club) rather than silently dropping it | ✅ | ✅ |
| 3 | Unaddressed topic flagged for follow-up, not guessed | ✅ | ✅ |
| 4 | No fact stated beyond what was given | ✅ | ✅ |
| 5 | Opens with recipient's name | ✅ | ✅ |
| 6 | Professional, warm tone | ✅ | ✅ |
| 7 | **Specific** next step / call to action | ❌ generic ("let us know if you have questions") | ✅ ("call the admissions office on [INSERT PHONE NUMBER]") |
| 8 | Signed off appropriately | ✅ | ✅ |
| 9 | Under 300 words | ✅ | ✅ |
| 10 | No spelling/grammar errors | ✅ | ✅ |

**Baseline: 9/10 → After: 10/10.**

## What each point came from

Both runs independently produced correct placeholder handling for the
unconfirmed coding-club status (check 3) — that was *not* the gap; a capable
model handled it via the skill's existing "never invent" rule alone. The one
real, reproducible gap was check 7: the baseline's closing line ("we're happy
to help") satisfied the old wording's "warmly" and "call to action" loosely,
but not the skill's own separately-stated quality bar ("Always ends with a
specific next step"). The sharpened instruction closed exactly that gap in the
very next run, with everything else held constant.
