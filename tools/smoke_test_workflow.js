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
    keys() {
      return Array.from(store.keys());
    },
  };
}

function loadContext(seed) {
  const localStorage = createLocalStorage(seed);
  const context = {
    window: { localStorage },
    console,
    localStorage,
  };
  context.window.window = context.window;
  vm.createContext(context);

  [
    "js/zoneZipMap.js",
    "js/variables.js",
    "js/pricingConfig.js",
    "js/mockData.js",
    "js/calculator.js",
    "js/storage.js",
  ].forEach((file) => {
    vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  });

  return { context, localStorage };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function verifyStaticNavigation() {
  const pages = [
    "quick-quote.html",
    "index.html",
    "estimate-document.html",
    "breakdown.html",
    "drafts.html",
    "estimates.html",
    "references.html",
    "variables.html",
  ];
  const missingPages = pages.filter((page) => !fs.existsSync(page));
  assert(missingPages.length === 0, `Missing workflow page(s): ${missingPages.join(", ")}`);

  const checkedFiles = fs.readdirSync(".").filter((file) => file.endsWith(".html"));
  const missingRefs = [];
  const localRefPattern = /\b(?:href|src)=["']([^"']+)["']/g;

  for (const file of checkedFiles) {
    const html = fs.readFileSync(file, "utf8");
    for (const match of html.matchAll(localRefPattern)) {
      const ref = match[1];
      if (
        ref.startsWith("http") ||
        ref.startsWith("mailto:") ||
        ref.startsWith("tel:") ||
        ref.startsWith("#") ||
        ref.startsWith("data:") ||
        ref.startsWith("/api/")
      ) {
        continue;
      }
      const path = ref.split("?")[0].split("#")[0].replace(/^\/+/, "");
      if (!path || path === "/") continue;
      if (!fs.existsSync(path)) missingRefs.push(`${file} -> ${ref}`);
    }
  }

  assert(missingRefs.length === 0, `Missing local href/src reference(s): ${missingRefs.join(", ")}`);
  return { pages, checkedFiles: checkedFiles.length };
}

function buildEstimateSnapshot(context, quote, result) {
  const createdAt = new Date().toISOString();
  return {
    snapshotVersion: 1,
    formulaVersion: context.window.CalculatorVariables.formulaVersion,
    variablesSnapshot: context.window.PricingConfig.snapshot(),
    createdAt,
    validUntil: new Date(Date.parse(createdAt) + 14 * 24 * 60 * 60 * 1000).toISOString(),
    estimateId: quote.estimateId,
    status: "workflow-smoke-generated",
    quote: clone(quote),
    result: clone(result),
  };
}

const navigation = verifyStaticNavigation();

const { context, localStorage } = loadContext({
  "zaberman-calculator-drafts": "not valid json",
  "zaberman-estimate-snapshots": "not valid json",
});

const quote = clone(context.window.CalculatorMockData);
quote.estimateId = "EST-WF";
quote.customer.leadName = "Workflow QA Smoke";

assert(context.window.CalculatorStorage.save(quote), "Expected draft save to succeed.");
const savedDraft = context.window.CalculatorStorage.load();
assert(savedDraft?.localId, "Expected saved draft to receive a localId.");
assert(savedDraft.customer.leadName === "Workflow QA Smoke", "Expected saved draft lead name to round-trip.");

const result = context.window.PricingCalculator.calculateQuote(savedDraft);
assert(result.totals.finalPrice > 0, "Expected workflow quote to calculate a positive total.");

assert(
  context.window.CalculatorStorage.saveEstimateSnapshot(buildEstimateSnapshot(context, savedDraft, result)),
  "Expected estimate snapshot save to succeed.",
);
const savedEstimate = context.window.CalculatorStorage.loadEstimateSnapshot();

assert(savedEstimate?.snapshotId, "Expected generated estimate snapshotId.");
assert(savedEstimate.formulaVersion === "excel-derived-v0.1", "Expected estimate formulaVersion.");
assert(savedEstimate.variablesVersion === "baseline-2026-06-02", "Expected estimate variablesVersion.");
assert(savedEstimate.variablesSnapshot?.variablesVersion === "baseline-2026-06-02", "Expected variablesSnapshot.");
assert(savedEstimate.calculationTimestamp, "Expected calculationTimestamp.");
assert(savedEstimate.sourceDraftId === savedDraft.localId, "Expected sourceDraftId to point to saved draft.");
assert(Array.isArray(savedEstimate.fuelPricesUsed) && savedEstimate.fuelPricesUsed.length >= 2, "Expected fuelPricesUsed.");
assert(savedEstimate.vehicleUsed?.name || savedEstimate.vehicleUsed?.vehicleName, "Expected vehicleUsed.");
assert(savedEstimate.totalPrice === result.totals.finalPrice, "Expected totalPrice to match calculation.");
assert(savedEstimate.result.totals.finalPrice === result.totals.finalPrice, "Expected frozen result total.");

const listedEstimates = context.window.CalculatorStorage.listEstimateSnapshots();
assert(listedEstimates.length === 1, "Expected one generated estimate in list.");

const blankContext = loadContext().context;
const blankResult = blankContext.window.PricingCalculator.calculateQuote(clone(blankContext.window.CalculatorBlankQuote));
assert(blankResult.totals.finalPrice === 0, "Expected empty quote to remain $0.");

console.log(JSON.stringify({
  draftId: savedDraft.localId,
  estimateId: savedEstimate.estimateId,
  snapshotId: savedEstimate.snapshotId,
  formulaVersion: savedEstimate.formulaVersion,
  variablesVersion: savedEstimate.variablesVersion,
  hasVariablesSnapshot: Boolean(savedEstimate.variablesSnapshot),
  hasCalculationTimestamp: Boolean(savedEstimate.calculationTimestamp),
  sourceDraftId: savedEstimate.sourceDraftId,
  fuelTypesUsed: savedEstimate.fuelPricesUsed.map((fuel) => fuel.fuelType),
  vehicleUsed: savedEstimate.vehicleUsed.name || savedEstimate.vehicleUsed.vehicleName,
  totalPrice: savedEstimate.totalPrice,
  blankFinalPrice: blankResult.totals.finalPrice,
  navigation,
  storageKeys: localStorage.keys().sort(),
}, null, 2));
