const listEl = document.getElementById("history-list");
const emptyEl = document.getElementById("history-empty");
const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/login.html";
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString();
}

function renderEntry(entry) {
  const item = document.createElement("div");
  item.className = "history-item";
  item.innerHTML = `
    <div class="history-timestamp">${escapeHtml(formatTimestamp(entry.created_at))}</div>
    <div class="history-question"><strong>Q:</strong> ${escapeHtml(entry.question)}</div>
    <div class="history-answer"><strong>A:</strong> ${escapeHtml(entry.answer)}</div>
  `;
  listEl.appendChild(item);
}

async function loadHistory() {
  const response = await fetch("/api/history");

  if (response.status === 401) {
    window.location.href = "/login.html";
    return;
  }

  const data = await response.json();

  if (!data.conversations || data.conversations.length === 0) {
    emptyEl.hidden = false;
    return;
  }

  data.conversations.forEach(renderEntry);
}

loadHistory();
