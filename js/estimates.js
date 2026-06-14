(function () {
  const statuses = ["Generated", "Sent", "Viewed", "Negotiation", "Approved", "Rejected", "Expired", "Converted to Invoice"];
  let allSnapshots = [];

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
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
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

  function displayStatus(snapshot) {
    const raw = snapshot.status || "Generated";
    if (raw === "quick-generated" || raw === "generated" || raw === "breakdown-generated") return "Generated";
    return statuses.includes(raw) ? raw : "Generated";
  }

  function statusClass(status) {
    const classes = {
      Generated: "bg-blue-100 text-blue-700 border-blue-200",
      Sent: "bg-slate-100 text-slate-700 border-slate-200",
      Viewed: "bg-indigo-100 text-indigo-700 border-indigo-200",
      Negotiation: "bg-amber-100 text-amber-800 border-amber-200",
      Approved: "bg-green-100 text-green-700 border-green-200",
      Rejected: "bg-red-100 text-red-700 border-red-200",
      Expired: "bg-red-100 text-red-700 border-red-200",
      "Converted to Invoice": "bg-teal-100 text-teal-700 border-teal-200",
    };
    return classes[status] || classes.Generated;
  }

  function statusOptions(selected) {
    return statuses.map((status) => `<option${status === selected ? " selected" : ""}>${status}</option>`).join("");
  }

  function renderCounts(snapshots) {
    const statusCounts = snapshots.reduce((acc, snapshot) => {
      const status = displayStatus(snapshot);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const inactive = (statusCounts.Expired || 0) + (statusCounts.Rejected || 0) + (statusCounts["Converted to Invoice"] || 0);
    const active = snapshots.length - inactive;

    byId("estimateCount").textContent = String(snapshots.length);
    byId("activeEstimateCount").textContent = String(active);
    byId("sentCount").textContent = String(snapshots.length);
    byId("viewedCount").textContent = String(statusCounts.Viewed || 0);
    byId("approvedCount").textContent = String(statusCounts.Approved || 0);
    byId("expiredRejectedCount").textContent = String(inactive);
  }

  function renderEmpty() {
    renderCounts([]);
    byId("estimateRows").innerHTML = `
      <tr>
        <td colspan="10" class="px-4 py-12 text-center text-slate-500">
          <div class="flex flex-col items-center gap-3">
            <i data-lucide="file-badge" class="w-8 h-8 text-slate-300"></i>
            <div>
              <p class="font-semibold text-slate-700">No generated estimates yet</p>
              <p class="text-sm text-slate-400 mt-1">Generate an estimate from a completed quote to see it here.</p>
            </div>
            <a href="index.html" class="px-4 py-2 rounded-lg bg-teal-500 text-white text-sm hover:bg-teal-600">Create New Estimate</a>
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
        Some local storage records are corrupted: ${escapeHtml(health.corrupted.join(", "))}. Export a backup before updating estimate statuses.
      </div>
    `;
  }

  function searchableText(snapshot) {
    const quote = snapshot.quote || {};
    const result = snapshot.result || {};
    return [
      snapshot.estimateId,
      quote.estimateId,
      quote.customer?.leadName,
      quote.customer?.name,
      quote.customer?.phone,
      quote.customer?.email,
      result.pickupZone,
      result.deliveryZone,
      quote.route?.pickupZip,
      quote.route?.deliveryZip,
    ].join(" ").toLowerCase();
  }

  function filteredSnapshots() {
    const query = byId("estimateSearch").value.trim().toLowerCase();
    const status = byId("estimateStatusFilter").value;
    const sort = byId("estimateSort").value;

    const filtered = allSnapshots.filter((snapshot) => {
      const matchesQuery = !query || searchableText(snapshot).includes(query);
      const matchesStatus = status === "All Estimates" || displayStatus(snapshot) === status;
      return matchesQuery && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (sort === "Expiration date") return String(b.validUntil || "").localeCompare(String(a.validUntil || ""));
      if (sort === "Final price") return Number(b.result?.totals?.finalPrice || 0) - Number(a.result?.totals?.finalPrice || 0);
      if (sort === "Status") return displayStatus(a).localeCompare(displayStatus(b));
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });
  }

  function renderEstimates(snapshots) {
    renderCounts(allSnapshots);
    if (!snapshots.length) {
      byId("estimateRows").innerHTML = `
        <tr>
          <td colspan="10" class="px-4 py-8 text-center text-slate-500">No estimates match the current filters.</td>
        </tr>
      `;
      return;
    }

    byId("estimateRows").innerHTML = snapshots.map((snapshot) => {
      const quote = snapshot.quote || {};
      const result = snapshot.result || {};
      const snapshotId = snapshot.snapshotId || "";
      const currentStatus = displayStatus(snapshot);
      const canFollowUp = !["Rejected", "Expired", "Converted to Invoice"].includes(currentStatus);
      return `
      <tr>
        <td class="px-4 py-3 font-semibold text-slate-800">${escapeHtml(snapshot.estimateId || quote.estimateId || "EST-LOCAL")}</td>
        <td class="px-4 py-3">
          <p class="font-semibold text-slate-800">${escapeHtml(quote.customer?.leadName || "-")}</p>
          <p class="text-xs text-slate-400">CRM lead name</p>
        </td>
        <td class="px-4 py-3">
          <div>
            <p class="font-medium text-slate-800">${escapeHtml(quote.customer?.name || "-")}</p>
            <p class="text-xs text-slate-400">${escapeHtml(quote.customer?.email || quote.customer?.phone || "-")}</p>
          </div>
        </td>
        <td class="px-4 py-3">
          <div>
            <p class="text-slate-800">${escapeHtml(result.pickupZone || "-")} -> ${escapeHtml(result.deliveryZone || "-")}</p>
            <p class="text-xs text-slate-400">${escapeHtml(quote.route?.pickupZip || "-")} -> ${escapeHtml(quote.route?.deliveryZip || "-")}</p>
          </div>
        </td>
        <td class="px-4 py-3 font-semibold text-slate-800">${currency(result.totals?.finalPrice)}</td>
        <td class="px-4 py-3">${dateLabel(snapshot.createdAt)}</td>
        <td class="px-4 py-3">${dateLabel(snapshot.validUntil)}</td>
        <td class="px-4 py-3">
          <select data-status-estimate="${escapeHtml(snapshotId)}" class="rounded-lg border px-2 py-1 text-xs font-semibold ${statusClass(currentStatus)}">
            ${statusOptions(currentStatus)}
          </select>
        </td>
        <td class="px-4 py-3">${escapeHtml(snapshot.formulaVersion || "v1")}</td>
        <td class="px-4 py-3">
          <div class="flex flex-col items-end gap-2">
            <div class="flex justify-end gap-2">
              <button data-quick-status="${escapeHtml(snapshotId)}" data-next-status="Sent" class="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50"${canFollowUp ? "" : " disabled"}>Mark Sent</button>
              <button data-quick-status="${escapeHtml(snapshotId)}" data-next-status="Approved" class="px-3 py-2 rounded-lg border border-green-200 text-green-700 text-xs hover:bg-green-50"${canFollowUp ? "" : " disabled"}>Approve</button>
              <button data-quick-status="${escapeHtml(snapshotId)}" data-next-status="Rejected" class="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50"${currentStatus === "Converted to Invoice" ? " disabled" : ""}>Reject</button>
            </div>
            <div class="flex justify-end gap-2">
              <a href="estimate-document.html?estimateId=${encodeURIComponent(snapshotId)}" data-select-estimate="${escapeHtml(snapshotId)}" class="px-3 py-2 rounded-lg bg-slate-800 text-white text-xs hover:bg-slate-900" title="Open frozen customer estimate snapshot">Preview HTML/PDF</a>
              <a href="breakdown.html?estimateId=${encodeURIComponent(snapshotId)}" data-select-estimate="${escapeHtml(snapshotId)}" class="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50" title="Open internal cost breakdown for this snapshot">Breakdown</a>
              <button data-reopen-estimate="${escapeHtml(snapshotId)}" class="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50">Reopen Draft</button>
              <button data-delete-estimate="${escapeHtml(snapshotId)}" class="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50">Delete</button>
            </div>
          </div>
        </td>
      </tr>
    `;
    }).join("");

    bindRowActions();
  }

  function renderCurrentView() {
    if (!allSnapshots.length) {
      renderEmpty();
      return;
    }
    renderEstimates(filteredSnapshots());
    if (window.lucide) lucide.createIcons();
  }

  function bindRowActions() {
    byId("estimateRows").querySelectorAll("[data-select-estimate]").forEach((link) => {
      link.addEventListener("click", () => {
        window.CalculatorStorage.selectEstimateSnapshot(link.dataset.selectEstimate);
      });
    });

    byId("estimateRows").querySelectorAll("[data-status-estimate]").forEach((select) => {
      select.addEventListener("change", () => {
        updateEstimateStatus(select.dataset.statusEstimate, select.value);
      });
    });

    byId("estimateRows").querySelectorAll("[data-quick-status]").forEach((button) => {
      button.addEventListener("click", () => {
        updateEstimateStatus(button.dataset.quickStatus, button.dataset.nextStatus);
      });
    });

    byId("estimateRows").querySelectorAll("[data-reopen-estimate]").forEach((button) => {
      button.addEventListener("click", () => {
        const snapshot = window.CalculatorStorage.selectEstimateSnapshot(button.dataset.reopenEstimate);
        if (!snapshot?.quote) return;
        window.CalculatorStorage.save({ ...snapshot.quote, localId: undefined });
        window.location.href = "index.html?loadDraft=1";
      });
    });

    byId("estimateRows").querySelectorAll("[data-delete-estimate]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!window.confirm("Delete this local estimate snapshot? This cannot be undone unless you have a backup.")) return;
        window.CalculatorStorage.deleteEstimateSnapshot(button.dataset.deleteEstimate);
        allSnapshots = window.CalculatorStorage.listEstimateSnapshots();
        renderCurrentView();
      });
    });
  }

  function updateEstimateStatus(snapshotId, status, rerender = true) {
    const updated = window.CalculatorStorage.updateEstimateSnapshot(snapshotId, {
      status,
      statusUpdatedAt: new Date().toISOString(),
    });
    if (!updated) return;
    allSnapshots = window.CalculatorStorage.listEstimateSnapshots();
    if (rerender) renderCurrentView();
  }

  function bindFilters() {
    ["estimateSearch", "estimateStatusFilter", "estimateSort"].forEach((id) => {
      byId(id).addEventListener("input", renderCurrentView);
      byId(id).addEventListener("change", renderCurrentView);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindFilters();
    const tableSection = byId("estimateRows")?.closest("section");
    if (tableSection) tableSection.insertAdjacentHTML("afterbegin", renderStorageWarning());
    allSnapshots = window.CalculatorStorage.listEstimateSnapshots();
    renderCurrentView();
    if (window.lucide) lucide.createIcons();
  });
})();
