// run-loop-replay-demo.js — demonstrates loop.js's retry/cap/escalate logic
// using REAL historical Sonnet 5 outputs (from the Harness Assessment, Part
// C), replayed in sequence, instead of a fresh live API call. Used because
// the project's Anthropic API key currently has insufficient credit balance
// (a real, external blocker — see the session record). The critic, the
// retry-with-reason-fed-back mechanic, the cap, and the escalation path are
// all the real loop.js code; only the "act" step is swapped for a replay.
const { runLoop } = require("./loop.js");

const REAL_BASELINE_DRAFT =
  "DRAFT EMAIL - awaiting owner approval.\n\nDear Mr. Temba,\n\nThank you for reaching out with your questions.\n\nRegarding personal devices: students are permitted to bring personal tablets for classroom use, with teacher permission. Phones must remain in students' bags during school hours.\n\nRegarding an after-school coding club: [INSERT INFORMATION ON AFTER-SCHOOL CODING CLUB - NOT YET CONFIRMED].\n\nPlease let us know if you have any further questions - we're happy to help.\n\nWarm regards,\nSilverleaf Academy Admissions Office";

const REAL_AFTER_FIX_DRAFT =
  "DRAFT EMAIL - awaiting owner approval.\n\nDear Mr. Temba,\n\nThank you for reaching out with your questions.\n\nOn personal devices: students are permitted to bring personal tablets for classroom use with teacher permission. Phones must remain in students' bags during school hours.\n\nOn the after-school coding club: [INSERT CODING CLUB PROGRAM DETAILS / CONFIRMATION OF AVAILABILITY] - we want to make sure we give you accurate information, so we will confirm this and follow up with you directly.\n\nIf you have any further questions in the meantime, please feel free to call the admissions office on [INSERT PHONE NUMBER].\n\nWarm regards,\nAdmissions Office\nSilverleaf Academy";

let callCount = 0;
async function replayAgentRun(jobDescription, priorReason) {
  callCount++;
  if (callCount === 1) {
    console.log("[replay] Returning the REAL baseline draft (Harness Assessment, Part C) — known to fail the closing check.");
    return REAL_BASELINE_DRAFT;
  }
  console.log(`[replay] Retry #${callCount - 1}, reason fed back: "${priorReason}"`);
  console.log("[replay] Returning the REAL after-fix draft (same session) — known to pass.");
  return REAL_AFTER_FIX_DRAFT;
}

const job = {
  title: "Draft reply to Mr. Temba (replay)",
  description:
    "He emailed asking two things: (1) what the school's policy is on students bringing personal tablets/laptops to class, and (2) whether Silverleaf offers an after-school coding club. What we know: students are permitted to bring personal tablets for classroom use with teacher permission; phones must remain in bags during school hours. Nothing further was provided.",
};

runLoop(job, replayAgentRun).then((outcome) => {
  console.log("\n=== FINAL OUTCOME ===");
  console.log(JSON.stringify({ escalated: outcome.escalated, tries: outcome.tries }, null, 2));
});
