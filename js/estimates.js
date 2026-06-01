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

  function renderCounts(count) {
    byId("estimateCount").textContent = String(count);
    byId("activeEstimateCount").textContent = String(count);
    byId("sentCount").textContent = String(count);
    byId("viewedCount").textContent = "0";
    byId("approvedCount").textContent = "0";
  }

  function renderEmpty() {
    renderCounts(0);
    byId("estimateRows").innerHTML = `
      <tr>
        <td colspan="9" class="px-4 py-12 text-center text-slate-500">
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

  function renderEstimate(snapshot) {
    const quote = snapshot.quote || {};
    const result = snapshot.result || {};
    renderCounts(1);
    byId("estimateRows").innerHTML = `
      <tr>
        <td class="px-4 py-3 font-semibold text-slate-800">${escapeHtml(snapshot.estimateId || quote.estimateId || "EST-LOCAL")}</td>
        <td class="px-4 py-3">
          <div>
            <p class="font-medium text-slate-800">${escapeHtml(quote.customer?.name || quote.customer?.leadName || "-")}</p>
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
        <td class="px-4 py-3"><span class="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Generated</span></td>
        <td class="px-4 py-3">v1</td>
        <td class="px-4 py-3">
          <div class="flex justify-end gap-2">
            <a href="estimate-document.html" class="px-3 py-2 rounded-lg bg-slate-800 text-white text-xs hover:bg-slate-900">View</a>
            <a href="invoices.html" class="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50">Invoice</a>
            <a href="orders.html" class="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50">Order</a>
            <a href="ebol.html" class="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50">eBOL</a>
            <button id="reopenEstimateDraft" class="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50">Reopen Draft</button>
            <button id="deleteEstimateSnapshot" class="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50">Delete</button>
          </div>
        </td>
      </tr>
    `;

    byId("reopenEstimateDraft").addEventListener("click", () => {
      window.CalculatorStorage.save(quote);
      window.location.href = "index.html?loadDraft=1";
    });
    byId("deleteEstimateSnapshot").addEventListener("click", () => {
      window.CalculatorStorage.clearEstimateSnapshot();
      renderEmpty();
      if (window.lucide) lucide.createIcons();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const snapshot = window.CalculatorStorage.loadEstimateSnapshot();
    if (snapshot) {
      renderEstimate(snapshot);
    } else {
      renderEmpty();
    }
    if (window.lucide) lucide.createIcons();
  });
})();
