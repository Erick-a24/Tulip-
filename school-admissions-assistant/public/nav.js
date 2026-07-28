const navButtons = document.querySelectorAll(".nav-btn");

function closeAllDropdowns() {
  navButtons.forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
    btn.classList.remove("open");
    document.getElementById(`dropdown-${btn.dataset.dropdown}`).classList.remove("open");
  });
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    const panel = document.getElementById(`dropdown-${btn.dataset.dropdown}`);
    const isOpen = panel.classList.contains("open");
    closeAllDropdowns();
    if (!isOpen) {
      panel.classList.add("open");
      btn.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    }
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("#main-nav")) closeAllDropdowns();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeAllDropdowns();
});
