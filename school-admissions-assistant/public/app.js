const conversationEl = document.getElementById("conversation");
const loadingEl = document.getElementById("loading");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send-btn");
const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/login.html";
});

const messages = []; // { role: "user" | "assistant", content: string }

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMessage(role, content) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = escapeHtml(content);
  wrapper.appendChild(bubble);
  conversationEl.appendChild(wrapper);
  conversationEl.scrollTop = conversationEl.scrollHeight;
}

function setLoading(isLoading) {
  loadingEl.hidden = !isLoading;
  sendBtn.disabled = isLoading;
  inputEl.disabled = isLoading;
  if (isLoading) {
    conversationEl.scrollTop = conversationEl.scrollHeight;
  }
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;

  messages.push({ role: "user", content: text });
  renderMessage("user", text);
  inputEl.value = "";
  inputEl.style.height = "auto";
  setLoading(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (response.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    messages.push({ role: "assistant", content: data.reply });
    renderMessage("assistant", data.reply);
  } catch (error) {
    renderMessage("error", `Error: ${error.message}`);
  } finally {
    setLoading(false);
    inputEl.focus();
  }
});

inputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    formEl.requestSubmit();
  }
});

inputEl.addEventListener("input", () => {
  inputEl.style.height = "auto";
  inputEl.style.height = `${inputEl.scrollHeight}px`;
});
