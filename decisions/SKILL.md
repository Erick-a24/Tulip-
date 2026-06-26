# SKILL.md — Decisions Directory

This folder records every significant choice made in the Tulip project — what was decided, why, and what was ruled out.

---

## Why This Exists

Decisions made under pressure or ambiguity are forgotten fast. This log ensures that:
- The same debate doesn't happen twice
- New contributors understand why the project is shaped the way it is
- Reversals are made consciously, not by accident

---

## How to Add a Decision

Each entry in `decision.md` follows this format:

```markdown
## Decision N — [Short title of the choice]

**What we decided:**
One or two sentences stating the specific choice made.

**Why:**
The real reason — include any evidence, failures, or constraints that drove it.
Not "it seemed better" — what actually happened that made this the right call?

**What we ruled out:**
Bullet list of alternatives considered and why each was rejected.
```

---

## What Qualifies as a Decision Worth Logging

Log it if:
- You spent more than 5 minutes debating it
- Choosing differently would have meaningfully changed the project
- Someone new to the project would be confused without the context

Don't log it if:
- It was obviously the only option
- It's a trivial style preference with no real trade-off

---

## Gotchas

- "Why" must include evidence or a concrete reason — not just a preference
- "What we ruled out" must name real alternatives, not made-up ones
- Keep entries in chronological order
