const fs = require("fs");
const vm = require("vm");

function createLocalStorage(seed = {}) {
  const store = new Map(Object.entries(seed).map(([key, value]) => [key, String(value)]));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const localStorage = createLocalStorage();
const context = {
  window: { localStorage },
  localStorage,
  console,
};
context.window.window = context.window;
vm.createContext(context);

[
  "js/zoneZipMap.js",
  "js/coverageZipData.js",
  "js/zipCoverage.js",
  "js/variables.js",
  "js/pricingConfig.js",
  "js/mockData.js",
  "js/calculator.js",
  "js/calculationContract.js",
  "js/formulaMasterData.js",
  "js/warningPresentation.js",
  "js/costBreakdownAnalysis.js",
].forEach((file) => {
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
});

const quote = clone(context.window.CalculatorMockData);
quote.route.pickupCoverage = {
  zip: quote.route.pickupZip,
  inCoverageDataset: true,
  coverageStatus: "disabled",
  priceCoefficient: 1,
};
quote.route.deliveryCoverage = {
  zip: quote.route.deliveryZip,
  inCoverageDataset: true,
  coverageStatus: "covered",
  priceCoefficient: 1,
};

const result = context.window.PricingCalculator.calculateQuote(quote);
const analysis = context.window.CostBreakdownAnalysis;
const reconciliation = analysis.stageReconciliation(result);
const presentation = analysis.warningPresentation(quote, result, true);
const capacity = analysis.capacityAnalysis(result, presentation);
const handling = analysis.itemHandling(result);
const fit = analysis.vehicleFit(result);
const trace = analysis.formulaTrace(result, {
  rounding: context.window.CalculatorVariables.settings.rounding,
});

assert(reconciliation.reconciled, "Expected stage totals to reconcile with route cost.");
assert(Math.abs(reconciliation.stageTotal - result.totals.routeCost) <= 1, "Expected stage total within $1 of route cost.");
assert(reconciliation.operationalReconciled, "Expected route and non-route totals to reconcile with operational cost.");
assert(
  Math.abs(reconciliation.operationalStageTotal - result.totals.operationalCost) <= 1,
  "Expected operational stage total within $1 of operational cost.",
);
assert(capacity.shipmentDensity !== "Not available", "Expected shipment density from calculation contract.");
assert(capacity.volumeUtilization !== "Not available", "Expected volume utilization from calculation contract.");
assert(capacity.payloadUtilization !== "Not available", "Expected payload utilization from calculation contract.");
assert(capacity.warningStatus === "No price impact", "Expected capacity output to remain audit-only.");
assert(capacity.selectedVehicle === result.vehicle.name, "Expected selected AS-IS vehicle to remain visible.");
assert(handling.requiredCrew === result.requiredCrew, "Expected handling contract to expose required crew from items.");
assert(handling.rows.length === result.items.length, "Expected handling contract to expose each calculated item.");
assert(handling.status === "Review Required", "Expected heavy baseline items to require handling review.");
assert(fit.volumeFit === true && fit.payloadFit === true, "Expected capacity fit outputs from calculation contract.");
assert(fit.dimensionalFit === "not_available" && fit.doorOpeningFit === "not_available", "Expected body fit fields to remain unavailable.");
assert(
  presentation.warnings.some((warning) => warning.id.includes("ZIP-EXCLUDED")),
  "Expected frozen stored ZIP coverage metadata to drive estimate warning review.",
);
assert(trace.some((row) => row.formulaId === "PICK-007" && row.result > 0), "Expected pickup AS-IS trace row.");
assert(
  trace.some((row) => row.formulaId === "DEL-007" && row.formula === "Delivery Mileage + Delivery Labor + Delivery Handling + Management Fee + Dispatch Fee"),
  "Expected Formula Trace to use the masterdata delivery formula.",
);
assert(trace.some((row) => row.formulaId === "FINAL-014" && row.result === result.totals.finalPrice), "Expected final price trace row.");
assert(
  trace.some((row) => row.formulaId === "TBE-CAP-001" && row.status === "Contract only / No price impact"),
  "Expected capacity trace to come from calculation contract.",
);
assert(
  trace.some((row) => row.formulaId === "TBE-FEE-002" && row.status === "Implemented / Formula Sprint"),
  "Expected FVP Formula Sprint trace row.",
);
assert(
  trace.some((row) => row.formulaId === "FIT-001-DIMENSIONAL-FIT" && row.result === "not_available"),
  "Expected dimensional fit trace to remain explicitly unavailable.",
);

const html = fs.readFileSync("breakdown.html", "utf8");
const breakdownJs = fs.readFileSync("js/breakdown.js", "utf8");
[
  "Capacity Analysis",
  "Item Handling and Crew Feasibility",
  "Warning and Readiness Details",
  "Vehicle Fit Details",
  "Formula Trace",
  "bdRouteStageNote",
].forEach((label) => assert(html.includes(label), `Expected Cost Breakdown UI to include ${label}.`));
assert(html.includes("js/costBreakdownAnalysis.js"), "Expected Cost Breakdown analysis adapter.");
assert(breakdownJs.includes("stageReconciliation"), "Expected stage reconciliation rendering.");
assert(breakdownJs.includes("renderFormulaTrace"), "Expected Formula Trace rendering.");
assert(breakdownJs.includes("traceFormula"), "Expected Formula Trace to render calculation logic.");
assert(html.includes("Calculation Logic"), "Expected Formula Trace calculation logic column.");
assert(breakdownJs.includes("renderItemHandling"), "Expected Item Handling rendering.");
assert(breakdownJs.includes("traceObjectResult"), "Expected Formula Trace object values to use business-friendly formatting.");
assert(!breakdownJs.includes("JSON.stringify(row.result)"), "Formula Trace must not render raw JSON objects.");

console.log(JSON.stringify({
  status: "passed",
  stageTotal: reconciliation.stageTotal,
  routeCost: reconciliation.routeCost,
  routeDelta: reconciliation.routeDelta,
  nonRouteOperationalCost: reconciliation.nonRouteOperationalCost,
  operationalStageTotal: reconciliation.operationalStageTotal,
  operationalCost: reconciliation.operationalCost,
  operationalDelta: reconciliation.operationalDelta,
  readiness: presentation.readiness.label,
  capacitySelectedVehicle: capacity.selectedVehicle,
  availableCapacityFields: [
    capacity.shipmentDensity,
    capacity.vehicleDensityThreshold,
    capacity.volumeUtilization,
    capacity.payloadUtilization,
    capacity.limitingFactor,
    capacity.selectedCostBasis,
  ].filter((value) => value !== "Not available").length,
  traceRows: trace.length,
}, null, 2));
