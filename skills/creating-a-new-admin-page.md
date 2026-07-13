# Skill: Creating a New Admin Page

Use this when adding a new page under the organizer-facing admin area.

## Steps

1. **Location decides protection.** Every page under `src/app/admin/**` is automatically
   guarded by `src/middleware.ts` — unauthenticated requests get redirected to
   `/admin-login` before the page ever renders. You do not need to add your own auth check
   inside the page component. (If you're adding a new *API route* for this page, that's
   different — API routes are not covered by middleware; see
   `adding-a-new-api-endpoint.md`, step 4.)

2. **Create `src/app/admin/your-page/page.tsx` as an async Server Component.** Fetch its
   data by calling a service function directly — e.g.,
   `await listAllEventsForAdmin()` — not by calling your own API over `fetch()`. See
   `src/app/admin/page.tsx` for the pattern.

3. **Add `export const dynamic = "force-dynamic";`** if the page shows data that changes
   (registration counts, check-in status, anything read from the database). Without it,
   `next build` may prerender the page once and serve that stale snapshot in production —
   this was a real bug caught and fixed during this project's build; every existing admin
   data page has this line for that reason.

4. **Navigation is automatic.** `src/app/admin/layout.tsx` already wraps every admin page
   with `AdminNav` (dashboard link, new-event link, sign-out). You don't need to add
   navigation yourself — just add a link to your new page from wherever makes sense (the
   dashboard, another admin page, etc.).

5. **Keep the page a Server Component; push interactivity into a child.** If the page needs
   forms, buttons, or search input, create a separate `"use client"` component under
   `src/components/` (e.g., `src/components/registrations/RegistrationTable.tsx` for a
   search+action pattern, `src/components/events/EventForm.tsx` for a form pattern) and
   import it into the page, passing server-fetched data down as props.

6. **Reuse the existing UI primitives** in `src/components/ui/` — `Button`, `Input`,
   `Textarea`, `Label`, `Card`, `Badge` — instead of writing new raw HTML/Tailwind. Keeps the
   admin area visually consistent.

7. **If the page needs to write data**, follow `adding-a-new-api-endpoint.md` to add the
   backing route, then call it from your client component with `fetch()` followed by
   `router.refresh()` (to reflect the change on the current page) or `router.push()` (to
   navigate elsewhere after success).

## Checklist

- [ ] Page lives under `src/app/admin/**`
- [ ] `export const dynamic = "force-dynamic"` present if the page reads live data
- [ ] Data fetched via a service function, not a self-`fetch()`
- [ ] Interactive parts pulled into a `"use client"` component
- [ ] `npm run build` shows the route marked `ƒ` (dynamic), not `○` (static), if it should be dynamic
