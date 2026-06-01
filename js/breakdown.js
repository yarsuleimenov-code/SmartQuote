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

  function recordLabel({ id, leadName, customerName, route, price }) {
    const name = leadName || customerName || "No lead name";
    const routeText = route || "No route";
    return `${id || "LOCAL"} - ${name} - ${routeText} - ${currency(price)}`;
  }

  function estimateOption(snapshot) {
    const quote = snapshot.quote || {};
    const result = snapshot.result || {};
    return {
      id: snapshot.snapshotId,
      label: recordLabel({
        id: snapshot.estimateId || quote.estimateId,
        leadName: quote.customer?.leadName,
        customerName: quote.customer?.name,
        route: `${result.pickupZone || "-"} -> ${result.deliveryZone || "-"}`,
        price: result.totals?.finalPrice,
      }),
    };
  }

  function draftOption(draft) {
    const result = window.PricingCalculator.calculateQuote(draft);
    return {
      id: draft.localId,
      label: recordLabel({
        id: draft.estimateId,
        leadName: draft.customer?.leadName,
        customerName: draft.customer?.name,
        route: `${result.pickupZone || "-"} -> ${result.deliveryZone || "-"}`,
        price: result.totals?.finalPrice,
      }),
    };
  }

  function populateRecordSelect(sourceType, selectedId) {
    const records = sourceType === "draft"
      ? window.CalculatorStorage.listDrafts().map(draftOption)
      : window.CalculatorStorage.listEstimateSnapshots().map(estimateOption);
    const select = byId("bdRecordSelect");

    if (!records.length) {
      select.innerHTML = `<option value="">No ${sourceType === "draft" ? "drafts" : "estimates"} found</option>`;
      select.disabled = true;
      return "";
    }

    select.disabled = false;
    select.innerHTML = records.map((record) => (
      `<option value="${escapeHtml(record.id)}"${record.id === selectedId ? " selected" : ""}>${escapeHtml(record.label)}</option>`
    )).join("");
    if (selectedId && records.some((record) => record.id === selectedId)) return selectedId;
    return records[0].id;
  }

  function getSource(sourceType, recordId) {
    const params = new URLSearchParams(window.location.search);
    const selectedSource = sourceType || (params.get("draftId") ? "draft" : "estimate");
    const selectedId = recordId || params.get("estimateId") || params.get("draftId");

    if (selectedSource === "draft") {
      const draft = window.CalculatorStorage.selectDraft(selectedId) || window.CalculatorStorage.load();
      if (draft) {
        return {
          source: "Draft",
          sourceType: "draft",
          recordId: draft.localId,
          quote: draft,
          result: window.PricingCalculator.calculateQuote(draft),
          estimateId: draft.estimateId,
        };
      }
    }

    const snapshot = window.CalculatorStorage.selectEstimateSnapshot(selectedId)
      || window.CalculatorStorage.loadEstimateSnapshot();
    if (snapshot?.quote && snapshot?.result) {
      return {
        source: "Snapshot",
        sourceType: "estimate",
        recordId: snapshot.snapshotId,
        quote: snapshot.quote,
        result: snapshot.result,
        estimateId: snapshot.estimateId || snapshot.quote.estimateId,
      };
    }

    const draft = window.CalculatorStorage.load() || window.CalculatorBlankQuote;
    return {
      source: "Draft",
      sourceType: "draft",
      recordId: draft.localId,
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
            <td class="px-4 py-3 text-right">${Math.ceil(Number(item.effectiveVolume || 0))} cu ft</td>
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

  function renderBreakdown({ source, sourceType, recordId, quote, result, estimateId }) {
    const totals = result.totals;
    const nonRouteOperationalCost = totals.operationalCost - totals.routeCost;
    byId("bdSourceType").value = sourceType || "estimate";
    const selectedRecordId = populateRecordSelect(sourceType || "estimate", recordId);
    byId("bdRecordSelect").value = selectedRecordId || "";
    setText("bdReviewMode", sourceType === "draft" ? "Live draft calculation" : "Frozen estimate snapshot");
    setText("breakdownEstimateId", `Estimate #${estimateId || "EST-NEW"}`);
    setText("breakdownSource", source);
    setText("breakdownCustomer", quote.customer?.leadName || quote.customer?.name || "-");
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
    setText("bdEffectiveVolume", `${Math.ceil(Number(totals.effectiveVolume || 0))} cu ft`);
    setText("bdTotalWeight", `${Number(totals.totalWeight || 0).toFixed(0)} lb`);
    setText(
      "bdRawFormula",
      `${currency(totals.operationalCost)} + ${currency(totals.additionalCharges)} + ${currency(totals.margin)} + ${currency(totals.manualAdjustment)} = ${currency(totals.rawPrice)}`
    );
    setText("bdRoundedFormula", `CEILING(${currency(totals.rawPrice)}, 10) = ${currency(totals.finalPrice)}`);
    renderItems(result.items || []);
    renderWarnings(result.warnings || []);
    byId("bdPayload").textContent = JSON.stringify(window.GoogleSheetIntegration.buildPayload(quote, result), null, 2);

    byId("breakdownEstimateLink").onclick = () => {
      window.CalculatorStorage.saveEstimateSnapshot(buildSnapshot(quote, result));
    };

    if (window.lucide) lucide.createIcons();
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderBreakdown(getSource());
    byId("bdSourceType").addEventListener("change", () => {
      const sourceType = byId("bdSourceType").value;
      const recordId = populateRecordSelect(sourceType);
      renderBreakdown(getSource(sourceType, recordId));
    });
    byId("bdRecordSelect").addEventListener("change", () => {
      renderBreakdown(getSource(byId("bdSourceType").value, byId("bdRecordSelect").value));
    });
  });
})();
