// critic.js — plain-rule critic for the draft-reply job.
// No model call. Every check here is a stated rule against the three named
// failures in .beads/ / the assignment writeup. Returns { ok, reason } —
// never a bare true/false, because the retry needs the reason to act on.

const PLACEHOLDER_RE = /\[INSERT[^\]]*\]/gi;
const MONEY_RE = /(\$|TZS|Ksh|£|€)\s?[\d][\d,]*(\.\d+)?/gi;
const DATE_RE = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(st|nd|rd|th)?\b|\b\d{1,2}(st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\b/gi;
const PHONE_RE = /\+?\d[\d\-\s]{6,}\d/;
// Requires an actual instructional verb + object ("call our office"), not a
// bare noun that could appear harmlessly in a sign-off ("Admissions Office").
const CONCRETE_NEXT_STEP_RE = /\b(call|contact|visit)\s+(us|our|the)\b|reply\s+by\b|respond\s+by\b|email\s+us\s+at\b/i;
const SIGN_OFF_RE = /^(warm regards|sincerely|best regards|kind regards|regards)\b/im;

function stripPlaceholders(text) {
  return text.replace(PLACEHOLDER_RE, "");
}

// Failure 1: a fee/date stated as settled fact that isn't in the job
// description and isn't wrapped in a placeholder.
function checkNoUnconfirmedFactsAsFact(draftText, jobDescription) {
  const stripped = stripPlaceholders(draftText);
  const foundTokens = [
    ...(stripped.match(MONEY_RE) || []),
    ...(stripped.match(DATE_RE) || []),
  ];

  const unconfirmed = foundTokens.filter(
    (token) => !jobDescription.toLowerCase().includes(token.toLowerCase())
  );

  if (unconfirmed.length > 0) {
    return {
      ok: false,
      reason: `States as fact, without a placeholder, the following value(s) not present in the job description: ${unconfirmed.join(
        ", "
      )}. Mark unconfirmed fees/dates/policies with an [INSERT ...] placeholder instead of stating them directly.`,
    };
  }
  return { ok: true, reason: null };
}

// Failure 2: closing has no concrete next step, just generic goodwill.
// The "closing" is whatever comes right before the sign-off line — not
// simply the last N paragraphs, since real result_notes sometimes have
// verifier-score metadata appended after the actual sign-off.
function checkConcreteClosing(draftText) {
  const paragraphs = draftText.trim().split(/\n\s*\n/);
  const signOffIndex = paragraphs.findIndex((p) => SIGN_OFF_RE.test(p));
  const closingWindow =
    signOffIndex > 0
      ? paragraphs.slice(Math.max(0, signOffIndex - 2), signOffIndex).join("\n")
      : paragraphs.slice(-2).join("\n"); // fallback if no sign-off line found

  const hasPhone = PHONE_RE.test(closingWindow);
  const hasConcreteAction = CONCRETE_NEXT_STEP_RE.test(closingWindow);

  if (!hasPhone && !hasConcreteAction) {
    return {
      ok: false,
      reason:
        'Closing has no concrete next step — no phone number, date, office, or explicit "reply by / call us on" action found near the end of the draft. Generic goodwill ("let us know if you have questions") does not satisfy this.',
    };
  }
  return { ok: true, reason: null };
}

// Failure 3: draft could be mistaken for something already reviewed/sent.
function checkMarkedAsDraft(resultNote, status) {
  const hasDraftMarker = /^DRAFT EMAIL/i.test(resultNote.trim());
  const safeStatus = status === "needs_ok" || status === "stuck";

  if (!hasDraftMarker || !safeStatus) {
    return {
      ok: false,
      reason: `Missing draft safety marker or unsafe status (status="${status}", has "DRAFT EMAIL" marker=${hasDraftMarker}). Every drafted reply must start with "DRAFT EMAIL - awaiting owner approval" and the job status must be "needs_ok" (or "stuck"), never "done".`,
    };
  }
  return { ok: true, reason: null };
}

/**
 * critic(job) -> { ok, reason }
 * job: { description: string, result_note: string, status: string }
 */
function critic(job) {
  const checks = [
    checkNoUnconfirmedFactsAsFact(job.result_note, job.description),
    checkConcreteClosing(job.result_note),
    checkMarkedAsDraft(job.result_note, job.status),
  ];

  const failed = checks.find((c) => !c.ok);
  if (failed) return failed;
  return { ok: true, reason: null };
}

module.exports = { critic, checkNoUnconfirmedFactsAsFact, checkConcreteClosing, checkMarkedAsDraft };
