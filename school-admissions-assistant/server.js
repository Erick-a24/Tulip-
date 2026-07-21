require("dotenv").config();

const path = require("path");
const crypto = require("crypto");
const express = require("express");
const session = require("express-session");
const Anthropic = require("@anthropic-ai/sdk");

const PORT = process.env.PORT || 3000;

const REQUIRED_ENV_VARS = ["ANTHROPIC_API_KEY", "APP_USERNAME", "APP_PASSWORD", "SESSION_SECRET"];
const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error(
    `Missing ${missingEnvVars.join(", ")}. Copy .env.example to .env, fill in real values, then restart the server.`
  );
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function safeCompare(a, b) {
  const bufA = Buffer.from(String(a ?? ""));
  const bufB = Buffer.from(String(b ?? ""));
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufB, bufB);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function requirePageAuth(req, res, next) {
  if (req.session?.loggedIn) return next();
  return res.redirect("/login.html");
}

function requireApiAuth(req, res, next) {
  if (req.session?.loggedIn) return next();
  return res.status(401).json({ error: "Please log in first." });
}

const SYSTEM_PROMPT = `You are the School Admissions & Marketing Assistant for Silverleaf Academy. You help three kinds of people: prospective parents, admissions officers, and marketing staff.

You can:
1. Answer questions about school programmes, admissions, application requirements, campus visits, the school website, and general FAQs.
2. Help draft professional marketing content: parent emails, website copy, social media captions, event announcements, and follow-up messages.

How to respond:
- Be clear, friendly, accurate, and professional in every reply.
- When drafting content, present it clearly as a draft for staff to review before it is sent or published — never imply it has already been sent.
- Never invent specific facts you don't actually know — exact fees, dates, deadlines, capacity numbers, or policies. If you don't have real information, say so plainly and either ask the person to provide it or use an obvious placeholder like [INSERT FEE AMOUNT] or [INSERT DATE] so it is clearly marked as needing a real value.
- Keep answers concise and well-organized; use short paragraphs or bullet points where that helps readability.`;

const app = express();

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);
app.use(express.static(path.join(__dirname, "public"), { index: false }));

app.get("/", requirePageAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  const validUsername = safeCompare(username, process.env.APP_USERNAME);
  const validPassword = safeCompare(password, process.env.APP_PASSWORD);

  if (!validUsername || !validPassword) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  req.session.loggedIn = true;
  res.json({ ok: true });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.post("/api/chat", requireApiAuth, async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages must be a non-empty array." });
  }

  const sanitizedMessages = messages
    .filter(
      (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
    )
    .map((m) => ({ role: m.role, content: m.content }));

  if (sanitizedMessages.length === 0) {
    return res.status(400).json({ error: "No valid messages provided." });
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: sanitizedMessages,
    });

    const reply = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    res.json({ reply });
  } catch (error) {
    console.error("Anthropic API error:", error.message);
    res.status(502).json({ error: "The assistant is temporarily unavailable. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`School Admissions & Marketing Assistant running at http://localhost:${PORT}`);
});
