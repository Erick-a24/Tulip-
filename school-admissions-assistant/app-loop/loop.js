// loop.js — act -> check -> retry (reason fed back) -> cap -> escalate to human.
// Self-healing: the model never changes; the system around it retries with
// the specific reason it failed for. Nothing here trains anything.
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");
const { critic } = require("./critic.js");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MAX_RETRIES = 3; // matches the assignment's pseudocode: initial attempt + up to 3 retries

const DRAFT_SYSTEM_PROMPT = `You are drafting an email reply for Silverleaf Academy's admissions office. Rules:
- Open with the recipient's name if known.
- Address every question in the job directly.
- Include only facts given in the job description — never invent a fee, date, or policy. Mark anything unconfirmed with an [INSERT ...] placeholder.
- Close with a CONCRETE next step phrased as an instruction — e.g. "please call our office" or "reply by [date]" — never generic goodwill like "let us know if you have questions".
- The result must start with exactly: "DRAFT EMAIL - awaiting owner approval."
- Sign off with "Warm regards," and the admissions office name.
Output ONLY the draft text, nothing else — no preamble, no markdown fences.`;

async function agentRun(jobDescription, priorReason) {
  const userPrompt = priorReason
    ? `Job: ${jobDescription}\n\nYour previous attempt failed this check: "${priorReason}"\nFix exactly that problem in your redraft — keep everything else that was already correct.`
    : `Job: ${jobDescription}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: DRAFT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  return response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

function escalateToHuman(job, trail) {
  const TASKS_FILE = path.join(__dirname, "..", "tasks.json");
  const raw = fs.readFileSync(TASKS_FILE, "utf8").replace(/^﻿/, ""); // strip UTF-8 BOM if present
  const data = JSON.parse(raw);
  const now = new Date().toISOString();
  const stuckJob = {
    id: `job_${now.replace(/[-:.TZ]/g, "")}_escalated`,
    title: `ESCALATED: ${job.title}`,
    description: job.description,
    priority: "High",
    status: "stuck",
    result_note: `Escalated after ${trail.length} attempt(s), none passed the critic.\n\nFull trail:\n${trail
      .map((t, i) => `Attempt ${i + 1}: ${t.check.ok ? "PASS" : "FAIL — " + t.check.reason}\n---draft---\n${t.result}`)
      .join("\n\n")}`,
    created_at: now,
    updated_at: now,
  };
  data.jobs.push(stuckJob);
  data.log.push({
    time: now,
    job_id: stuckJob.id,
    job_title: stuckJob.title,
    action: `Escalated to human after ${trail.length} failed attempt(s)`,
    outcome: "stuck",
  });
  fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), "utf8");
  console.log(`ESCALATED to tasks.json as ${stuckJob.id} — a person must review the full trail.`);
}

/**
 * runLoop(job, agentRunFn?) -> { escalated, tries, trail, finalResult }
 * job: { title: string, description: string }
 * agentRunFn: optional override for the "act" step (defaults to the real
 * Anthropic API call) — used for replaying real historical outputs when
 * live API access is unavailable. Retry/cap/escalate logic is identical
 * either way; only the source of the draft text changes.
 */
async function runLoop(job, agentRunFn = agentRun) {
  const trail = [];
  let reason = null;
  let tries = 0;

  let resultText = await agentRunFn(job.description, reason);
  let check = critic({ description: job.description, result_note: resultText, status: "needs_ok" });
  trail.push({ attempt: tries + 1, result: resultText, check });
  console.log(`Attempt 1: ${check.ok ? "PASS" : "FAIL — " + check.reason}`);

  while (!check.ok && tries < MAX_RETRIES) {
    reason = check.reason;
    resultText = await agentRunFn(job.description, reason);
    check = critic({ description: job.description, result_note: resultText, status: "needs_ok" });
    tries++;
    trail.push({ attempt: tries + 1, result: resultText, check });
    console.log(`Attempt ${tries + 1} (retry, reason fed back): ${check.ok ? "PASS" : "FAIL — " + check.reason}`);
  }

  if (!check.ok) {
    escalateToHuman(job, trail);
    return { escalated: true, tries, trail, finalResult: null };
  }

  console.log(`Resolved after ${tries} retr${tries === 1 ? "y" : "ies"}.`);
  return { escalated: false, tries, trail, finalResult: resultText };
}

module.exports = { runLoop, agentRun, escalateToHuman };
