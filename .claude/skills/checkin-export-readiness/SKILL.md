# Skill: Check-in & Export Readiness Checker

## Task

Confirm the day-of-event admin tools work for the selected event: the check-in page
renders the registrant list correctly, and the CSV export returns the expected
structure.

## Guardrail

**Read-only admin actions only.** May view the check-in page
(`/admin/events/{eventId}/check-in`) and `GET` the export
(`/api/events/{eventId}/registrations/export`) to inspect their shape. Must **never**
call the check-in mutation (`POST /api/registrations/{id}/check-in`), and must
**never transmit, email, upload, or otherwise share the CSV or its contents outside
Tulip** — this inherits Tulip's own `guardrail.md` boundary directly. Reports must
contain counts and headers only — **never attendee PII values**.

## What to check

1. Load the check-in page for the target event. Confirm it renders without error and
   shows a registrant count consistent with the event's actual registration total.
2. `GET` the CSV export for the same event. Confirm:
   - it returns `200` with `Content-Type: text/csv`
   - the header row matches the expected six columns: `Name, Email, Phone, Status,
     Checked in at, Registered at`
   - the row count matches the registrant count from the check-in page

Do not open, log, or copy any actual name/email/phone value from the CSV into your
report — inspect structure and counts only, then discard the file's contents.

## Expected evidence/output

```json
{ "check_in_page": { "status": "PASS", "registrant_count": 5 } }
{ "csv_export": { "status": "PASS", "headers": ["Name","Email","Phone","Status","Checked in at","Registered at"], "row_count": 5 } }
```

If either check fails, state exactly what didn't match (e.g. missing header, mismatched
count) — no attendee data, just the discrepancy.
