const { runLoop } = require("./loop.js");

const job = {
  title: "Draft reply to Mrs. Nzalayaisenga",
  description:
    "Mrs. Nzalayaisenga emailed asking whether Silverleaf sells school uniforms on campus, and whether there's a discount for buying multiple uniforms at once. We know uniforms are sold at the campus store. We don't have confirmed pricing or a discount policy for this yet.",
};

runLoop(job)
  .then((outcome) => {
    console.log("\n=== FINAL OUTCOME ===");
    console.log(JSON.stringify({ escalated: outcome.escalated, tries: outcome.tries }, null, 2));
    if (outcome.finalResult) {
      console.log("\n--- Final passing draft ---\n" + outcome.finalResult);
    }
  })
  .catch((err) => {
    console.error("Loop errored:", err.message);
    process.exit(1);
  });
