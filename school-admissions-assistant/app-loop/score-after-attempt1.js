const { critic } = require("./critic.js");
const runs = require("./after-runs-attempt1.json");

const jobDescription =
  "He emailed asking two things: (1) what the school's policy is on students bringing personal tablets/laptops to class, and (2) whether Silverleaf offers an after-school coding club. What we know: students are permitted to bring personal tablets for classroom use with teacher permission; phones must remain in bags during school hours. Nothing further was provided.";

for (const r of runs.sort((a, b) => a.run - b.run)) {
  const result = critic({ description: jobDescription, result_note: r.text, status: "needs_ok" });
  console.log(`Run ${r.run}: ${result.ok ? "PASS" : "FAIL"}${result.ok ? "" : " — " + result.reason}`);
}
