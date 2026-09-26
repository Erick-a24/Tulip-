const { critic } = require("./critic.js");

// Real baseline draft from the Harness Assessment (Part C), known to fail the closing check
const baselineJob = {
  description:
    "He emailed asking two things: (1) what the school's policy is on students bringing personal tablets/laptops to class, and (2) whether Silverleaf offers an after-school coding club. What we know: students are permitted to bring personal tablets for classroom use with teacher permission; phones must remain in bags during school hours. Nothing further was provided.",
  result_note:
    "DRAFT EMAIL - awaiting owner approval.\n\nDear Mr. Temba,\n\nThank you for reaching out with your questions.\n\nRegarding personal devices: students are permitted to bring personal tablets for classroom use, with teacher permission. Phones must remain in students' bags during school hours.\n\nRegarding an after-school coding club: [INSERT INFORMATION ON AFTER-SCHOOL CODING CLUB - NOT YET CONFIRMED].\n\nPlease let us know if you have any further questions - we're happy to help.\n\nWarm regards,\nSilverleaf Academy Admissions Office",
  status: "needs_ok",
};

// Real after-fix draft from the same test, known to pass
const afterFixJob = {
  description: baselineJob.description,
  result_note:
    "DRAFT EMAIL - awaiting owner approval.\n\nDear Mr. Temba,\n\nThank you for reaching out with your questions.\n\nOn personal devices: students are permitted to bring personal tablets for classroom use with teacher permission. Phones must remain in students' bags during school hours.\n\nOn the after-school coding club: [INSERT CODING CLUB PROGRAM DETAILS / CONFIRMATION OF AVAILABILITY] - we want to make sure we give you accurate information, so we will confirm this and follow up with you directly.\n\nIf you have any further questions in the meantime, please feel free to call the admissions office on [INSERT PHONE NUMBER].\n\nWarm regards,\nAdmissions Office\nSilverleaf Academy",
  status: "needs_ok",
};

// Real entries from the actual tasks.json (Mr. Kessy, Mrs. Achieng)
const realKessy = {
  description:
    "Mr. Kessy emailed asking about the Grade 5 admission process and whether there's an entrance assessment. He also asked about the application deadline for the January intake. We don't have the exact deadline date confirmed yet for this intake.",
  result_note:
    "DRAFT EMAIL - awaiting owner approval.\n\nSubject: Grade 5 Admission Enquiry\n\nDear Mr. Kessy,\n\nThank you for reaching out about Grade 5 admission at Silverleaf Academy.\n\nYes, Grade 5 applicants complete a short entrance assessment as part of the admission process, alongside the standard application form and required documents.\n\nRegarding the January intake application deadline: I do not have that exact date confirmed yet - [INSERT DEADLINE DATE] - please confirm with the admissions office before this goes out.\n\nOnce we have that date confirmed, I would be happy to share the full admission timeline so you can plan accordingly.\n\nPlease feel free to call our admissions office if you have any further questions in the meantime.\n\nWarm regards,\nSilverleaf Academy Admissions\n\n---\nVerifier scores: Completeness=5 Accuracy=5 Usability=4 (avg 4.7 - Pass)",
  status: "needs_ok",
};

console.log("=== Baseline draft (expected: FAIL on closing) ===");
console.log(critic(baselineJob));
console.log();
console.log("=== After-fix draft (expected: PASS) ===");
console.log(critic(afterFixJob));
console.log();
console.log("=== Real Mr. Kessy job from tasks.json (expected: PASS) ===");
console.log(critic(realKessy));
