(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function currency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  function dateLabel(value) {
    if (!value) return "Local";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Local";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function itemSummary(result) {
    const items = result.items || [];
    const itemText = `${items.length} ${items.length === 1 ? "line" : "lines"}`;
    const weight = `${Number(result.totals?.totalWeight || 0).toFixed(0)} lb`;
    const volume = `${Math.ceil(Number(result.totals?.effectiveVolume || 0))} cu ft`;
    return { itemText, details: `${weight} - ${volume}` };
  }

  function renderEmpty() {
    byId("draftCount").textContent = "0";
    byId("draftRows").innerHTML = `
      <tr>
        <td colspan="10" class="px-4 py-12 text-center text-slate-500">
          <div class="flex flex-col items-center gap-3">
            <i data-lucide="file-plus" class="w-8 h-8 text-slate-300"></i>
            <div>
              <p class="font-semibold text-slate-700">No saved drafts yet</p>
              <p class="text-sm text-slate-400 mt-1">Create a new quote or save a draft from the calculator.</p>
            </div>
            <a href="index.html" class="px-4 py-2 rounded-lg bg-teal-500 text-white text-sm hover:bg-teal-600">Create New Draft</a>
          </div>
        </td>
      </tr>
    `;
  }

  function renderDrafts(drafts) {
    byId("draftCount").textContent = String(drafts.length);
    byId("draftRows").innerHTML = drafts.map((draft) => {
      const result = window.PricingCalculator.calculateQuote(draft);
      const summary = itemSummary(result);
      return `
      <tr>
        <td class="px-4 py-3 font-semibold text-slate-800">${escapeHtml(draft.estimateId || "DRAFT-LOCAL")}</td>
        <td class="px-4 py-3">
          <p class="font-semibold text-slate-800">${escapeHtml(draft.customer?.leadName || "-")}</p>
          <p class="text-xs text-slate-400">CRM lead name</p>
        </td>
        <td class="px-4 py-3">
          <div>
            <p class="font-medium text-slate-800">${escapeHtml(draft.customer?.name || "-")}</p>
            <p class="text-xs text-slate-400">${escapeHtml(draft.customer?.email || draft.customer?.phone || "-")}</p>
          </div>
        </td>
        <td class="px-4 py-3">
          <div>
            <p class="text-slate-800">${escapeHtml(result.pickupZone || "-")} -> ${escapeHtml(result.deliveryZone || "-")}</p>
            <p class="text-xs text-slate-400">${escapeHtml(draft.route?.pickupZip || "-")} -> ${escapeHtml(draft.route?.deliveryZip || "-")}</p>
          </div>
        </td>
        <td class="px-4 py-3">
          <div>
            <p class="font-medium">${summary.itemText}</p>
            <p class="text-xs text-slate-400">${summary.details}</p>
          </div>
        </td>
        <td class="px-4 py-3 font-semibold text-slate-800">${currency(result.totals?.finalPrice)}</td>
        <td class="px-4 py-3"><span class="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">Local Draft</span></td>
        <td class="px-4 py-3">${dateLabel(draft.updatedAt)}</td>
        <td class="px-4 py-3"><p>Saved locally</p><p class="text-xs text-slate-400">Browser storage</p></td>
        <td class="px-4 py-3">
          <div class="flex justify-end gap-2">
            <a href="index.html?loadDraft=1&draftId=${encodeURIComponent(draft.localId)}" data-open-draft="${escapeHtml(draft.localId)}" class="px-3 py-2 rounded-lg bg-teal-500 text-white text-xs hover:bg-teal-600">Open</a>
            <a href="breakdown.html?draftId=${encodeURIComponent(draft.localId)}" class="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50">Breakdown</a>
            <button data-delete-draft="${escapeHtml(draft.localId)}" class="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50">Delete</button>
          </div>
        </td>
      </tr>
    `;
    }).join("");

    byId("draftRows").querySelectorAll("[data-open-draft]").forEach((link) => {
      link.addEventListener("click", () => {
        window.CalculatorStorage.selectDraft(link.dataset.openDraft);
      });
    });

    byId("draftRows").querySelectorAll("[data-delete-draft]").forEach((button) => {
      button.addEventListener("click", () => {
        window.CalculatorStorage.deleteDraft(button.dataset.deleteDraft);
        const updatedDrafts = window.CalculatorStorage.listDrafts();
        if (updatedDrafts.length) {
          renderDrafts(updatedDrafts);
        } else {
          renderEmpty();
        }
        if (window.lucide) lucide.createIcons();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const drafts = window.CalculatorStorage.listDrafts();
    if (drafts.length) {
      renderDrafts(drafts);
    } else {
      renderEmpty();
    }
    if (window.lucide) lucide.createIcons();
  });
})();
