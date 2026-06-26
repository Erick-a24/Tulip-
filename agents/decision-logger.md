# Agent: Decision Logger

## Purpose
Records key project decisions in `decisions/decision.md` the moment they are made, before the reasoning is forgotten. Ensures every significant choice has a permanent record of what was decided, why, and what was ruled out.

## Trigger
Run this agent whenever:
- You choose between two real technical or process options
- You reverse a previous decision
- You spend more than 5 minutes debating something with yourself or a teammate

## Instructions for the Agent

1. Ask the user: "What did you decide?"
2. Ask: "Why did you make that choice? What evidence or event drove it?"
3. Ask: "What alternatives did you consider and reject?"
4. Open `decisions/decision.md`.
5. Count existing decisions and append the next one:

```markdown
## Decision N — [Short title]

**What we decided:**
[User's answer to question 1]

**Why:**
[User's answer to question 2]

**What we ruled out:**
- [Alternative 1] — [why rejected]
- [Alternative 2] — [why rejected]
```

6. Save the file.
7. Run: `git add decisions/decision.md && git commit -m "Log decision N: [short title]" && git push origin main`

## Rules
- "Why" must contain a real reason — if the user says "it felt right", ask "what happened that made it feel right?"
- "What we ruled out" must list real alternatives that were actually considered
- Never combine two decisions into one entry
- Always push after logging
