# SKILL.md — Project Context for AI Assistants

Read this file before starting any work in this project. It tells you exactly what this project is, how it's organised, and what matters.

---

## What This Project Is

**Tulip** is a dual-purpose project:

1. **The application being built:** An Events Attendees Registration Tool for Silverleaf Academy — a TypeScript web app that registers customers for events and tracks their attendance accurately.

2. **The learning environment:** This repo is also used as a working project for the Taleemabad University Agentic AI Mastery course. It contains real planning documents, a memory journal, a decision log, a task tracker, and content strategy files.

Both layers are real and active. Don't ignore either one.

---

## Key Technologies & Tools

| Tool | Purpose |
|------|---------|
| TypeScript | All application code (no JavaScript) |
| Git + GitHub | Version control — remote at `github.com/Erick-a24/Tulip-` |
| Markdown | All documentation, notes, and planning files |
| Beads (`.beads`) | Plain-text task tracker — tracks tasks from open to done |
| Claude Code | Primary AI assistant for this project |
| Prisma (planned) | Database ORM for attendee data |

---

## Folder Structure

```
Tulip/
├── src/              → Application code (TypeScript) — not yet built
├── notes/            → Journal, planning docs, learning notes
│   ├── memory.md     → Dated lessons from real work sessions
│   ├── planning.md   → 3-month content strategy for Silverleaf Academy
│   └── agent_loop.md → AI agent loop explanation (Observe/Decide/Act/Feedback/Improve)
├── instructions/     → Reference copy of agent rules
├── decisions/        → Key project decisions (what · why · ruled out)
│   └── decision.md
├── agents/           → Agent definitions for repetitive workflows
├── CLAUDE.md         → Agent instructions — MUST stay at root
├── structure.md      → Project map
└── .beads            → Task tracker
```

---

## Rules — Never Break

- Always protect attendee personal data and ensure privacy
- Never invent or fabricate attendee information
- Use TypeScript for all new application code
- Never commit real attendee data or secrets to git
- Keep all user-facing text professional and friendly

---

## Coding Conventions

- Clean, readable TypeScript with descriptive names
- Small, focused commits — one concern per commit
- Mobile-first UI
- Break complex features into simple steps
- No inline comments unless the WHY is non-obvious

---

## Most Common Tasks

1. **Add a memory entry** — open `notes/memory.md`, append a dated entry with task + lesson
2. **Log a decision** — open `decisions/decision.md`, add what · why · what was ruled out
3. **Update the task tracker** — open `.beads`, change a task's state symbol
4. **Push to GitHub** — `git add`, `git commit`, `git push origin main`
5. **Create a new content doc** — add to `notes/`, update `structure.md` if it's a new folder

---

## Project-Specific Gotchas

- `CLAUDE.md` must stay at the root — Claude Code won't load it from a subfolder
- The GitHub remote URL contains an embedded PAT — use `git remote set-url origin` to update it when the token changes
- Fine-grained GitHub PATs default to read-only; push access requires explicitly setting **Contents → Read and write**
- Git does not auto-stage IDE edits — always `git add` after editing before committing
- `.beads` is a plain text file, not a Dolt database — edit it directly
