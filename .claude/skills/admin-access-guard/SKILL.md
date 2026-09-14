# Skill: Admin Access Guard Checker

## Task

Verify that admin-only actions for event creation, check-in, and CSV export reject
unauthenticated requests.

## Guardrail

May only send requests **without** valid credentials, to confirm they are rejected.
Must never attempt to log in, never guess a password, and never retrieve or use real
admin credentials from `.env` — this skill should never possess a valid session at
all.

## What to check

Send each of the following requests with no session cookie / no auth header, and
confirm each is rejected (expected: `401`):

1. `POST /api/events`
2. `POST /api/registrations/{registrationId}/check-in` (any registration ID — the
   auth check runs before the ID is looked up, so a placeholder ID is fine)
3. `GET /api/events/{eventId}/registrations/export` (any event ID, same reason)

Do not attempt any variation that involves real or guessed credentials, session
tokens, or cookies. If a route unexpectedly does *not* reject the unauthenticated
request, report that as a failure — do not investigate further or attempt to exploit
it.

## Expected evidence/output

Per-route pass/fail:

```json
{ "route": "POST /api/events", "status": "PASS", "response": 401 }
{ "route": "POST /api/registrations/{id}/check-in", "status": "PASS", "response": 401 }
{ "route": "GET /api/events/{id}/registrations/export", "status": "PASS", "response": 401 }
```

`status: "FAIL"` with the actual response code/body for any route that didn't reject
the unauthenticated request.
