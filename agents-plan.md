# Orchestrator Plan — Tulip Event Readiness

## The big job

"Prepare an event for successful registration and execution."

## Why this is too broad for one agent

This job spans four genuinely different concerns, touching different parts of the
system with different risk profiles:

- **Data quality**, checked *before* an event exists at all (is the content actually
  usable, not just schema-valid?).
- **The public attendee-facing registration flow**, which writes live data and must
  never be confused with admin-side actions.
- **Admin-side operational tooling** for the day of the event (check-in, CSV export),
  which is read-only here but touches attendee PII and is bound by Tulip's existing
  `guardrail.md`.
- **Security boundary verification** on admin routes, which needs to run *without*
  credentials — the opposite posture of every other check.

A single agent covering all four would need conflicting permissions at once (create
vs. never-create, authenticated vs. deliberately-unauthenticated, read vs. write) and
a single failure in one area would be indistinguishable from a failure in another.
Splitting by concern keeps each agent's guardrail simple enough to actually hold, and
keeps a failure traceable to exactly one part of "readiness."

## Sub-agents

### 1. Event Readiness Validator

**Task:** Given proposed event fields (title, description, location, start/end times,
capacity), check their content/readiness before event creation. Flag placeholder or
vague values, inconsistent dates/times, empty-ish descriptions, and obviously unusable
values.

**Guardrail:** Read-only. It may inspect and score proposed fields but must never
create or modify an Event record or call `POST /api/events` itself.

**Expected evidence/output:** A per-field pass/fail readiness report, e.g.
`{ field: "location", status: "FAIL", reason: "literal placeholder 'TBD'" }`, plus an
overall READY / NOT READY verdict for the proposed event content.

---

### 2. Registration-Flow Verifier

**Task:** Exercise the real public registration flow against an existing event,
including fresh registration, capacity-boundary rejection, and duplicate-registration
handling, and report pass/fail per step.

**Guardrail:** May only use the public unauthenticated registration endpoint with
clearly fake test data. It must never touch a real attendee record, never call an
admin-authenticated route, and never create more than a small fixed number of test
registrations without explicit orchestrator approval.

**Expected evidence/output:** Step-by-step pass/fail (fresh registration / capacity
rejection / duplicate handling), plus the specific test registration IDs and check-in
codes it created, so they can be identified and cleaned up afterward.

---

### 3. Check-in & Export Readiness Checker

**Task:** Confirm the day-of-event admin tools work for the selected event by checking
that the check-in page renders the registrant list correctly and that CSV export
returns the expected structure.

**Guardrail:** Read-only admin actions only. It may view the check-in page and `GET`
the export to inspect its shape, but must never call the check-in mutation and must
never transmit, email, upload, or otherwise share the CSV outside Tulip. Reports must
contain counts/headers only, never attendee PII.

**Expected evidence/output:** e.g. "Check-in page renders N registrants" and "CSV has
the expected 6 headers (Name, Email, Phone, Status, Checked in at, Registered at) and N
rows" — counts and structure only, no attendee data values.

---

### 4. Admin Access Guard Checker

**Task:** Verify that admin-only actions for event creation, check-in, and CSV export
reject unauthenticated requests.

**Guardrail:** May only send requests without valid credentials to confirm they are
rejected. It must never attempt to log in, guess credentials, or use real admin
credentials from `.env`.

**Expected evidence/output:** Per-route pass/fail on "returns 401 when unauthenticated"
for `POST /api/events`, `POST /api/registrations/[id]/check-in`, and
`GET /api/events/[id]/registrations/export`.

## How the orchestrator combines the four outputs

The orchestrator only splits, delegates, collects, and checks — it does not perform
any of the four tasks itself. Once all four sub-agents report back (or fail to), it:

1. Collects the four individual verdicts — PASS/READY, an actual FAIL, or BLOCKED
   (the sub-agent never ran or never produced evidence at all).
2. Checks for internal consistency — e.g., the Registration-Flow Verifier and the
   Check-in & Export Checker should be looking at the *same* event; a mismatch is
   itself a finding, not something to silently reconcile.
3. Produces exactly one of three aggregate states — never a blend of them:

   - **READY** — all four required sub-agents actually ran, all four completed
     successfully, and every required check reports PASS/READY. Only under this
     exact condition may the orchestrator issue READY.
   - **NOT READY** — all four required sub-agents actually ran, but one or more
     completed checks reports an actual failure. The orchestrator must identify
     exactly which check(s) failed and why, using each agent's own evidence rather
     than re-deriving or guessing at the cause itself.
   - **INCOMPLETE / BLOCKED** — one or more required sub-agents did not run, or
     were blocked before producing any evidence. The orchestrator must name which
     agent(s) are blocked and why. It must **not** convert missing evidence into a
     failure, and it must **not** issue READY. It must state plainly that
     readiness cannot yet be determined from the evidence available.

   A sub-agent that never ran has not "failed" — a failure requires evidence that a
   check actually ran and came back negative. Missing evidence and a negative
   result are different findings and must never be reported as the same thing.

4. Does not retry, fix, or override a failing or blocked sub-agent's outcome on its
   own authority — both a failure and a block are surfaced for a human decision,
   not silently resolved.
