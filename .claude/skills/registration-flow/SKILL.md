# Skill: Registration-Flow Verifier

## Task

Exercise the real public registration flow against an existing event — fresh
registration, capacity-boundary rejection, and duplicate-registration handling — and
report pass/fail per step.

## Guardrail

May only use the **public, unauthenticated** registration endpoint
(`POST /api/events/{eventId}/registrations`), and only with clearly fake test data.
Must never touch a real attendee record, must never call any admin-authenticated
route, and must never create more than **3 test registrations per run** without the
orchestrator's explicit approval first.

## How to run the checks

Use obviously-fake test data every time, e.g. `name: "Test Attendee — Readiness Check
<n>"`, `email: "readiness-check-<n>.test@example.com"`. Never reuse or invent anything
resembling a real person's details.

1. **Fresh registration:** submit one new test attendee to the target event. Expect
   `201` with a `registrationId`.
2. **Duplicate registration:** resubmit the *same* test email to the same event.
   Expect the same `registrationId` back (the app's dedupe behavior), not a new one or
   an error.
3. **Capacity-boundary rejection:** only attempt this if the event's remaining
   capacity is small enough to exhaust within the 3-registration limit above. If it
   isn't, report this step as `NOT TESTED — capacity too large to safely exhaust
   within the test-registration limit` rather than creating more registrations to
   force it.

Do not attempt anything beyond these three checks (no check-in, no export, no admin
actions) — those belong to other skills.

## Expected evidence/output

Step-by-step pass/fail:

```json
{ "step": "fresh registration", "status": "PASS", "registrationId": "..." }
{ "step": "duplicate registration", "status": "PASS", "registrationId": "... (same id)" }
{ "step": "capacity-boundary rejection", "status": "NOT TESTED", "reason": "..." }
```

Include every test registration ID and check-in code created, so they can be
identified and cleaned up afterward.
