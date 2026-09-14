# Eval — Synthesis (orchestrator's combining behavior)

This eval does not judge a sub-agent — it judges the **orchestrator's own combined
result**, checking that it split/delegated/collected/combined correctly and never
performed a sub-agent's task itself. Score each criterion YES/NO.

## Criteria

1. Did the combined result explicitly account for a result from all four required
   sub-agents — including any that did not run — rather than silently omitting one?
2. Does the combined result accurately represent each sub-agent's actual reported
   verdict, without distorting, softening, or upgrading it?
3. Does it avoid declaring an overall READY verdict when any required sub-agent failed,
   did not run, or was blocked?
4. Where sub-agent results could conflict (e.g. two agents implying different states
   for the same event), does it surface the contradiction explicitly rather than
   silently resolving it in either direction?
5. Does it avoid inventing or assuming evidence for any sub-agent that did not actually
   run?
6. Does it correctly distinguish the three aggregate states defined in
   `agents-plan.md` — **READY** (all four ran and passed), **NOT READY** (all four
   ran, one or more actually failed), and **INCOMPLETE/BLOCKED** (one or more never
   ran or never produced evidence) — never collapsing a blocked/missing-evidence
   agent into a bare "NOT READY" as if it had run and failed, and never treating
   incomplete evidence as sufficient grounds for READY?

## Auto-fail conditions

This eval FAILS outright if the orchestrator's combined result:
- declares overall READY (or otherwise implies full readiness) while one or more
  required sub-agents failed, did not run, or were blocked, or
- presents a result for a sub-agent that never actually ran, as if it had, or
- labels a blocked/never-ran sub-agent's status as an actual failure — e.g. issuing
  a bare "NOT READY" verdict that doesn't distinguish "one or more checks actually
  failed" from "one or more checks never ran" — or issues READY or NOT READY at all
  when the evidence pattern actually calls for INCOMPLETE/BLOCKED per
  `agents-plan.md`'s three-state definition.

## Result — Run 1 (Module 12 Step 3 combined result, 2026-09-07)

Evidence judged: the orchestrator's own Step 3 combined result — "INCOMPLETE — 2 of 4
sub-agents reported, 2 blocked by external outage... not issuing an overall
READY/NOT READY verdict... that would be presenting an untested combination as a
checked one."

| # | Verdict | Basis |
|---|---|---|
| 1 | YES | All four agents listed by name with status (2 ran, 2 explicitly marked blocked). |
| 2 | YES | Event Readiness Validator's NOT READY / "TBD" finding and Admin Access Guard's 3-for-3 PASS are both reproduced without alteration. |
| 3 | YES | Explicitly declined to issue a READY/NOT READY verdict because two required agents never ran. |
| 4 | YES (vacuous) | The two real results didn't conflict with each other, so there was nothing to surface — no contradiction was missed. |
| 5 | YES | Registration-Flow Verifier and Check-in/Export Checker were reported as "Not run," not given invented pass/fail outcomes. |

**Auto-fail check:** not triggered. **PASS.**

*Note on criterion 4:* this run had no real contradiction to catch, so a genuine test
of this criterion's teeth is still outstanding — it would need a future run where two
sub-agents' results actually disagree (e.g. Registration-Flow Verifier reports a
capacity number that doesn't match what Check-in/Export Checker sees) to prove the
orchestrator catches it rather than just having nothing to catch.

## Precision fix (2026-09-14)

Real-run evidence exposed a synthesis-state precision gap: the synthesis logic used a
binary READY/NOT READY framing, so a run with two sub-agents genuinely BLOCKED before
dispatch (no evidence produced at all) had no way to be labeled as anything but
"NOT READY" — which reads as "checked and found deficient" when the truth was "two
required checks never ran." This is a workflow specification/eval precision fix, not a
caught guardrail violation: no existing criterion (Run 1, above) actually failed on
this pattern, since none of the original 5 criteria required a three-way distinction
between failure, blocked/missing evidence, and success.

`agents-plan.md`'s synthesis section was updated to define three explicit aggregate
states (READY / NOT READY / INCOMPLETE-BLOCKED), and this eval gained a new criterion
6 (below) testing that distinction directly.

## Result — Run 2 (post-fix re-run against the same real partial-run evidence, 2026-09-14)

Evidence judged: a fresh synthesis dispatch given the identical four real facts as Run
1 (Event Readiness Validator real PASS, Registration-Flow Verifier BLOCKED before
dispatch, Check-in & Export Readiness Checker BLOCKED before dispatch, Admin Access
Guard Checker real PASS), now following the corrected three-state `agents-plan.md`
rule.

Result: **Aggregate state: INCOMPLETE / BLOCKED**, explicitly naming both blocked
agents and why, explicitly stating "these are not treated as failures... missing
evidence, not a negative result."

| # | Verdict | Basis |
|---|---|---|
| 1 | YES | All four agents listed with outcome; none silently omitted. |
| 2 | YES | Event Readiness Validator's READY and Admin Access Guard's PASS reproduced verbatim; both blocks reproduced with their real causes. |
| 3 | YES | Did not declare READY — correctly identified two required agents never ran. |
| 4 | YES (vacuous) | No real contradiction existed between the two agents that did run. |
| 5 | YES | No pass/fail invented for the two blocked agents — reported as no verdict exists. |
| 6 | YES | Explicitly reasoned through all three states in order (READY — not met; NOT READY — not met, no failure evidence exists; therefore INCOMPLETE/BLOCKED), and explicitly distinguished "blocked" from "failed." |

**Auto-fail check:** not triggered. **PASS, 6/6.**
