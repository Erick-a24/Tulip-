# memory.md — Project Journal

A running record of real lessons from our work sessions on this project.

---

## Entry 1
**Date:** 2026-06-24
**Task:** Initialize git and push the project folder to GitHub for the first time.
**Lesson:** The folder had no git repository at all — `git init` was needed before anything else could happen. Always check whether a project folder is already a git repo before trying to push.

---

## Entry 2
**Date:** 2026-06-24
**Task:** Connect the local repo to GitHub using a Personal Access Token (PAT).
**Lesson:** Fine-grained PATs created on GitHub default to **read-only** on repository contents. The token appeared valid (the API confirmed admin-level permissions) but push kept failing with 403. The fix was to regenerate the token and explicitly set **Contents → Read and write** under Repository permissions.

---

## Entry 3
**Date:** 2026-06-24
**Task:** Push files after getting the new working token.
**Lesson:** Even after updating the remote URL with the new token, git was still using the old stored credentials because the `origin` remote still pointed to the first (invalid) token. We had to run `git remote set-url origin` to fix it — otherwise every future `git push` would silently fail.

---

## Entry 4
**Date:** 2026-06-24
**Task:** Create `agent_loop.md` explaining the Observe → Decide → Act → Feedback → Improve cycle using the Ayesha example.
**Lesson:** The agent loop only becomes meaningful when tied to a real consequence — in Ayesha's case, the email not being opened. A loop diagram alone teaches nothing; what makes it land is showing how the agent changes its next action based on what actually happened.

---

## Entry 5
**Date:** 2026-06-24
**Task:** Fix `CLAUDE.md` which appeared empty on GitHub even though it had content locally.
**Lesson:** The file was edited in the IDE *after* the empty version had already been committed and pushed. Git does not auto-detect unsaved or post-commit edits — you have to stage and commit again. The repo on GitHub only knows what was in the file at the time of the last commit.

---
