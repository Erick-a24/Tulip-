# Skill: Adding a New API Endpoint

Use this when a client component needs to trigger a write (or anything requiring a real
HTTP response, like a file download) that doesn't exist yet.

**Before you start:** check whether you actually need a new route. Reads on server-rendered
pages call the service layer directly (see `src/app/(site)/page.tsx` or
`src/app/admin/page.tsx` for examples) — no API route needed. Only add a route for something
a *client* component (`"use client"`) must call over `fetch()`.

## Steps

1. **Add or extend a Zod schema**, if the request has a body, in
   `src/server/validation/schemas.ts`. This is the single source of truth for what shape of
   input is accepted.

2. **Put the business logic in a service**, not in the route file. Add a new function to the
   relevant file in `src/server/services/` (or create a new service file if this is a new
   domain concept). The route handler should never contain rules like capacity checks,
   duplicate handling, or status transitions directly — see `registerAttendee` in
   `src/server/services/registrationService.ts` for the pattern.

3. **Create the route file** at `src/app/api/.../route.ts`, exporting a function named after
   the HTTP verb (`GET`, `POST`, `PATCH`, `DELETE`). Follow this shape (adapted from
   `src/app/api/events/route.ts`):

   ```ts
   import { NextRequest, NextResponse } from "next/server";
   import { ZodError } from "zod";
   import { yourSchema } from "@/server/validation/schemas";
   import { yourServiceFunction } from "@/server/services/yourService";
   import { getCurrentSession } from "@/server/auth/session";
   import { toApiError, UnauthorizedError } from "@/server/errors";

   export async function POST(request: NextRequest) {
     try {
       // Only if this is an admin-only action — see step 4.
       const session = await getCurrentSession();
       if (!session) {
         throw new UnauthorizedError("You must be signed in to do this.");
       }

       const body = await request.json();
       const input = yourSchema.parse(body);
       const result = await yourServiceFunction(input);
       return NextResponse.json(result, { status: 201 });
     } catch (error) {
       if (error instanceof ZodError) {
         return NextResponse.json({ error: error.errors[0]?.message ?? "Invalid input." }, { status: 400 });
       }
       const { status, body } = toApiError(error);
       return NextResponse.json(body, { status });
     }
   }
   ```

4. **Check auth if this is an admin action.** `src/middleware.ts` only guards page routes
   under `/admin/**` — it does **not** protect `/api/**`. Every admin-only API route must
   independently call `getCurrentSession()` and throw `UnauthorizedError` if there's no
   session. Look at `src/app/api/events/route.ts` or the check-in route for the pattern.

5. **Wire it up from the client.** In the relevant `"use client"` component, call the new
   route with `fetch()`, then either `router.refresh()` (to re-fetch server-rendered data on
   the current page) or `router.push()` (to navigate after success). See
   `src/components/registrations/RegistrationForm.tsx` for an example.

6. **Verify before calling it done:**
   - `npm run typecheck` and `npm run build` both pass clean.
   - Manually exercise the route (browser or `curl`/`Invoke-WebRequest`) for the success
     case, a validation-error case, and — if it's admin-only — the unauthenticated case
     (should return `401`).
