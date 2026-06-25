(function () {
  const contractVersion = "smartquote-calculation-v1";
  const traceVersion = "normalized-formula-trace-v1";

  function clone(value) {
    return JSON.parse(JSON.stringify(value ?? null));
  }

  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function normalizeItem(item, index) {
    const source = item || {};
    return {
      ...clone(source),
      id: source.id || `item-${index + 1}`,
      name: String(source.name || ""),
      length: number(source.length),
      width: number(source.width),
      height: number(source.height),
      weight: number(source.weight),
      qty: Math.max(number(source.qty, 1), 0),
      declaredValue: Math.max(number(source.declaredValue), 0),
      storageDays: Math.max(number(source.storageDays), 0),
      fragile: Boolean(source.fragile),
      nonStackable: Boolean(source.nonStackable),
      crated: Boolean(source.crated),
    };
  }

  function normalizeAccessSide(side) {
    const source = side || {};
    return {
      ...clone(source),
      floor: Math.max(number(source.floor, 1), 0),
      elevatorAvailable: Boolean(source.elevatorAvailable),
      direct: Boolean(source.direct),
      directDate: source.directDate || "",
    };
  }

  function normalizeInput(quote) {
    const source = quote || {};
    return {
      ...clone(source),
      route: {
        ...clone(source.route || {}),
        pickupZip: String(source.route?.pickupZip || "").trim(),
        deliveryZip: String(source.route?.deliveryZip || "").trim(),
      },
      items: (Array.isArray(source.items) ? source.items : []).map(normalizeItem),
      access: {
        ...clone(source.access || {}),
        pickup: normalizeAccessSide(source.access?.pickup),
        delivery: normalizeAccessSide(source.access?.delivery),
      },
      options: {
        ...clone(source.options || {}),
        extraLaborPeople: Math.max(number(source.options?.extraLaborPeople), 0),
        extraLaborHours: Math.max(number(source.options?.extraLaborHours), 0),
        extraLaborRate: Math.max(number(source.options?.extraLaborRate, 50), 0),
      },
    };
  }

  function referenceVersions(variablesSnapshot) {
    let vehicleSeedVersion = "runtime-unversioned";
    try {
      vehicleSeedVersion = window.localStorage?.getItem("vehiclesSeedVersion") || vehicleSeedVersion;
    } catch {
      // Storage is optional in isolated calculation tests.
    }

    const fuelVersion = variablesSnapshot?.fuelPrices?.find((entry) => entry?.variablesVersion)?.variablesVersion;
    return {
      vehicles: vehicleSeedVersion,
      fuelPrices: fuelVersion || variablesSnapshot?.variablesVersion || "runtime-unversioned",
      distanceMatrix: variablesSnapshot?.variablesVersion || "runtime-unversioned",
      zipCoverage: window.CoverageZipDataVersion || "runtime-unversioned",
    };
  }

  function traceRows(input, result) {
    const totals = result?.totals || {};
    const stages = result?.stageBreakdown || {};
    return [
      { formulaId: "RTE-001", outputPath: "pickupZone", value: result?.pickupZone },
      { formulaId: "RTE-002", outputPath: "deliveryZone", value: result?.deliveryZone },
      { formulaId: "RTE-003", outputPath: "distance", value: result?.distance },
      { formulaId: "PICK-007", outputPath: "stageBreakdown.pickup.total", value: stages.pickup?.total },
      { formulaId: "INT-004", outputPath: "stageBreakdown.interstate.total", value: stages.interstate?.total },
      { formulaId: "DEL-007", outputPath: "stageBreakdown.delivery.total", value: stages.delivery?.total },
      { formulaId: "FINAL-009", outputPath: "totals.routeCost", value: totals.routeCost },
      { formulaId: "FINAL-012", outputPath: "totals.rawPrice", value: totals.rawPrice },
      { formulaId: "FINAL-014", outputPath: "totals.finalPrice", value: totals.finalPrice },
    ].map((row) => ({
      ...row,
      status: "Implemented / Baseline",
      inputRecordId: input.localId || input.estimateId || null,
    }));
  }

  function finalize(input, result) {
    const variablesSnapshot = window.PricingConfig?.snapshot?.() || null;
    return {
      ...result,
      calculationContract: {
        contractVersion,
        traceVersion,
        calculatedAt: new Date().toISOString(),
        formulaVersion: window.CalculatorVariables?.formulaVersion || "unknown",
        variablesVersion: variablesSnapshot?.variablesVersion || window.CalculatorVariables?.variablesVersion || "unknown",
        referenceVersions: referenceVersions(variablesSnapshot),
        normalizedInput: clone(input),
        trace: traceRows(input, result),
      },
    };
  }

  const baselineCalculate = window.PricingCalculator?.calculateQuote;
  if (typeof baselineCalculate === "function") {
    window.PricingCalculator.calculateQuoteBaseline = baselineCalculate;
    window.PricingCalculator.calculateQuote = function calculateQuoteWithContract(quote) {
      const input = normalizeInput(quote);
      return finalize(input, baselineCalculate(input));
    };
  }

  window.CalculationContract = {
    contractVersion,
    traceVersion,
    normalizeInput,
    referenceVersions,
    traceRows,
    finalize,
  };
})();
