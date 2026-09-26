const { critic } = require("./critic.js");
const attempt1 = require("./after-runs-attempt1.json");
const retries = require("./after-runs-retry.json");

const jobDescription =
  "He emailed asking two things: (1) what the school's policy is on students bringing personal tablets/laptops to class, and (2) whether Silverleaf offers an after-school coding club. What we know: students are permitted to bring personal tablets for classroom use with teacher permission; phones must remain in bags during school hours. Nothing further was provided.";

const retryByRun = Object.fromEntries(retries.map((r) => [r.run, r]));

let totalTries = 0;
let escalations = 0;
const perRun = [];

for (const r of attempt1.sort((a, b) => a.run - b.run)) {
  const first = critic({ description: jobDescription, result_note: r.text, status: "needs_ok" });
  if (first.ok) {
    perRun.push({ run: r.run, tries: 0, outcome: "PASS (attempt 1)" });
    continue;
  }
  totalTries += 1;
  const retry = retryByRun[r.run];
  const second = critic({ description: jobDescription, result_note: retry.text, status: "needs_ok" });
  if (second.ok) {
    perRun.push({ run: r.run, tries: 1, outcome: "PASS (after 1 retry)" });
  } else {
    escalations += 1;
    perRun.push({ run: r.run, tries: 1, outcome: "ESCALATED (still failing after retry)" });
  }
}

perRun.forEach((p) => console.log(`Run ${p.run}: ${p.tries} retr${p.tries === 1 ? "y" : "ies"} — ${p.outcome}`));
console.log(`\nTotal retries across 10 runs: ${totalTries}`);
console.log(`Escalations: ${escalations}`);
