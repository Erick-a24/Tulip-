# Barry — Your Personal Assistant

Barry is a simple bot that lives in Claude Code. You add jobs on a web page; Barry picks them up, does the work, and reports back. You never need to run commands or install anything.

---

## Starting Barry

1. Open Claude Code in this folder
2. Barry starts automatically — the web page opens at **http://localhost:8080**
3. If the page doesn't open, tell Claude: _"Start Barry"_

---

## Adding a Job

1. Go to **http://localhost:8080**
2. Type a title and description, pick a priority (High / Medium / Low)
3. Click **Add Job**

Barry checks for new jobs every **2 minutes** and picks the most important one first.

### Examples of jobs you can give Barry

| What you type | What Barry does |
|---------------|-----------------|
| Draft reply to Mrs. Fatuma asking about fees | Drafts a professional email reply, holds for your OK |
| Remind parents who haven't submitted birth certificates | Drafts a gentle follow-up, holds for your OK |
| Research best practices for student enrollment tracking | Searches the web, summarises with links |

---

## Job Statuses

| Status | Meaning |
|--------|---------|
| **Waiting** | In the queue, not started yet |
| **Working on it…** | Barry is doing it right now |
| **Needs your OK** | Barry finished — review and approve or cancel |
| **Done ✓** | Completed and approved |
| **Stuck** | Something went wrong — read the note for the reason |

---

## Approving a Result

When a job says **Needs your OK**, scroll to it on the page:
- Click **Yes, looks good** — marks it Done
- Click **No, cancel** — marks it Stuck so you can review

Barry never sends emails or messages without your click.

---

## What Barry Can Do

- **Draft replies** — professional emails to prospective students and parents
- **Follow-up reminders** — gentle nudges for incomplete enrollment
- **Research** — web searches with real sources summarised
- **File work** — read, write, and organise files in your project

---

## If Something Goes Wrong

- Job stuck for more than 10 minutes → Barry resets it and tries again next round
- Server not responding → tell Claude: _"Restart Barry's server"_
- Wrong result → click No on the job, then add a new one with clearer instructions

---

## Schedules

| Mode | How often |
|------|-----------|
| While you're here (Claude open) | Every 2 minutes |
| Away (session open but you've stepped away) | Every hour, 8am – 7pm |

> **Note:** The schedules only run while Claude Code is open. They stop when you close Claude Code. This is a session-only bot — no background service runs on your computer.

---

## Files

| File | What it is |
|------|-----------|
| `tasks.json` | The job list — everything Barry reads and writes |
| `app/server.ps1` | The small web server |
| `app/index.html` | The web page |
| `CLAUDE.md` | Barry's rulebook — read-only |
| `.claude/skills/` | Recipes for regular jobs |
| `.claude/hooks/` | Automatic safety checks |

---

*Barry — built to be helpful, honest, and safe.*
