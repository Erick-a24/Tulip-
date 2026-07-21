const formEl = document.getElementById("login-form");
const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const errorEl = document.getElementById("login-error");

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorEl.hidden = true;
  loginBtn.disabled = true;

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameEl.value,
        password: passwordEl.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed.");
    }

    window.location.href = "/";
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.hidden = false;
    loginBtn.disabled = false;
  }
});
