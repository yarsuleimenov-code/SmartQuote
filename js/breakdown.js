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

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function vehicleName(vehicle) {
    return vehicle?.name || vehicle?.vehicleName || "-";
  }

  function settings() {
    return window.CalculatorVariables?.settings || {};
  }

  function localZoneDistance(zone) {
    return number(window.CalculatorVariables?.distanceMatrix?.[zone]?.[zone]);
  }

  function modeLabel(isDirect, date, fallback) {
    if (!isDirect) return fallback;
    return date ? `Direct - ${date}` : "Direct - date needed";
  }

  function statusClass(status) {
    if (status === "Blocked") return "bg-red-100 text-red-700";
    if (status === "Review Required") return "bg-amber-100 text-amber-800";
    if (status === "Ready") return "bg-green-100 text-green-700";
    if (status === "No price impact" || status === "Capacity fit" || status === "Audit only") return "bg-blue-50 text-blue-700";
    return "bg-slate-100 text-slate-600";
  }

  function severityClass(severity) {
    if (severity === "blocking") return "bg-red-100 text-red-700";
    if (severity === "approval") return "bg-amber-100 text-amber-800";
    if (severity === "warning") return "bg-yellow-50 text-yellow-700";
    return "bg-blue-50 text-blue-700";
  }

  function fitLabel(value) {
    if (value === true) return "Pass";
    if (value === false) return "Fail";
    return window.CostBreakdownAnalysis?.notAvailable || "Not available";
  }

  function traceStatusClass(status) {
    if (String(status).startsWith("Blocked")) return "bg-red-50 text-red-700";
    if (String(status).includes("Review")) return "bg-amber-50 text-amber-700";
    return "bg-slate-100 text-slate-700";
  }

  function traceSourceClass(source) {
    const value = String(source || "").toLowerCase();
    if (value.includes("variables") || value.includes("settings")) return "bg-blue-50 text-blue-700";
    if (value.includes("reference") || value.includes("vehicle body")) return "bg-green-50 text-green-700";
    return "bg-slate-100 text-slate-600";
  }

  function traceResult(row) {
    if (row.result === null || row.result === undefined) return "Not available";
    if (typeof row.result === "object") return JSON.stringify(row.result);
    return row.unit === "USD" ? currency(row.result) : `${row.result}${row.unit ? ` ${row.unit}` : ""}`;
  }

  function buildSnapshot(quote, result) {
    const createdAt = new Date();
    const validUntil = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
    return {
      snapshotVersion: 1,
      formulaVersion: window.CalculatorVariables?.formulaVersion || "unknown",
      variablesSnapshot: window.PricingConfig?.snapshot?.() || null,
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
          snapshotMeta: {
            formulaVersion: window.CalculatorVariables?.formulaVersion,
            variablesVersion: window.CalculatorVariables?.variablesVersion,
            rounding: window.CalculatorVariables?.settings?.rounding,
          },
        };
      }
    }

    const snapshot = window.CalculatorStorage.selectEstimateSnapshot(selectedId)
      || window.CalculatorStorage.loadEstimateSnapshot();
    if (snapshot?.quote && snapshot?.result) {
      const result = {
        ...snapshot.result,
        calculationContract: snapshot.result.calculationContract || snapshot.calculationContract || null,
      };
      return {
        source: "Snapshot",
        sourceType: "estimate",
        recordId: snapshot.snapshotId,
        quote: snapshot.quote,
        result,
        estimateId: snapshot.estimateId || snapshot.quote.estimateId,
        snapshotMeta: {
          formulaVersion: snapshot.formulaVersion,
          variablesVersion: snapshot.variablesVersion || snapshot.variablesSnapshot?.variablesVersion,
          rounding: snapshot.variablesSnapshot?.settings?.rounding,
          calculationTimestamp: snapshot.calculationTimestamp || snapshot.createdAt,
        },
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
      snapshotMeta: {
        formulaVersion: window.CalculatorVariables?.formulaVersion,
        variablesVersion: window.CalculatorVariables?.variablesVersion,
        rounding: window.CalculatorVariables?.settings?.rounding,
      },
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
            <td class="px-4 py-3 text-right">${currency(item.itemReferencePrice || 0)}</td>
            <td class="px-4 py-3">${escapeHtml(item.protectionPlan || (item.insurance === "Full Coverage" ? "FVP" : "RV"))}</td>
            <td class="px-4 py-3 ${item.warning && item.warning !== "OK" ? "text-amber-700" : "text-green-700"}">${escapeHtml(item.warning || "OK")}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="8" class="px-4 py-6 text-center text-slate-400">No billable items in this quote.</td></tr>`;
  }

  function renderWarnings(warnings) {
    byId("bdWarnings").innerHTML = warnings.length
      ? warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")
      : "<li>No item warnings</li>";
  }

  function renderRouteStages(quote, result) {
    const pickupMiles = localZoneDistance(result.pickupZone);
    const deliveryMiles = localZoneDistance(result.deliveryZone);
    const interstateVehicle = settings().interstateVehicleName || "Penske 26 ft";
    const pickupDirect = Boolean(quote.options?.pickupDirect);
    const deliveryDirect = Boolean(quote.options?.deliveryDirect);
    const stageBreakdown = result.stageBreakdown || {};
    const rows = [
      {
        stage: "Pickup",
        route: result.pickupZone || "-",
        miles: pickupMiles,
        vehicle: vehicleName(result.vehicle),
        crew: result.crew?.pickup ? `${result.crew.pickup} ${result.crew.pickup === 1 ? "person" : "people"}` : "0",
        mode: modeLabel(pickupDirect, quote.options?.pickupDirectDate, "Local pickup"),
        total: stageBreakdown.pickup?.total || 0,
        components: [
          ["Labor", stageBreakdown.pickup?.components?.labor],
          ["Mileage", stageBreakdown.pickup?.components?.mileage],
          ["Handling", stageBreakdown.pickup?.components?.handling],
          ["Mgmt / Dispatch", stageBreakdown.pickup?.components?.managementDispatch],
        ],
      },
      {
        stage: "Interstate",
        route: `${result.pickupZone || "-"} -> ${result.deliveryZone || "-"}`,
        miles: number(result.distance),
        vehicle: interstateVehicle,
        crew: "Driver",
        mode: "Linehaul",
        total: stageBreakdown.interstate?.total || 0,
        components: [
          ["Fuel", stageBreakdown.interstate?.components?.fuel],
          ["Vehicle Cost", stageBreakdown.interstate?.components?.vehicleCost],
          ["Driver", stageBreakdown.interstate?.components?.driver],
          ["Route Share", stageBreakdown.interstate?.components?.routeShare],
        ],
      },
      {
        stage: "Delivery",
        route: result.deliveryZone || "-",
        miles: deliveryMiles,
        vehicle: vehicleName(result.vehicle),
        crew: result.crew?.delivery ? `${result.crew.delivery} ${result.crew.delivery === 1 ? "person" : "people"}` : "0",
        mode: modeLabel(deliveryDirect, quote.options?.deliveryDirectDate, "Local delivery"),
        total: stageBreakdown.delivery?.total || 0,
        components: [
          ["Labor", stageBreakdown.delivery?.components?.labor],
          ["Mileage", stageBreakdown.delivery?.components?.mileage],
          ["Handling", stageBreakdown.delivery?.components?.handling],
          ["Mgmt / Dispatch", stageBreakdown.delivery?.components?.managementDispatch],
        ],
      },
    ];

    byId("bdRouteStages").innerHTML = rows.map((row) => `
      <article class="rounded-lg border border-slate-200 p-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h4 class="font-bold text-slate-800">${escapeHtml(row.stage)} Stage</h4>
            <p class="mt-1 text-xs text-slate-500">${escapeHtml(row.route)} | ${Math.round(row.miles || 0)} mi | ${escapeHtml(row.vehicle)} | ${escapeHtml(row.crew)} | ${escapeHtml(row.mode)}</p>
          </div>
          <p class="text-2xl font-bold text-slate-800">${currency(row.total)}</p>
        </div>
        <div class="mt-4 grid grid-cols-4 gap-3">
          ${row.components.map(([label, value]) => `
            <div class="rounded-lg bg-slate-50 p-3">
              <p class="text-xs text-slate-400">${escapeHtml(label)}</p>
              <p class="mt-1 font-semibold text-slate-800">${currency(value)}</p>
            </div>
          `).join("")}
        </div>
      </article>
    `).join("");

    const reconciliation = window.CostBreakdownAnalysis.stageReconciliation(result);
    const reconciliationLabel = reconciliation.reconciled
      ? `Reconciled: stages ${currency(reconciliation.stageTotal)} = route cost ${currency(reconciliation.routeCost)}; route cost + non-route ${currency(reconciliation.nonRouteOperationalCost)} = operational cost ${currency(reconciliation.operationalCost)}.`
      : `Review mismatch: route delta ${currency(reconciliation.routeDelta)}, operational delta ${currency(reconciliation.operationalDelta)}.`;
    setText("bdRouteStageNote", `Stage totals are existing calculator outputs. ${reconciliationLabel} Pricing formulas were not changed.`);
  }

  function renderCapacityAnalysis(result, presentation) {
    const capacity = window.CostBreakdownAnalysis.capacityAnalysis(result, presentation);
    setText("bdCapacityStatus", capacity.warningStatus);
    byId("bdCapacityStatus").className = `text-xs px-3 py-1 rounded-full font-semibold ${statusClass(capacity.warningStatus)}`;
    setText("bdShipmentDensity", capacity.shipmentDensity);
    setText("bdVehicleDensityThreshold", capacity.vehicleDensityThreshold);
    setText("bdVolumeUtilization", capacity.volumeUtilization);
    setText("bdPayloadUtilization", capacity.payloadUtilization);
    setText("bdLimitingFactor", capacity.limitingFactor);
    setText("bdSelectedCostBasis", capacity.selectedCostBasis);
    setText("bdCapacityVehicle", capacity.selectedVehicle);
    setText("bdRecommendedVehicle", capacity.recommendedVehicle);
  }

  function renderWarningDetails(presentation) {
    setText("bdReadiness", presentation.readiness.label);
    byId("bdReadiness").className = `text-xs px-3 py-1 rounded-full font-semibold ${statusClass(presentation.readiness.label)}`;
    byId("bdWarningDetails").innerHTML = presentation.warnings.length
      ? presentation.warnings.map((entry) => `
          <tr>
            <td class="px-4 py-3"><span class="inline-flex rounded-full px-2 py-1 text-xs font-semibold ${severityClass(entry.severity)}">${escapeHtml(entry.severity)}</span></td>
            <td class="px-4 py-3 text-slate-600">${escapeHtml(entry.scope)}${entry.target ? `<p class="mt-1 text-xs text-slate-400">${escapeHtml(entry.target)}</p>` : ""}</td>
            <td class="px-4 py-3"><p class="font-medium text-slate-800">${escapeHtml(entry.title)}</p><p class="mt-1 text-xs text-slate-500">${escapeHtml(entry.message)}</p></td>
            <td class="px-4 py-3 text-slate-600">${escapeHtml(entry.actionLabel || "-")}</td>
            <td class="px-4 py-3 text-slate-600">${escapeHtml(entry.approvalRole || "Not assigned")}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="5" class="px-4 py-6 text-center text-slate-400">No readiness warnings.</td></tr>`;
  }

  function renderVehicleFit(result) {
    const fit = window.CostBreakdownAnalysis.vehicleFit(result);
    setText("bdVehicleFitStatus", fit.status);
    setText("bdFitSelectedVehicle", fit.selectedVehicle);
    setText("bdFitRecommendedVehicle", fit.recommendedVehicle);
    setText("bdDimensionalFit", fitLabel(fit.dimensionalFit));
    setText("bdDoorOpeningFit", fitLabel(fit.doorOpeningFit));
    setText("bdVolumeFit", fitLabel(fit.volumeFit));
    setText("bdPayloadFit", fitLabel(fit.payloadFit));
    setText("bdEquipmentFit", fitLabel(fit.equipmentFit));
  }

  function renderFormulaTrace(result, snapshotMeta) {
    const rows = window.CostBreakdownAnalysis.formulaTrace(result, snapshotMeta);
    byId("bdFormulaTrace").innerHTML = rows.map((row) => `
      <tr>
        <td class="px-3 py-3 align-top"><p class="font-mono font-semibold text-slate-700">${escapeHtml(row.formulaId)}</p><p class="mt-1 font-medium text-slate-800">${escapeHtml(row.block)}</p></td>
        <td class="px-3 py-3 align-top"><p class="text-slate-700">${escapeHtml(row.input)}</p><span class="mt-2 inline-flex rounded px-2 py-1 ${traceSourceClass(row.source)}">${escapeHtml(row.source)}</span></td>
        <td class="px-3 py-3 align-top"><p class="font-mono text-slate-600">${escapeHtml(row.formula)}</p><p class="mt-2 rounded bg-slate-100 px-2 py-1 font-semibold text-slate-800">${escapeHtml(traceResult(row))}</p></td>
        <td class="px-3 py-3 align-top"><p class="text-slate-600">${escapeHtml(row.goesTo)}</p><span class="mt-2 inline-flex rounded px-2 py-1 font-semibold ${traceStatusClass(row.status)}">${escapeHtml(row.status)}</span></td>
      </tr>
    `).join("");
  }

  function renderBreakdown({ source, sourceType, recordId, quote, result, estimateId, snapshotMeta }) {
    const totals = result.totals;
    const nonRouteOperationalCost = totals.operationalCost - totals.routeCost;
    const displayedAdditionalCharges = Number(totals.additionalCharges || 0) + Number(totals.manualAdjustment || 0) + Number(totals.extraLaborCost || 0);
    byId("bdSourceType").value = sourceType || "estimate";
    const selectedRecordId = populateRecordSelect(sourceType || "estimate", recordId);
    byId("bdRecordSelect").value = selectedRecordId || "";
    setText("bdReviewMode", sourceType === "draft" ? "Live draft calculation" : "Frozen estimate snapshot");
    setText("breakdownEstimateId", `Estimate #${estimateId || "EST-NEW"}`);
    setText("breakdownSource", source);
    setText("breakdownCustomer", quote.customer?.leadName || quote.customer?.name || "-");
    setText("breakdownRoute", `${result.pickupZone} -> ${result.deliveryZone}`);
    setText("bdOperationalCost", currency(totals.operationalCost));
    setText("bdAdditionalCharges", currency(displayedAdditionalCharges));
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
    setText("bdSpecialLabor", currency(totals.extraLaborCost));
    setText(
      "bdSpecialLaborFormula",
      `${totals.extraLaborPeople || 0} people x ${totals.extraLaborHours || 0} hours x ${currency(totals.extraLaborRate || 0)}/hour`
    );
    setText("bdManualAdjustment", currency(totals.manualAdjustment));
    setText("bdAdditionalTotal", currency(displayedAdditionalCharges));
    setText("bdEffectiveVolume", `${Math.ceil(Number(totals.effectiveVolume || 0))} cu ft`);
    setText("bdTotalWeight", `${Number(totals.totalWeight || 0).toFixed(0)} lb`);
    setText("bdEffectiveCostPerCuFt", totals.totalVolume > 0 ? currency(totals.effectiveCostPerCuFt) : "N/A");
    setText(
      "bdRawFormula",
      `${currency(totals.operationalCost)} + ${currency(displayedAdditionalCharges)} + ${currency(totals.margin)} = ${currency(totals.rawPrice)}`
    );
    setText("bdRoundedFormula", `CEILING(${currency(totals.rawPrice)}, 10) = ${currency(totals.finalPrice)}`);
    renderRouteStages(quote, result);
    renderItems(result.items || []);
    renderWarnings(result.warnings || []);
    const presentation = window.CostBreakdownAnalysis.warningPresentation(quote, result, sourceType === "estimate");
    renderCapacityAnalysis(result, presentation);
    renderWarningDetails(presentation);
    renderVehicleFit(result);
    renderFormulaTrace(result, snapshotMeta || {});
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
