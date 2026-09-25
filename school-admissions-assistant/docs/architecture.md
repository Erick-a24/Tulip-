---
type: L2
last_verified: 2026-09-25
owner: it@silverleaf.co.tz
---

# Architecture — the live chat app (L2)

Verified directly against `server.js` on 2026-09-25. **`README.md`'s "Known
limitations" section and `db/schema.sql` are both stale/aspirational — see
"Known discrepancies" below before trusting either.**

## What actually runs today

- **Stack:** Node.js + Express, single file (`server.js`), no framework.
- **Auth:** session-based login. `POST /api/login` checks `APP_USERNAME` /
  `APP_PASSWORD` (from `.env`) with a timing-safe comparison, then sets
  `req.session.loggedIn = true`. `requirePageAuth` guards `/` and `/history`;
  `requireApiAuth` guards `/api/history` and `/api/chat`. This is real —
  the app is **not** unauthenticated.
- **Storage:** a local SQLite database (`data.sqlite`, via `node:sqlite`), one
  table: `conversations (id, question, answer, created_at)`. Every `/api/chat`
  call inserts a row after the reply comes back. Conversation history **does**
  persist across page refreshes — it is not browser-memory-only.
- **Chat flow:** `public/app.js` posts the full message array to
  `POST /api/chat` → `server.js` sanitizes it, attaches the fixed system
  prompt (see `guardrail.md` for the drafting rule it encodes), calls
  `anthropic.messages.create` with `model: "claude-sonnet-5"`, saves the
  Q&A pair, returns `{ reply }`.
- **Key boundary:** `ANTHROPIC_API_KEY` is read only server-side; the browser
  never sees it.

## Known discrepancies (do not propagate these)

- `README.md` claims "no authentication" and "conversation history lives only
  in the browser tab's memory, no persistence layer." **Both are false** as of
  this verification — see above. `README.md` was not updated when auth/history
  were added.
- `db/schema.sql` describes a Postgres ERD (`parent`, `admin`, `program`,
  `service`, `fee`, `brochure`, `inquiry`, `response`) that **is not wired into
  `server.js`** — the live app only ever touches the single `conversations`
  table in `data.sqlite`. Treat `schema.sql` as planned/future design, not
  current behavior, until something in `server.js` actually reads from it.

## Related
- The drafting rule the system prompt encodes → `guardrail.md`.
- How response quality is judged → `quality-rubric.md`.
