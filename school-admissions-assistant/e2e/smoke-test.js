const { chromium } = require("playwright");

const BASE = process.env.TARGET_URL || "https://school-admissions-assistant.onrender.com";
const failures = [];

function check(name, condition, detail) {
  console.log(`${condition ? "PASS" : "FAIL"} — ${name}${detail ? ` (${detail})` : ""}`);
  if (!condition) failures.push(`${name}: ${detail}`);
}

// Render's free tier spins the app down after inactivity — the first request
// after a period of idle time can transiently 503 while it wakes up. Retrying
// a couple of times keeps that expected cold start from triggering a false
// failure alert, while a genuinely broken deploy still fails for real.
async function withColdStartRetry(fn, attempts = 3, delayMs = 8000) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await fn();
      if (result.ok) return result;
      lastError = result;
    } catch (err) {
      lastError = { ok: false, detail: err.message };
    }
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs));
  }
  return lastError;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  try {
    const loginPageResult = await withColdStartRetry(async () => {
      const res = await page.goto(`${BASE}/login.html`, { waitUntil: "domcontentloaded" });
      const status = res && res.status();
      return { ok: status === 200, detail: `status ${status}` };
    });
    check("Login page loads", loginPageResult.ok, loginPageResult.detail);

    const hasForm = await page.locator("#login-form").count();
    check("Login form present", hasForm > 0, `found ${hasForm}`);

    const rootResult = await withColdStartRetry(async () => {
      const res = await page.request.get(`${BASE}/`, { maxRedirects: 0 });
      return { ok: res.status() === 302, detail: `status ${res.status()}` };
    });
    check("Unauthenticated / redirects to login", rootResult.ok, rootResult.detail);

    // Intentionally fake, throwaway credentials — never the real admin login.
    const loginApiResult = await withColdStartRetry(async () => {
      const res = await page.request.post(`${BASE}/api/login`, {
        data: { username: "monitor@example.com", password: "not-a-real-password" },
        headers: { "Content-Type": "application/json" },
      });
      return { ok: res.status() === 401, detail: `status ${res.status()}` };
    });
    check("Wrong credentials are rejected", loginApiResult.ok, loginApiResult.detail);

    const brochureResult = await withColdStartRetry(async () => {
      const res = await page.request.get(`${BASE}/brochure.pdf`);
      const contentType = res.headers()["content-type"] || "";
      return { ok: res.status() === 200 && contentType.includes("pdf"), detail: `status ${res.status()}, content-type ${contentType}` };
    });
    check("Brochure PDF is servable", brochureResult.ok, brochureResult.detail);
  } catch (err) {
    failures.push(`Unexpected error: ${err.message}`);
    console.log("FAIL — Unexpected error:", err.message);
  } finally {
    await browser.close();
  }

  if (failures.length > 0) {
    console.log("\nSMOKE TEST: FAILED");
    failures.forEach((f) => console.log(" - " + f));
    process.exit(1);
  } else {
    console.log("\nSMOKE TEST: PASSED — all checks green");
    process.exit(0);
  }
})();
