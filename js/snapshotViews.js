(function () {
  function currency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function snapshot() {
    const params = new URLSearchParams(window.location.search);
    return window.CalculatorStorage?.selectEstimateSnapshot?.(params.get("estimateId"))
      || window.CalculatorStorage?.loadEstimateSnapshot?.()
      || null;
  }

  function quote(snapshotValue) {
    return snapshotValue?.quote || {};
  }

  function result(snapshotValue) {
    return snapshotValue?.result || {};
  }

  function totals(snapshotValue) {
    return result(snapshotValue).totals || {};
  }

  function customerName(snapshotValue) {
    const customer = quote(snapshotValue).customer || {};
    return customer.name || customer.leadName || "-";
  }

  function routeLabel(snapshotValue) {
    const computed = result(snapshotValue);
    return `${computed.pickupZone || "-"} -> ${computed.deliveryZone || "-"}`;
  }

  function itemRows(snapshotValue) {
    const items = result(snapshotValue).items || quote(snapshotValue).items || [];
    return items.filter((item) => item.name);
  }

  function itemFlags(item) {
    const flags = [];
    if (item.fragile) flags.push("Fragile");
    if (item.nonStackable) flags.push("N-stack");
    if (item.crated) flags.push("Crate");
    return flags.join(", ") || "Standard";
  }

  function renderEmpty(tbody, colspan, title, text) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${colspan}" class="px-4 py-12 text-center text-slate-500">
          <p class="font-semibold text-slate-700">${escapeHtml(title)}</p>
          <p class="text-sm text-slate-400 mt-1">${escapeHtml(text)}</p>
        </td>
      </tr>
    `;
  }

  function renderInvoices() {
    const tbody = document.querySelector("tbody");
    if (!tbody) return;
    const current = snapshot();
    if (!current) {
      renderEmpty(tbody, 7, "No active estimate snapshot", "Generate an estimate before creating an invoice.");
      return;
    }
    tbody.innerHTML = `
      <tr>
        <td class="px-4 py-3 font-semibold text-slate-800">INV-${escapeHtml(current.estimateId || "LOCAL")}</td>
        <td class="px-4 py-3">${escapeHtml(current.estimateId || quote(current).estimateId || "EST-LOCAL")}</td>
        <td class="px-4 py-3">${escapeHtml(customerName(current))}</td>
        <td class="px-4 py-3 font-semibold text-slate-800">${currency(totals(current).finalPrice)}</td>
        <td class="px-4 py-3"><span class="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">Draft</span></td>
        <td class="px-4 py-3">Manual</td>
        <td class="px-4 py-3">
          <a href="orders.html" class="text-teal-700 font-semibold hover:underline">Create Order</a>
        </td>
      </tr>
    `;
  }

  function renderOrders() {
    const tbody = document.querySelector("tbody");
    if (!tbody) return;
    const current = snapshot();
    if (!current) {
      renderEmpty(tbody, 8, "No active order snapshot", "Generate an estimate before creating an order.");
      return;
    }
    const items = itemRows(current);
    tbody.innerHTML = `
      <tr>
        <td class="px-4 py-3 font-semibold text-slate-800">ORD-${escapeHtml(current.estimateId || "LOCAL")}</td>
        <td class="px-4 py-3">${escapeHtml(customerName(current))}</td>
        <td class="px-4 py-3">${escapeHtml(routeLabel(current))}</td>
        <td class="px-4 py-3">${items.length} ${items.length === 1 ? "item" : "items"}</td>
        <td class="px-4 py-3"><span class="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">Pending pickup</span></td>
        <td class="px-4 py-3">INV-${escapeHtml(current.estimateId || "LOCAL")}</td>
        <td class="px-4 py-3">Not started</td>
        <td class="px-4 py-3 text-right">
          <a href="ebol.html" class="px-3 py-2 rounded-lg bg-slate-800 text-white text-xs hover:bg-slate-900">Open eBOL</a>
        </td>
      </tr>
    `;
    const counters = document.querySelectorAll(".grid.grid-cols-4 .text-2xl");
    if (counters[0]) counters[0].textContent = "1";
  }

  function renderEbol() {
    const current = snapshot();
    if (!current) return;
    const currentQuote = quote(current);
    const currentResult = result(current);
    const currentTotals = totals(current);
    const items = itemRows(current);

    const summary = Array.from(document.querySelectorAll(".text-right.text-sm.text-slate-500"))
      .find((element) => element.textContent.includes("Estimate:") && element.textContent.includes("Quote Total"));
    if (summary) {
      summary.innerHTML = `
        <p>Estimate: <b class="text-slate-700">${escapeHtml(current.estimateId || currentQuote.estimateId || "EST-LOCAL")}</b></p>
        <p>Quote Total: <b class="text-slate-700">${currency(currentTotals.finalPrice)}</b></p>
        <p>Lifecycle: <b class="text-slate-700">Order -> Pickup -> Delivery -> POD</b></p>
      `;
    }

    const cards = document.querySelectorAll(".grid.grid-cols-12.gap-6.mb-6 > div");
    if (cards[0]) {
      cards[0].querySelector(".space-y-3").innerHTML = `
        <div class="flex justify-between"><span class="text-slate-500">Customer</span><b>${escapeHtml(customerName(current))}</b></div>
        <div class="flex justify-between"><span class="text-slate-500">Order ID</span><b>ORD-${escapeHtml(current.estimateId || "LOCAL")}</b></div>
        <div class="flex justify-between"><span class="text-slate-500">Estimate ID</span><b>${escapeHtml(current.estimateId || currentQuote.estimateId || "EST-LOCAL")}</b></div>
        <div class="flex justify-between"><span class="text-slate-500">Route</span><b>${escapeHtml(routeLabel(current))}</b></div>
        <div class="flex justify-between"><span class="text-slate-500">Items</span><b>${items.length}</b></div>
        <div class="flex justify-between"><span class="text-slate-500">Status</span><b class="text-slate-700">Not started</b></div>
      `;
    }

    if (cards[1]) {
      cards[1].querySelector(".space-y-3").innerHTML = `
        <div><p class="font-semibold text-slate-800">${escapeHtml(currentQuote.route?.pickupAddress || "Pickup address pending")}</p><p class="text-slate-500">${escapeHtml(currentQuote.route?.pickupZip || "-")}</p></div>
        <div class="border-t border-slate-200 pt-3"><p class="text-xs text-slate-400">Pickup Contact</p><p class="font-semibold text-slate-800">${escapeHtml(customerName(current))}</p><p class="text-slate-500">${escapeHtml(currentQuote.customer?.phone || "-")}</p></div>
        <div class="border-t border-slate-200 pt-3"><p class="text-xs text-slate-400">Access Notes</p><p class="text-slate-600">${escapeHtml(currentQuote.access?.pickup?.addressType || "House")}</p></div>
      `;
    }

    if (cards[2]) {
      cards[2].querySelector(".space-y-3").innerHTML = `
        <div><p class="font-semibold text-slate-800">${escapeHtml(currentQuote.route?.deliveryAddress || "Delivery address pending")}</p><p class="text-slate-500">${escapeHtml(currentQuote.route?.deliveryZip || "-")}</p></div>
        <div class="border-t border-slate-200 pt-3"><p class="text-xs text-slate-400">Delivery Contact</p><p class="font-semibold text-slate-800">${escapeHtml(customerName(current))}</p><p class="text-slate-500">${escapeHtml(currentQuote.customer?.phone || "-")}</p></div>
        <div class="border-t border-slate-200 pt-3"><p class="text-xs text-slate-400">Access Notes</p><p class="text-slate-600">${escapeHtml(currentQuote.access?.delivery?.addressType || "House")}</p></div>
      `;
    }

    const progress = document.querySelectorAll(".grid.grid-cols-6 .text-xl");
    ["0 / " + items.length, "0 / " + items.length, "0 / " + items.length, "0 / " + items.length, "0", "0 / 2"].forEach((value, index) => {
      if (progress[index]) progress[index].textContent = value;
    });

    const tbody = Array.from(document.querySelectorAll("table tbody"))
      .find((element) => element.closest("table")?.textContent.includes("Pickup Condition"));
    if (tbody) {
      tbody.innerHTML = items.length
        ? items.map((item) => `
          <tr>
            <td class="px-4 py-3 font-semibold text-slate-800">${escapeHtml(item.name)}</td>
            <td class="px-4 py-3">${escapeHtml(itemFlags(item))}</td>
            <td class="px-4 py-3">Pending</td>
            <td class="px-4 py-3"><input type="checkbox" class="accent-teal-500" /></td>
            <td class="px-4 py-3">Pending</td>
            <td class="px-4 py-3"><input type="checkbox" class="accent-teal-500" /></td>
            <td class="px-4 py-3 text-slate-400">Required</td>
            <td class="px-4 py-3 text-slate-400">Required</td>
            <td class="px-4 py-3">None</td>
            <td class="px-4 py-3">${escapeHtml(item.comment || item.warning || "")}</td>
          </tr>
        `).join("")
        : `<tr><td colspan="10" class="px-4 py-12 text-center text-slate-500">No order items loaded.</td></tr>`;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.snapshotView;
    if (page === "invoices") renderInvoices();
    if (page === "orders") renderOrders();
    if (page === "ebol") renderEbol();
    if (window.lucide) lucide.createIcons();
  });
})();
