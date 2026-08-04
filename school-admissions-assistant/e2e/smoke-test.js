const BASE = process.env.TARGET_URL || "https://school-admissions-assistant.onrender.com";
const failures = [];

function check(name, condition, detail) {
  console.log(`${condition ? "PASS" : "FAIL"} - ${name}${detail ? ` (${detail})` : ""}`);
  if (!condition) failures.push(`${name}: ${detail}`);
}

// Render's free tier spins the app down after inactivity — the first request
// after a period of idle time can transiently 503 while it wakes up. Retrying
// a couple of times keeps that expected cold start from triggering a false
// failure alert, while a genuinely broken deploy still fails for real.
async function withColdStartRetry(fn, attempts = 3, delayMs = 8000) {
  let lastResult;
  for (let i = 0; i < attempts; i++) {
    try {
      lastResult = await fn();
      if (lastResult.ok) return lastResult;
    } catch (err) {
      lastResult = { ok: false, detail: err.message };
    }
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs));
  }
  return lastResult;
}

(async () => {
  const loginPageResult = await withColdStartRetry(async () => {
    const res = await fetch(`${BASE}/login.html`);
    const body = await res.text();
    return { ok: res.status === 200, detail: `status ${res.status}`, body };
  });
  check("Login page loads", loginPageResult.ok, loginPageResult.detail);
  const hasLoginForm = !!loginPageResult.body && loginPageResult.body.includes('id="login-form"');
  check(
    "Login form present",
    hasLoginForm,
    hasLoginForm ? "found in HTML" : loginPageResult.body ? "not found in returned HTML" : "no HTML body captured"
  );

  const rootResult = await withColdStartRetry(async () => {
    const res = await fetch(`${BASE}/`, { redirect: "manual" });
    return { ok: res.status === 302, detail: `status ${res.status}` };
  });
  check("Unauthenticated / redirects to login", rootResult.ok, rootResult.detail);

  // Intentionally fake, throwaway credentials — never the real admin login.
  const loginApiResult = await withColdStartRetry(async () => {
    const res = await fetch(`${BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "monitor@example.com", password: "not-a-real-password" }),
    });
    return { ok: res.status === 401, detail: `status ${res.status}` };
  });
  check("Wrong credentials are rejected", loginApiResult.ok, loginApiResult.detail);

  const brochureResult = await withColdStartRetry(async () => {
    const res = await fetch(`${BASE}/brochure.pdf`);
    const contentType = res.headers.get("content-type") || "";
    return { ok: res.status === 200 && contentType.includes("pdf"), detail: `status ${res.status}, content-type ${contentType}` };
  });
  check("Brochure PDF is servable", brochureResult.ok, brochureResult.detail);

  if (failures.length > 0) {
    console.log("\nSMOKE TEST: FAILED");
    failures.forEach((f) => console.log(" - " + f));
    process.exit(1);
  } else {
    console.log("\nSMOKE TEST: PASSED - all checks green");
    process.exit(0);
  }
})();
