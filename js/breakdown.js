(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const element = byId(id);
    if (element) element.textContent = value;
  }

  function setWidth(id, value) {
    const element = byId(id);
    if (element) element.style.width = `${Math.max(0, Number(value) || 0)}%`;
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

  function traceCheck(row) {
    const checks = {
      pickupZone: "Pickup route zone",
      deliveryZone: "Delivery route zone",
      distance: "Interstate distance",
      "stageBreakdown.pickup.total": "Pickup stage total",
      "stageBreakdown.interstate.total": "Interstate stage total",
      "stageBreakdown.delivery.total": "Delivery stage total",
      "totals.routeCost": "Route cost",
      "totals.rawPrice": "Price before rounding",
      "totals.finalPrice": "Final customer price",
      "calculationContract.routeClassification.routeType": "Route service type",
      "calculationContract.routeClassification.pickup.coverage": "Pickup ZIP coverage",
      "calculationContract.routeClassification.delivery.coverage": "Delivery ZIP coverage",
      "calculationContract.routeClassification.distance.source": "Distance source",
      "calculationContract.routeClassification.pickup.readiness": "Pickup route readiness",
      "calculationContract.routeClassification.delivery.readiness": "Delivery route readiness",
      "calculationContract.routeClassification.serviceFlags": "Direct / specific-date request",
      "calculationContract.normalizedOrderInputs": "Order data captured",
      "calculationContract.protectionPricing": "FVP protection pricing",
      "calculationContract.itemHandlingFeasibility.maxSingleItemWeight": "Heaviest single item",
      "calculationContract.itemHandlingFeasibility.heaviestItemWeightClass": "Heaviest item class",
      "calculationContract.itemHandlingFeasibility.onePersonEligible": "One-person handling eligibility",
      "calculationContract.itemHandlingFeasibility.rows": "Item handling review",
      "calculationContract.itemHandlingFeasibility.requiredCrewFromItems": "Crew required from items",
      "calculationContract.itemHandlingFeasibility.hardAccessConstraint": "Access constraint review",
      "calculationContract.itemHandlingFeasibility.crewReviewRequired": "Crew review requirement",
      "calculationContract.capacityVehicleFit.selectedVehicle": "Selected vehicle",
      "calculationContract.capacityVehicleFit.utilization.vehicleUtilization": "Vehicle volume utilization",
      "calculationContract.capacityVehicleFit.utilization.payloadUtilization": "Vehicle payload utilization",
      "calculationContract.capacityVehicleFit.fit.volumeFit": "Volume capacity fit",
      "calculationContract.capacityVehicleFit.fit.weightFit": "Payload capacity fit",
      "calculationContract.capacityVehicleFit.utilization.shipmentDensityLbPerCuFt": "Shipment density",
      "calculationContract.capacityVehicleFit.utilization.vehicleDensityCapacityLbPerCuFt": "Vehicle density capacity",
      "calculationContract.capacityVehicleFit.utilization.capacityConstraintType": "Capacity limiting factor",
      "calculationContract.capacityVehicleFit.utilization.limitingCapacityFactor": "Capacity utilization limit",
      "calculationContract.capacityVehicleFit.fit.capacityOverflowFlag": "Capacity overflow check",
      "calculationContract.capacityVehicleFit.fit.dimensionalFit": "Dimensional fit",
      "calculationContract.capacityVehicleFit.warnings.vehicleFitWarning": "Vehicle fit warning",
      "calculationContract.capacityVehicleFit.recommendedVehicle": "Recommended vehicle",
      "calculationContract.capacityVehicleFit.warnings.itemDoesNotFitVehicle": "Item fit warning",
    };
    return checks[row.input] || row.block || "Calculation check";
  }

  function traceStatusLabel(status) {
    if (String(status).startsWith("Implemented")) return "Calculated";
    if (String(status).includes("No price impact")) return "Audit only";
    return status || "Review";
  }

  function traceFormula(row) {
    return row.formula && row.formula !== "Formula definition unavailable"
      ? row.formula
      : "Formula definition unavailable";
  }

  function traceBoolean(row, value) {
    const path = String(row.input || "");
    if (path.includes("volumeFit") || path.includes("weightFit")) return value ? "Pass" : "Review required";
    if (path.includes("onePersonEligible")) return value ? "Eligible" : "Not eligible";
    if (path.includes("crewReviewRequired")) return value ? "Review required" : "No review required";
    if (path.includes("capacityOverflowFlag")) return value ? "Over capacity" : "No overflow";
    if (path.includes("Warning") || path.includes("DoesNotFit")) return value ? "Review required" : "No warning";
    return value ? "Yes" : "No";
  }

  function traceObjectResult(row, value) {
    const path = String(row.input || "");
    if (path.endsWith(".coverage")) {
      const state = { covered: "Covered", disabled: "Excluded", approval_required: "Review required" }[value.coverageStatus] || "Coverage unknown";
      return [value.zone || value.zip, state, `Coefficient ${number(value.priceCoefficient || 1).toFixed(2)}`].filter(Boolean).join(" | ");
    }
    if (path.endsWith(".serviceFlags")) {
      return `${value.directRequested ? "Direct requested" : "No direct service"} | ${value.specificDateRequested ? "Specific date requested" : "No specific date"}`;
    }
    if (path.endsWith("normalizedOrderInputs")) {
      const billable = number(value.items?.billableRows);
      const pickup = value.route?.pickupZip ? "Pickup ZIP captured" : "Pickup ZIP missing";
      const delivery = value.route?.deliveryZip ? "Delivery ZIP captured" : "Delivery ZIP missing";
      return `${billable} billable item${billable === 1 ? "" : "s"} | ${pickup} | ${delivery}`;
    }
    if (path.endsWith("protectionPricing")) {
      if (!value.fvpItemCount) return "No FVP items selected";
      return `Declared value ${currency(value.declaredValue)} | Rate ${(number(value.rate) * 100).toFixed(2)}% | Fixed fee ${currency(value.fixedFee)} once | Total ${currency(value.totalCost)}`;
    }
    if (path.endsWith(".rows")) return `${value.length || 0} item${value.length === 1 ? "" : "s"} reviewed`;
    if (path.endsWith("hardAccessConstraint")) {
      return `Pickup: ${value.pickup ? "review" : "clear"} | Delivery: ${value.delivery ? "review" : "clear"}`;
    }
    if (path.endsWith("selectedVehicle") || path.endsWith("recommendedVehicle")) return vehicleName(value);
    return "Available in detailed analysis";
  }

  function traceResult(row) {
    if (row.result === null || row.result === undefined) return "Not available";
    if (typeof row.result === "object") return traceObjectResult(row, row.result);
    if (typeof row.result === "boolean") return traceBoolean(row, row.result);
    if (row.unit === "USD" || /^(PICK|INT|DEL|FINAL)-/.test(row.formulaId)) return currency(row.result);

    const path = String(row.input || "");
    if (path === "distance") return `${number(row.result).toLocaleString("en-US")} mi`;
    if (path.includes("Weight")) return `${number(row.result).toLocaleString("en-US")} lb`;
    if (path.includes("Crew")) return `${number(row.result)} people`;
    if (path.includes("Utilization") || path.includes("limitingCapacityFactor")) return `${Math.round(number(row.result) * 100)}%`;
    if (path.includes("Density")) return `${number(row.result).toFixed(2)} lb/cu ft`;

    const labels = {
      consolidated: "Consolidated route",
      direct: "Direct service",
      specific_date: "Specific service date",
      approved_average_matrix: "Approved average matrix",
      approved_average_pending_direct_mileage: "Direct mileage review needed",
      covered: "Covered",
      excluded: "Excluded",
      review_required: "Review required",
      volume_limited: "Volume limited",
      weight_limited: "Weight limited",
      not_available: "Not available",
      heavy: "Heavy",
      two_person_required: "Two people required",
      standard: "Standard",
      light: "Light",
    };
    return labels[row.result] || `${row.result}${row.unit ? ` ${row.unit}` : ""}`;
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
    const list = byId("bdWarnings");
    if (!list) return;
    list.innerHTML = warnings.length
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

  function renderItemHandling(result) {
    const handling = window.CostBreakdownAnalysis.itemHandling(result);
    setText("bdHandlingStatus", handling.status);
    byId("bdHandlingStatus").className = `text-xs px-3 py-1 rounded-full font-semibold ${statusClass(handling.status)}`;
    setText("bdHandlingRequiredCrew", handling.requiredCrew === "Not available" ? handling.requiredCrew : `${handling.requiredCrew} ${handling.requiredCrew === 1 ? "person" : "people"}`);
    setText("bdHandlingHeaviestItem", handling.maxSingleItemWeight);
    setText("bdHandlingWeightClass", handling.heaviestItemClass);
    setText("bdHandlingOnePerson", handling.onePersonEligible);
    setText("bdHandlingAccess", handling.accessConstraint);
    setText("bdHandlingTotalPieces", handling.totalPieces === "Not available" ? handling.totalPieces : `${handling.totalPieces} pieces`);
    setText("bdHandlingHeavyPieces", handling.heavyPieceCount === "Not available" ? handling.heavyPieceCount : `${handling.heavyPieceCount} pieces`);
    byId("bdHandlingItems").innerHTML = handling.rows.length
      ? handling.rows.map((item) => `
          <tr>
            <td class="px-4 py-3 font-medium text-slate-800">${escapeHtml(item.name || "Unnamed item")}</td>
            <td class="px-4 py-3 text-slate-600">${escapeHtml(item.quantity)}</td>
            <td class="px-4 py-3 text-slate-600">${escapeHtml(`${number(item.unitWeight)} lb`)}</td>
            <td class="px-4 py-3 text-slate-600">${escapeHtml(item.handlingComplexity?.classification ? item.handlingComplexity.classification.replace(/_/g, " ") : "standard")}</td>
            <td class="px-4 py-3 ${item.warning && item.warning !== "OK" ? "text-amber-700" : "text-emerald-700"}">${escapeHtml(item.warning || "OK")}</td>
            <td class="px-4 py-3 text-slate-600">${item.onePersonEligibleByWeight ? "Eligible" : "Review"}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="6" class="px-4 py-6 text-center text-slate-400">No item handling data available.</td></tr>`;
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
        <td class="px-3 py-3 align-top"><p class="font-medium text-slate-800">${escapeHtml(traceCheck(row))}</p><p class="mt-1 text-xs text-slate-500">${escapeHtml(row.source === "calculator result" ? "Current calculation" : "Contract audit check")}</p></td>
        <td class="px-3 py-3 align-top"><p class="font-mono text-xs leading-5 text-slate-600">${escapeHtml(traceFormula(row))}</p></td>
        <td class="px-3 py-3 align-top"><p class="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-800">${escapeHtml(traceResult(row))}</p></td>
        <td class="px-3 py-3 align-top"><span class="inline-flex rounded px-2 py-1 font-semibold ${traceStatusClass(row.status)}">${escapeHtml(traceStatusLabel(row.status))}</span></td>
      </tr>
    `).join("");
  }

  function renderBreakdown({ source, sourceType, recordId, quote, result, estimateId, snapshotMeta }) {
    const totals = result.totals;
    const nonRouteOperationalCost = totals.operationalCost - totals.routeCost;
    const displayedAdditionalCharges = Number(totals.additionalCharges || 0) + Number(totals.manualAdjustment || 0) + Number(totals.extraLaborCost || 0);
    const stageBreakdown = result.stageBreakdown || {};
    const pickupStageTotal = number(stageBreakdown.pickup?.total);
    const interstateStageTotal = number(stageBreakdown.interstate?.total);
    const deliveryStageTotal = number(stageBreakdown.delivery?.total);
    const stageSubtotal = pickupStageTotal + interstateStageTotal + deliveryStageTotal;
    const rawPrice = number(totals.rawPrice);
    const finalPrice = number(totals.finalPrice);
    const roundingDelta = finalPrice - rawPrice;
    const otherLegacyCharges = displayedAdditionalCharges
      - number(totals.storage)
      - number(totals.insurance)
      - number(totals.accessFees)
      - number(totals.extraLaborCost);
    const visualTotal = Math.max(
      1,
      number(totals.operationalCost)
        + displayedAdditionalCharges
        + number(totals.margin)
        + Math.max(0, roundingDelta)
    );
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
    setText("bdRawPrice", currency(rawPrice));
    setText("bdFinalPrice", currency(totals.finalPrice));
    setText("bdStoryOperational", currency(totals.operationalCost));
    setText("bdStoryAdditional", currency(displayedAdditionalCharges));
    setText("bdStoryMargin", currency(totals.margin));
    setText("bdStoryRaw", currency(rawPrice));
    setText("bdStoryFinal", currency(finalPrice));
    setText("bdStoryFormula", `${currency(totals.operationalCost)} + ${currency(displayedAdditionalCharges)} + ${currency(totals.margin)} = ${currency(rawPrice)} -> rounded to ${currency(finalPrice)}`);
    setText("bdRoundingDelta", currency(roundingDelta));
    setText("bdRoundingDeltaLabel", `Rounding Delta ${currency(roundingDelta)}`);
    setWidth("bdBarOperational", (number(totals.operationalCost) / visualTotal) * 100);
    setWidth("bdBarAdditional", (displayedAdditionalCharges / visualTotal) * 100);
    setWidth("bdBarMargin", (number(totals.margin) / visualTotal) * 100);
    setWidth("bdBarRounding", (Math.max(0, roundingDelta) / visualTotal) * 100);
    setText("bdVehicle", result.vehicle?.name || "-");
    setText("bdCompositionOperational", currency(totals.operationalCost));
    setText("bdCompositionAdditional", currency(displayedAdditionalCharges));
    setText("bdCompositionMargin", currency(totals.margin));
    setText("bdCompositionRaw", currency(rawPrice));
    setText("bdCompositionRounding", currency(roundingDelta));
    setText("bdCompositionFinal", currency(finalPrice));
    setText("bdPickupStageTotal", currency(pickupStageTotal));
    setText("bdInterstateStageTotal", currency(interstateStageTotal));
    setText("bdDeliveryStageTotal", currency(deliveryStageTotal));
    setText("bdStageSubtotal", currency(stageSubtotal));
    setText("bdOtherLegacyCharges", currency(otherLegacyCharges));
    setText("bdOperationalReconciliation", `${currency(stageSubtotal)} stage subtotal + ${currency(nonRouteOperationalCost)} non-route = ${currency(totals.operationalCost)} operational cost`);
    setText("bdRawReconciliation", `${currency(totals.operationalCost)} operational + ${currency(displayedAdditionalCharges)} additional + ${currency(totals.margin)} margin = ${currency(rawPrice)} raw price`);
    setText("bdFinalReconciliation", `${currency(rawPrice)} raw price + ${currency(roundingDelta)} rounding = ${currency(finalPrice)} final price`);
    setText("bdRouteCost", currency(totals.routeCost));
    setText("bdDistance", `${Math.round(result.distance || 0)} mi`);
    setText("bdLaborCost", currency(totals.laborCost));
    setText("bdCrew", `${result.requiredCrew || 0} ${result.requiredCrew === 1 ? "person" : "people"}`);
    setText("bdNonRouteCost", currency(nonRouteOperationalCost));
    setText("bdStorage", currency(totals.storage));
    setText("bdInsurance", currency(totals.insurance));
    setText("bdAccessFees", currency(totals.accessFees));
    setText("bdSpecialLabor", currency(totals.extraLaborCost));
    setText("bdEffectiveVolume", `${Math.ceil(Number(totals.effectiveVolume || 0))} cu ft`);
    setText("bdTotalWeight", `${Number(totals.totalWeight || 0).toFixed(0)} lb`);
    setText("bdEffectiveCostPerCuFt", totals.totalVolume > 0 ? currency(totals.effectiveCostPerCuFt) : "N/A");
    renderRouteStages(quote, result);
    renderItems(result.items || []);
    renderWarnings(result.warnings || []);
    const presentation = window.CostBreakdownAnalysis.warningPresentation(quote, result, sourceType === "estimate");
    renderCapacityAnalysis(result, presentation);
    renderItemHandling(result);
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
