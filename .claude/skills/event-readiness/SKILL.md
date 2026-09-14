# Skill: Event Readiness Validator

## Task

Given proposed event fields (title, description, location, start/end times, capacity),
check their **content/readiness** before event creation — not just schema validity.
Flag placeholder or vague values, inconsistent dates/times, empty-ish descriptions, and
obviously unusable values.

## Guardrail

**Read-only.** This skill must never create or modify an Event record, and must never
call `POST /api/events` itself. It only inspects and scores the fields it's given and
returns a verdict — the orchestrator decides what happens next.

## What to check

For the proposed `title`, `description`, `location`, `startsAt`, `endsAt`, `capacity`:

- **Placeholder/vague values:** literal placeholders such as "TBD", "N/A", "TODO", or
  a location/title that's just a single generic word with no real specificity.
- **Empty-ish description:** present but too short to be usable (a handful of
  characters, or repeated punctuation/whitespace) even though it passes the schema's
  non-empty check.
- **Inconsistent dates/times:** `endsAt` not after `startsAt` (the API also enforces
  this, but confirm it), or `startsAt` already in the past for an event being prepared.
- **Obviously unusable values:** capacity that's zero, negative, or otherwise nonsensical
  given the described event.

Do not evaluate anything outside these five fields, and do not apply general business
rules beyond content/readiness (e.g. no pricing, marketing, or scheduling-strategy
judgment calls) — that's out of scope for this skill.

## Expected evidence/output

A per-field verdict, e.g.:

```json
{ "field": "location", "status": "FAIL", "reason": "literal placeholder 'TBD'" }
{ "field": "startsAt", "status": "PASS", "reason": "in the future, before endsAt" }
```

Plus one overall verdict: `READY` (all fields pass) or `NOT READY` (one or more fail,
listed with reasons). Return this to the orchestrator — do not act on it yourself.
