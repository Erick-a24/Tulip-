# Planning — Events Attendees Registration Tool

This document describes the application as it was actually designed and built. It exists
alongside `docs/architecture.md` (how the app is put together) as the record of what the
app is for and why it's scoped the way it is. It is separate from `notes/planning.md`,
which is an unrelated document — Silverleaf Academy's 3-month social media content
strategy — not a spec for this app.

---

## Project Goal

Build a TypeScript web application that lets people register for Silverleaf Academy events
online, and lets event organizers track attendance accurately at check-in — replacing
manual sign-up sheets and paper sign-in lists. The tool must protect attendee personal data,
never fabricate attendee information, and stay simple enough for a small events team to run
without dedicated technical staff.

---

## Target Users

| User | Needs |
|---|---|
| **Public attendees** — parents, students, community members, prospective families | Find an upcoming event, register in under a minute, get proof of registration, no account required |
| **Event organizers / admins** — Silverleaf staff running events | Create and edit events, see who's registered, check people in at the door quickly, pull a list afterward |

There is a single admin role in v1 — no distinction between "organizer" and "super admin," and no self-service admin sign-up (accounts are seeded from environment credentials).

---

## Core Features

- Public event listing (upcoming events only) and event detail pages
- Public registration form (name, email, phone) with live capacity ("spots remaining")
- Idempotent registration — registering again with the same email returns the existing
  registration instead of creating a duplicate or erroring
- Capacity enforcement — registration is rejected once an event is full
- Confirmation page with a unique check-in code and a QR code encoding that code
- Admin authentication (email/password, session cookie)
- Admin event management — create, edit, delete events
- Admin check-in screen — per-event attendee list, name/email search, one-click check-in
- Check-in is idempotent — checking in twice doesn't error or double-count
- CSV export of an event's registrations (name, email, phone, status, check-in time, registration time)

---

## User Flows

### 1. Public registration
1. Attendee visits the homepage, sees upcoming events with location, date, and spots remaining.
2. Attendee opens an event, reads details, fills in name/email/phone.
3. If the event is open and not full, a registration is created (or the existing one is
   reused if they already registered with that email).
4. Attendee is redirected to a confirmation page showing their check-in code and QR code.

### 2. Admin event management
1. Admin signs in at `/admin-login`.
2. Admin dashboard lists all events (past and upcoming) with registration counts.
3. Admin creates a new event (title, description, location, start/end time, optional capacity)
   or edits/deletes an existing one.

### 3. Admin check-in (day of event)
1. Admin opens the check-in screen for the event.
2. Admin searches by name or email to find an attendee in the list.
3. Admin clicks "Check in" — status flips to checked-in with a timestamp.
4. Admin can export the full registration list as a CSV at any time (e.g., after the event).

---

## Project Scope

- Single organization (Silverleaf Academy), not multi-tenant.
- Single admin account model — no roles/permissions beyond "signed in" vs. "public."
- SQLite for data storage — sized for one organization's event volume, not concurrent
  multi-instance production load (documented upgrade path to Postgres exists and requires
  no application code changes).
- Web only, mobile-friendly — no native mobile app.
- No payment processing — all events are free to register for.
- No email delivery — the confirmation page is the only receipt an attendee gets.

---

## Features Included in v1

Everything listed under "Core Features" and "User Flows" above is built and live:

- Public: home page, event detail page, registration form, confirmation page with QR code
- Admin: login/logout, dashboard, create/edit/delete event, check-in screen with search,
  CSV export
- Backend: capacity limits, duplicate-registration handling, check-in idempotency, session-based
  admin auth, all enforced server-side (not just in the UI)

---

## Features Intentionally Left for Future Versions

- **Camera-based QR scanning at check-in** — the QR code is generated and shown to attendees,
  but nothing currently scans it back in; check-in today is a manual search-and-click.
- **Registration cancellation** — the data model has a `CANCELLED` status, but no route or UI
  currently sets it; there is no way for an attendee or admin to cancel a registration yet.
- **Email confirmation to attendees** — no email is sent after registering.
- **Password reset / multi-admin accounts** — one admin, credentials set via environment
  variables, no invite flow or account recovery.
- **Waitlists** — a full event simply rejects new registrations rather than offering a waitlist.
- **Rate limiting** — login and public registration endpoints have no brute-force or spam
  protection yet.
- **Postgres migration** — needed before running multiple server instances concurrently;
  SQLite is a deliberate v1 choice, not a long-term one.
- **Server-side attendee search/pagination** — the check-in screen's search filters the
  already-loaded list client-side; fine at typical event sizes, would need a real search
  endpoint for events with very large attendee counts.
- **Recurring or multi-session events** — every event today is a single, standalone occurrence.
