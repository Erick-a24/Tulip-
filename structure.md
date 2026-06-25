# structure.md — Project Map

Where everything lives in this project.

```
Tulip/
├── notes/          → journal, planning docs, and learning notes (memory.md, planning.md, agent_loop.md)
├── instructions/   → agent rules and project config (CLAUDE.md copy for reference)
├── decisions/      → decision log — what we chose, why, and what we ruled out (decision.md)
├── CLAUDE.md       → agent instructions (must stay at root for Claude Code to load it)
├── structure.md    → this file — the project map
└── .beads          → task tracker — full life of each task from open to done
```

## Folder Guide

| Folder / File | What goes here |
|---------------|----------------|
| `notes/` | Working notes, journal entries, strategy docs, and anything you learn as you go |
| `instructions/` | Rules, guidelines, and configuration for the agent |
| `decisions/` | Key decisions — what was decided, why, and what was ruled out |
| `CLAUDE.md` | Stays at root — Claude Code only reads it from here |
| `.beads` | Task tracker — one line per task, with its current state |
