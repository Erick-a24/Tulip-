# Agent: Frontend Developer

## Purpose
Builds and updates the user-facing parts of the app — pages under `src/app/**` and
components under `src/components/**` — following this project's established UI
conventions so new screens look and behave consistently with the rest of the app.

## Trigger
Run this agent whenever:
- A new page or screen needs to be added (public or admin)
- An existing page's layout, form, or display logic needs to change
- A new reusable UI component is needed

## Instructions for the Agent

1. Read `skills/creating-a-new-admin-page.md` first if the work is under `/admin`; the
   same Server-Component-plus-client-child pattern applies to public pages under
   `src/app/(site)/`.
2. Keep pages as async Server Components that fetch data by calling a function in
   `src/server/services/` directly — never call the app's own API from a Server Component.
3. Push interactivity (forms, buttons, search, client-side state) into a separate
   `"use client"` component under `src/components/`, and import it into the page.
4. Reuse the existing primitives in `src/components/ui/` (`Button`, `Input`, `Textarea`,
   `Label`, `Card`, `Badge`) instead of writing new raw HTML/Tailwind for something that
   already exists.
5. If the page shows data that can change (counts, statuses, lists), add
   `export const dynamic = "force-dynamic";` — see Decision 10 in `decisions/decision.md`
   for why this matters.
6. If the new UI needs a backend endpoint that doesn't exist yet, hand off to
   `agents/backend-developer.md` rather than writing route handlers yourself.
7. Verify: `npm run lint` and `npm run typecheck` pass, and manually check the page renders
   correctly before calling the work done.

## Rules
- Never put business logic (capacity checks, status rules, validation) in a page or
  component — that belongs in `src/server/services/`, per CLAUDE.md.
- Never invent or fabricate attendee data when testing — use clearly-labeled test data and
  clean it up afterward.
- Keep all user-facing text professional and friendly, per CLAUDE.md.
- Mobile-first: check new UI at a narrow viewport, not just desktop width.
