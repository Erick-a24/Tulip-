const { critic } = require("./critic.js");
const runs = require("./before-runs-raw.json");

const jobDescription =
  "He emailed asking two things: (1) what the school's policy is on students bringing personal tablets/laptops to class, and (2) whether Silverleaf offers an after-school coding club. What we know: students are permitted to bring personal tablets for classroom use with teacher permission; phones must remain in bags during school hours. Nothing further was provided.";

let passCount = 0;
for (const r of runs.sort((a, b) => a.run - b.run)) {
  const result = critic({ description: jobDescription, result_note: r.text, status: "needs_ok" });
  if (result.ok) passCount++;
  console.log(`Run ${r.run}: ${result.ok ? "PASS" : "FAIL — " + result.reason}`);
}
console.log(`\n${passCount}/${runs.length} would have passed the critic with no check in place.`);
console.log(`${runs.length - passCount}/${runs.length} bad drafts would have silently reached the human queue undetected.`);
