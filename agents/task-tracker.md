# Agent: Task Tracker

## Purpose
Manages the `.beads` task tracker — opens new tasks, moves them through their states, and closes them when done. Keeps the tracker accurate so it reflects real work, not wishful thinking.

## Trigger
Run this agent when:
- Starting a new piece of work (open a task)
- Something is blocked waiting on someone else (mark waiting)
- Work is actively underway (mark in progress)
- A task is finished (close it)

## Task States

| Symbol | State | When to use |
|--------|-------|-------------|
| `☐` | To do | Task identified but not started |
| `▶` | In progress | Actively being worked on right now |
| `⌛` | Waiting | Blocked — waiting on a person, response, or dependency |
| `☑` | Done | Completed and verified |

## Instructions for the Agent

**To open a new task:**
1. Ask: "What's the task?" (one clear sentence)
2. Open `.beads`
3. Add a new line: `☐ [task description]`
4. Save and commit: `git add .beads && git commit -m "Open task: [description]" && git push origin main`

**To update a task's state:**
1. Ask: "Which task and what state?"
2. Open `.beads`, find the task, change its symbol
3. Save and commit: `git add .beads && git commit -m "Update task: [description] → [new state]" && git push origin main`

**To review open tasks:**
1. Open `.beads`
2. List all tasks that are `☐` or `▶` or `⌛`
3. Ask: "Are any of these now done or blocked?"

## Rules
- A task must exist in `.beads` before work starts — don't track it retroactively only
- Only one task should be `▶` (in progress) at a time unless genuinely parallel
- Always push after any state change
- Never delete a task — change it to `☑` done instead
