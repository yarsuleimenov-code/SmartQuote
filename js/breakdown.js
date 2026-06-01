(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const element = byId(id);
    if (element) element.textContent = value;
  }

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

  function buildSnapshot(quote, result) {
    const createdAt = new Date();
    const validUntil = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
    return {
      snapshotVersion: 1,
      createdAt: createdAt.toISOString(),
      validUntil: validUntil.toISOString(),
      estimateId: quote.estimateId || "EST-NEW",
      status: "breakdown-generated",
      quote,
      result,
    };
  }

  function getSource() {
    const snapshot = window.CalculatorStorage.loadEstimateSnapshot();
    if (snapshot?.quote && snapshot?.result) {
      return {
        source: "Snapshot",
        quote: snapshot.quote,
        result: snapshot.result,
        estimateId: snapshot.estimateId || snapshot.quote.estimateId,
      };
    }

    const draft = window.CalculatorStorage.load() || window.CalculatorBlankQuote;
    return {
      source: "Draft",
      quote: draft,
      result: window.PricingCalculator.calculateQuote(draft),
      estimateId: draft.estimateId,
    };
  }

  function renderItems(items) {
    const tbody = byId("bdItems");
    tbody.innerHTML = items.length
      ? items.map((item) => `
          <tr>
            <td class="px-4 py-3 font-medium text-slate-800">${escapeHtml(item.name)}</td>
            <td class="px-4 py-3 text-right">${item.qty || 1}</td>
            <td class="px-4 py-3 text-right">${Number(item.volume || 0).toFixed(1)} cu ft</td>
            <td class="px-4 py-3 text-right">${Number(item.effectiveVolume || 0).toFixed(1)} cu ft</td>
            <td class="px-4 py-3 text-right">${Number(item.totalWeight || 0).toFixed(0)} lb</td>
            <td class="px-4 py-3 ${item.warning && item.warning !== "OK" ? "text-amber-700" : "text-green-700"}">${escapeHtml(item.warning || "OK")}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="6" class="px-4 py-6 text-center text-slate-400">No billable items in this quote.</td></tr>`;
  }

  function renderWarnings(warnings) {
    byId("bdWarnings").innerHTML = warnings.length
      ? warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")
      : "<li>No item warnings</li>";
  }

  function renderBreakdown({ source, quote, result, estimateId }) {
    const totals = result.totals;
    const nonRouteOperationalCost = totals.operationalCost - totals.routeCost;
    setText("breakdownEstimateId", `Estimate #${estimateId || "EST-NEW"}`);
    setText("breakdownSource", source);
    setText("breakdownCustomer", quote.customer?.name || "-");
    setText("breakdownRoute", `${result.pickupZone} -> ${result.deliveryZone}`);
    setText("bdOperationalCost", currency(totals.operationalCost));
    setText("bdAdditionalCharges", currency(totals.additionalCharges));
    setText("bdMargin", currency(totals.margin));
    setText("bdFinalPrice", currency(totals.finalPrice));
    setText("bdVehicle", result.vehicle?.name || "-");
    setText("bdRouteCost", currency(totals.routeCost));
    setText("bdDistance", `${Math.round(result.distance || 0)} mi`);
    setText("bdLaborCost", currency(totals.laborCost));
    setText("bdCrew", `${result.requiredCrew || 0} ${result.requiredCrew === 1 ? "person" : "people"}`);
    setText("bdNonRouteCost", currency(nonRouteOperationalCost));
    setText("bdPackaging", currency(totals.packaging));
    setText("bdStorage", currency(totals.storage));
    setText("bdInsurance", currency(totals.insurance));
    setText("bdAccessFees", currency(totals.accessFees));
    setText("bdOptionFees", currency(totals.optionFees));
    setText("bdAdditionalTotal", currency(totals.additionalCharges));
    setText("bdEffectiveVolume", `${Number(totals.effectiveVolume || 0).toFixed(1)} cu ft`);
    setText("bdTotalWeight", `${Number(totals.totalWeight || 0).toFixed(0)} lb`);
    setText(
      "bdRawFormula",
      `${currency(totals.operationalCost)} + ${currency(totals.additionalCharges)} + ${currency(totals.margin)} + ${currency(totals.manualAdjustment)} = ${currency(totals.rawPrice)}`
    );
    setText("bdRoundedFormula", `CEILING(${currency(totals.rawPrice)}, 10) = ${currency(totals.finalPrice)}`);
    renderItems(result.items || []);
    renderWarnings(result.warnings || []);
    byId("bdPayload").textContent = JSON.stringify(window.GoogleSheetIntegration.buildPayload(quote, result), null, 2);

    byId("breakdownEstimateLink").addEventListener("click", () => {
      window.CalculatorStorage.saveEstimateSnapshot(buildSnapshot(quote, result));
    });

    if (window.lucide) lucide.createIcons();
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderBreakdown(getSource());
  });
})();
