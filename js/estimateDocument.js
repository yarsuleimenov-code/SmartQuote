(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const element = byId(id);
    if (element && value !== undefined && value !== null) {
      element.textContent = value;
    }
  }

  function currency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  function dateLabel(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  function valueOrDash(value) {
    return value === undefined || value === null || value === "" ? "-" : value;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function dimensionsLabel(item) {
    const length = Number(item.length || 0);
    const width = Number(item.width || 0);
    const height = Number(item.height || 0);
    if (!length || !width || !height) return "-";
    return `${length} x ${width} x ${height} in`;
  }

  function weightLabel(item) {
    const weight = Number(item.totalWeight || 0) || Number(item.weight || 0) * Number(item.qty || 1);
    return weight ? `${weight.toFixed(0)} lb` : "-";
  }

  function itemNotes(item) {
    const notes = [];
    if (item.fragile) notes.push("Fragile");
    if (item.nonStackable) notes.push("Non-stackable");
    if (item.crated) notes.push("Crated");
    if (item.warning && item.warning !== "OK") notes.push(item.warning);
    if (item.comment) notes.push(item.comment);
    return notes.join(" / ") || "Standard handling";
  }

  function renderItems(items) {
    const tbody = byId("shipmentItems");
    if (!tbody) return;

    const visibleItems = (items || []).filter((item) => item.name);
    if (!visibleItems.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="muted" style="text-align: center;">No shipment items loaded.</td></tr>`;
      return;
    }

    tbody.innerHTML = visibleItems.map((item) => `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>${escapeHtml(item.qty || 1)}</td>
        <td>${escapeHtml(dimensionsLabel(item))}</td>
        <td>${escapeHtml(weightLabel(item))}</td>
        <td>${escapeHtml(item.packaging || "None")}</td>
        <td class="muted">${escapeHtml(itemNotes(item))}</td>
      </tr>
    `).join("");
  }

  function applySnapshot(snapshot) {
    const quote = snapshot.quote || {};
    const result = snapshot.result || {};
    const totals = result.totals || {};
    const customer = quote.customer || {};
    const route = quote.route || {};
    const options = quote.options || {};
    const finalPrice = currency(totals.finalPrice);
    const hasFullCoverage = Number(totals.insurance) > 0;

    document.title = `Zaberman LLC Delivery Estimate | ${snapshot.estimateId || quote.estimateId || "EST-NEW"}`;
    setText("estimateId", snapshot.estimateId || quote.estimateId || "EST-NEW");
    setText("createdDate", dateLabel(snapshot.createdAt) || "-");
    setText("validUntil", dateLabel(snapshot.validUntil) || "-");
    setText("estimateTotalMeta", finalPrice);
    setText("customerName", valueOrDash(customer.name));
    setText("customerPhone", valueOrDash(customer.phone));
    setText("customerEmail", valueOrDash(customer.email));
    setText("pickupAddress", valueOrDash(route.pickupAddress || route.pickupZip));
    setText("deliveryAddress", valueOrDash(route.deliveryAddress || route.deliveryZip));
    setText("serviceType", options.deliveryType || "Consolidated Interstate Route");
    setText("transportationTotal", finalPrice);
    setText("fullCoverageStatus", hasFullCoverage ? "Included" : "Not Included");
    setText("protectionSelection", hasFullCoverage ? "Full Coverage Selected" : "Released Value Protection Selected");
    setText("estimateTotal", finalPrice);
    renderItems(result.items || quote.items || []);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const snapshot = window.CalculatorStorage?.selectEstimateSnapshot(params.get("estimateId"))
      || window.CalculatorStorage?.loadEstimateSnapshot();
    if (snapshot) {
      applySnapshot(snapshot);
    } else {
      renderItems([]);
    }
  });
})();
