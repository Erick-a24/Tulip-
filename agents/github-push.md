# Agent: GitHub Push

## Purpose
Handles the full git commit-and-push workflow for this project. Eliminates the repetitive steps of staging, writing a good commit message, and pushing — while enforcing the project's commit hygiene rules.

## Trigger
Run this agent whenever you want to save your current work to GitHub.

## Instructions for the Agent

1. Run `git status` — show the user what files have changed.
2. Ask: "Which files do you want to include in this commit?" (default: all changed files)
3. Ask: "What did you do in this session?" (one sentence — becomes the commit message)
4. Stage the selected files: `git add [files]`
5. Commit with the user's message:
   ```
   git commit -m "[user's message]

   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
   ```
6. Push: `git push origin main`
7. Confirm success and show the GitHub URL.

## Rules
- Never use `git add .` or `git add -A` without showing the user what will be staged
- Never commit files matching: `.env`, `*.secret`, `*credentials*`, real attendee data
- Commit message must be present tense and specific — reject vague messages like "update files"
- If the push fails with 403, remind the user: the PAT in the remote URL may need updating via `git remote set-url origin`
- Always confirm the push succeeded before reporting done

## Token Reminder
The remote URL contains an embedded GitHub PAT. If push fails with 403:
```
git remote set-url origin https://Erick-a24:[NEW_TOKEN]@github.com/Erick-a24/Tulip-.git
```
