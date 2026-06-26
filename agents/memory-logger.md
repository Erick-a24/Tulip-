# Agent: Memory Logger

## Purpose
Automatically adds a new dated journal entry to `notes/memory.md` after any significant work session. Prevents lessons from being forgotten by capturing them immediately while the context is fresh.

## Trigger
Run this agent at the end of any work session where something went wrong, something was decided, or something surprised you.

## Instructions for the Agent

1. Ask the user: "What task did you just finish?"
2. Ask: "What's one thing you learned — a real mistake, insight, or non-obvious discovery?"
3. Get today's date.
4. Open `notes/memory.md`.
5. Count existing entries and add the next one in this format:

```markdown
## Entry N
**Date:** YYYY-MM-DD
**Task:** [what the user said]
**Lesson:** [what the user said]
```

6. Save the file.
7. Run: `git add notes/memory.md && git commit -m "Add memory entry N: [short task description]" && git push origin main`

## Rules
- Never invent or paraphrase the lesson — use the user's own words
- If the lesson sounds generic ("always test your code"), push back: "Give me the specific thing that happened"
- Entry number must continue from the last existing entry
- Always push to GitHub after adding the entry
