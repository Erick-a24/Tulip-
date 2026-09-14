#!/usr/bin/env node
// PostToolUse hook: fires after any Write tool call. No-ops unless the write
// targeted the orchestrator's "new work" trigger file, in which case it logs
// that a Tulip event-readiness orchestrator run has been requested.
const fs = require("fs");
const path = require("path");

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(input || "{}");
    const filePath = String(payload?.tool_input?.file_path || "").replace(/\\/g, "/");

    if (filePath.endsWith(".claude/orchestrator/pending-event.json")) {
      const logPath = path.join(__dirname, "..", "orchestrator", "trigger-log.md");
      const line = `- ${new Date().toISOString()} — new work detected (${filePath}) — ORCHESTRATOR RUN REQUESTED\n`;
      fs.appendFileSync(logPath, line);
      console.log("[orchestrator-trigger] new work detected — orchestrator run requested");
    }
  } catch (err) {
    // Non-JSON stdin or unrelated tool call — no-op, never block the tool call.
  }
  process.exit(0);
});
