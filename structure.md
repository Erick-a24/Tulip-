# structure.md — Project Map

Where everything lives in this project.

```
Tulip/
├── notes/          → journal, planning docs, and learning notes (+ SKILL.md)
├── instructions/   → agent rules and project config (CLAUDE.md copy for reference)
├── decisions/      → decision log — what we chose, why, and what we ruled out (+ SKILL.md)
├── agents/         → agent definitions for repetitive workflows
├── CLAUDE.md       → agent instructions (must stay at root for Claude Code to load it)
├── SKILL.md        → project context file for AI assistants
├── structure.md    → this file — the project map
└── .beads          → task tracker — full life of each task from open to done
```

## Folder Guide

| Folder / File | What goes here |
|---------------|----------------|
| `notes/` | Working notes, journal entries, strategy docs, and anything you learn as you go |
| `instructions/` | Rules, guidelines, and configuration for the agent |
| `decisions/` | Key decisions — what was decided, why, and what was ruled out |
| `agents/` | Agent definitions — instructions for autonomous repetitive workflows |
| `SKILL.md` | Root-level context file — read this first when joining the project |
| `CLAUDE.md` | Stays at root — Claude Code only reads it from here |
| `.beads` | Task tracker — one line per task, with its current state |
