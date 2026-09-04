# Guardrail — Tulip

**Task:** Autonomously export and distribute the attendee CSV to organizers.

**Autonomy dial:** 2/10

**Rule:**
Under generating or previewing an attendee-registrations CSV inside Tulip with no attendee PII leaving the system, go ahead; over any action that sends, uploads, shares, or otherwise transmits the CSV or its contents outside Tulip, ask me first, every time.

**Single worst irreversible risk:**
Attendee PII (name, email, phone) is autonomously sent to an unintended recipient or for the wrong event, with no audit trail to catch it, and cannot reliably be recalled.

**Permanent stop-and-ask boundary:**
Any action that causes the CSV or its contents to leave Tulip — sending it, uploading it, handing it to a third-party API, or anything else that crosses the system boundary — remains stop-and-ask unconditionally, regardless of prior success.
