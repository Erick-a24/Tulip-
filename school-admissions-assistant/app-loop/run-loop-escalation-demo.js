// run-loop-escalation-demo.js — proves the escalation path fires when every
// attempt keeps failing. Replays the REAL baseline draft every time (it
// genuinely fails the closing check), so the loop should exhaust its
// retries and hand the full trail to a human via tasks.json.
const { runLoop } = require("./loop.js");

const REAL_BASELINE_DRAFT =
  "DRAFT EMAIL - awaiting owner approval.\n\nDear Mr. Temba,\n\nThank you for reaching out with your questions.\n\nRegarding personal devices: students are permitted to bring personal tablets for classroom use, with teacher permission. Phones must remain in students' bags during school hours.\n\nRegarding an after-school coding club: [INSERT INFORMATION ON AFTER-SCHOOL CODING CLUB - NOT YET CONFIRMED].\n\nPlease let us know if you have any further questions - we're happy to help.\n\nWarm regards,\nSilverleaf Academy Admissions Office";

async function alwaysFailsAgentRun(_jobDescription, priorReason) {
  if (priorReason) console.log(`[replay] Retry attempted, reason fed back: "${priorReason}"`);
  console.log("[replay] Returning the same known-bad draft again (deliberately never fixed, to test the cap).");
  return REAL_BASELINE_DRAFT;
}

const job = {
  title: "Draft reply to Mr. Temba (escalation test — never fixed)",
  description:
    "He emailed asking two things: (1) what the school's policy is on students bringing personal tablets/laptops to class, and (2) whether Silverleaf offers an after-school coding club. What we know: students are permitted to bring personal tablets for classroom use with teacher permission; phones must remain in bags during school hours. Nothing further was provided.",
};

runLoop(job, alwaysFailsAgentRun).then((outcome) => {
  console.log("\n=== FINAL OUTCOME ===");
  console.log(JSON.stringify({ escalated: outcome.escalated, tries: outcome.tries }, null, 2));
});
