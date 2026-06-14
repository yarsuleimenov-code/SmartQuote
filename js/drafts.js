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

  function draftStatus(draft) {
    const hasRoute = Boolean(draft.route?.pickupZip && draft.route?.deliveryZip);
    const hasItems = (draft.items || []).some((item) => item.name);
    if (!hasRoute) return "Missing Route";
    if (!hasItems) return "Missing Items";
    return "Has Items";
  }

  function searchableText(draft, result) {
    return [
      draft.estimateId,
      draft.localId,
      draft.customer?.leadName,
      draft.customer?.name,
      draft.customer?.email,
      draft.customer?.phone,
      draft.route?.pickupZip,
      draft.route?.deliveryZip,
      result?.pickupZone,
      result?.deliveryZone,
    ].join(" ").toLowerCase();
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

  function renderStorageWarning() {
    const health = window.StorageBackup?.storageHealth?.();
    if (!health?.corrupted?.length) return "";
    return `
      <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Some local storage records are corrupted: ${escapeHtml(health.corrupted.join(", "))}. Export a backup before editing drafts.
      </div>
    `;
  }

  function filteredDrafts(drafts) {
    const query = byId("draftSearch")?.value.trim().toLowerCase() || "";
    const status = byId("draftStatusFilter")?.value || "All Drafts";
    const sort = byId("draftSort")?.value || "Last edited";

    const rows = drafts.map((draft) => ({
      draft,
      result: window.PricingCalculator.calculateQuote(draft),
    })).filter((row) => {
      const matchesQuery = !query || searchableText(row.draft, row.result).includes(query);
      const matchesStatus = status === "All Drafts" || draftStatus(row.draft) === status;
      return matchesQuery && matchesStatus;
    });

    return rows.sort((a, b) => {
      if (sort === "Final price") return Number(b.result.totals?.finalPrice || 0) - Number(a.result.totals?.finalPrice || 0);
      if (sort === "Lead name") return String(a.draft.customer?.leadName || a.draft.customer?.name || "").localeCompare(String(b.draft.customer?.leadName || b.draft.customer?.name || ""));
      if (sort === "Item count") return (b.result.items || []).length - (a.result.items || []).length;
      return String(b.draft.updatedAt || "").localeCompare(String(a.draft.updatedAt || ""));
    });
  }

  function renderDraftRows(rows) {
    if (!rows.length) {
      byId("draftRows").innerHTML = `
        <tr>
          <td colspan="10" class="px-4 py-8 text-center text-slate-500">No drafts match the current filters.</td>
        </tr>
      `;
      return;
    }

    byId("draftRows").innerHTML = rows.map(({ draft, result }) => {
      const status = draftStatus(draft);
      const statusClass = status === "Has Items"
        ? "bg-green-100 text-green-700"
        : status === "Missing Route"
          ? "bg-red-100 text-red-700"
          : "bg-amber-100 text-amber-700";
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
        <td class="px-4 py-3"><span class="px-2 py-1 rounded-full ${statusClass} text-xs font-semibold">${escapeHtml(status)}</span></td>
        <td class="px-4 py-3">${dateLabel(draft.updatedAt)}</td>
        <td class="px-4 py-3"><p>Saved locally</p><p class="text-xs text-slate-400">Browser storage</p></td>
        <td class="px-4 py-3">
          <div class="flex justify-end gap-2">
            <a href="index.html?loadDraft=1&draftId=${encodeURIComponent(draft.localId)}" data-open-draft="${escapeHtml(draft.localId)}" class="px-3 py-2 rounded-lg bg-teal-500 text-white text-xs hover:bg-teal-600" title="Continue editing this draft before generating an estimate">Continue Quote</a>
            <a href="breakdown.html?draftId=${encodeURIComponent(draft.localId)}" class="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50" title="Review live draft cost details">Review Cost</a>
            <button data-delete-draft="${escapeHtml(draft.localId)}" class="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50">Delete</button>
          </div>
        </td>
      </tr>
    `;
    }).join("");

    bindRowActions();
  }

  function renderCurrentView() {
    const drafts = window.CalculatorStorage.listDrafts();
    byId("draftCount").textContent = String(drafts.length);
    if (!drafts.length) {
      renderEmpty();
      return;
    }
    renderDraftRows(filteredDrafts(drafts));
    if (window.lucide) lucide.createIcons();
  }

  function renderDrafts(drafts) {
    byId("draftCount").textContent = String(drafts.length);
    renderDraftRows(drafts.map((draft) => ({ draft, result: window.PricingCalculator.calculateQuote(draft) })));
  }

  function bindRowActions() {
    byId("draftRows").querySelectorAll("[data-open-draft]").forEach((link) => {
      link.addEventListener("click", () => {
        window.CalculatorStorage.selectDraft(link.dataset.openDraft);
      });
    });

    byId("draftRows").querySelectorAll("[data-delete-draft]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!window.confirm("Delete this local draft? This cannot be undone unless you have a backup.")) return;
        window.CalculatorStorage.deleteDraft(button.dataset.deleteDraft);
        const updatedDrafts = window.CalculatorStorage.listDrafts();
        if (updatedDrafts.length) {
          renderCurrentView();
        } else {
          renderEmpty();
        }
        if (window.lucide) lucide.createIcons();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const tableSection = byId("draftRows")?.closest("section");
    if (tableSection) tableSection.insertAdjacentHTML("afterbegin", renderStorageWarning());
    ["draftSearch", "draftStatusFilter", "draftSort"].forEach((id) => {
      const control = byId(id);
      if (!control) return;
      control.addEventListener("input", renderCurrentView);
      control.addEventListener("change", renderCurrentView);
    });
    renderCurrentView();
    if (window.lucide) lucide.createIcons();
  });
})();
