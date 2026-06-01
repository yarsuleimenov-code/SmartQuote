(function () {
  function addNotice() {
    const header = document.querySelector("main .p-6 section");
    if (!header) return;
    const notice = document.createElement("div");
    notice.className = "mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600";
    notice.textContent = "This screen is read-only until the Pricing Engine variables model is stabilized.";
    header.appendChild(notice);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("main input, main select, main button").forEach((control) => {
      const isNotesToggle = control.getAttribute("onclick")?.includes("toggleBANotes");
      if (isNotesToggle) return;
      control.disabled = true;
      control.classList.add("opacity-70", "cursor-not-allowed");
    });
    addNotice();
  });
})();
