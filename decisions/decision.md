# decision.md — Project Decision Log

A record of real choices made during this project, why we made them, and what we ruled out.

---

## Decision 1 — Use a fine-grained PAT with Contents: Read and write

**What we decided:**
Generate a new fine-grained Personal Access Token with explicit **Contents → Read and write** permission on the Tulip- repository.

**Why:**
The first token appeared valid — the GitHub API confirmed `"push": true` in the permissions response — but every `git push` returned a 403. After testing write access directly via the GitHub Contents API, the response was `"Resource not accessible by personal access token"`. The token had been created with only read access to contents, which is the default for fine-grained PATs.

**What we ruled out:**
- Keeping the first token and trying different push flags — the token itself was the problem, not the command.
- Using a classic PAT with the `repo` scope — would have worked, but regenerating a fine-grained token with the correct scope was the cleaner fix.

---

## Decision 2 — Keep CLAUDE.md at the project root

**What we decided:**
When we created the `instructions/` folder, we copied CLAUDE.md there for reference but kept the original at the project root.

**Why:**
Claude Code only reads project instructions from `CLAUDE.md` at the root of the working directory. Moving it into a subfolder would silently break the agent's ability to load the project rules — it would not raise an error, it would simply stop reading them.

**What we ruled out:**
- Moving CLAUDE.md fully into `instructions/` — would lose the agent integration.
- Using a symlink from root → instructions/CLAUDE.md — unnecessary complexity for a single file.

---

## Decision 3 — Implement Beads as a plain text `.beads` file

**What we decided:**
Use a simple text file with status symbols (`☐ ▶ ⌛ ☑`) rather than installing the full Beads CLI system.

**Why:**
The full Beads system from the GitHub repo requires installing the `bd` CLI via `curl`, a Dolt SQL database engine, and running `bd init`. On Windows, the curl install script is not directly runnable, and the exercise example itself showed a plain text file format — and `git add .beads` in the final step implies a single file, not a Dolt database directory.

**What we ruled out:**
- Installing the full `bd` CLI — too many dependencies for a Windows setup and beyond what the exercise required.
- Using a `.beads/` directory (Dolt format) — the exercise commit instruction and examples pointed to a single flat file.
