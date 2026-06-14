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
quote.access.pickup = {
  ...quote.access.pickup,
  addressType: "Warehouse",
  floor: 5,
  elevatorAvailable: false,
  elevatorUnavailable: false,
  narrowAccess: false,
  longCarryFt: 0,
};
quote.access.delivery = {
  ...quote.access.delivery,
  addressType: "Apartments",
  floor: 4,
  elevatorAvailable: true,
  elevatorUnavailable: false,
  narrowAccess: false,
  longCarryFt: 0,
};
quote.options.pickupDirect = true;
quote.options.pickupDirectDate = "2026-06-20";
quote.options.deliveryDirect = false;
quote.options.deliveryDirectDate = "";
quote.items[0].unitMode = "ft";
quote.items[0].protectionPlan = "FVP";
quote.items[0].protectionLegacyType = "Full Coverage";
quote.items[0].insurance = "Full Coverage";
quote.items[0].declaredValue = 1200;

assert(context.window.CalculatorStorage.save(quote), "Expected draft save to succeed.");
const savedDraft = context.window.CalculatorStorage.load();
assert(savedDraft?.localId, "Expected saved draft to receive a localId.");
assert(savedDraft.customer.leadName === "Workflow QA Smoke", "Expected saved draft lead name to round-trip.");
assert(savedDraft.access.pickup.addressType === "Warehouse", "Expected pickup address type to round-trip.");
assert(savedDraft.access.delivery.addressType === "Apartments", "Expected delivery address type to round-trip.");
assert(savedDraft.access.pickup.floor === 5, "Expected pickup floor to round-trip.");
assert(savedDraft.access.delivery.elevatorAvailable === true, "Expected delivery elevatorAvailable to round-trip.");
assert(savedDraft.options.pickupDirect === true, "Expected pickupDirect to round-trip.");
assert(savedDraft.options.pickupDirectDate === "2026-06-20", "Expected pickupDirectDate to round-trip.");
assert(savedDraft.options.deliveryDirect === false, "Expected deliveryDirect to round-trip.");
assert(savedDraft.items[0].unitMode === "ft", "Expected item unitMode to round-trip.");
assert(savedDraft.items[0].protectionPlan === "FVP", "Expected protectionPlan to round-trip.");

const result = context.window.PricingCalculator.calculateQuote(savedDraft);
assert(result.totals.finalPrice > 0, "Expected workflow quote to calculate a positive total.");
assert(savedDraft.options.deliveryDirect !== true, "Expected Direct to remain manual and not auto-enable.");
assert(result.items[0].protectionPlan === "FVP", "Expected calculated item to expose FVP protection plan.");
assert(result.items[0].protectionLegacyType === "Full Coverage", "Expected FVP to preserve Full Coverage compatibility.");
assert(result.stageBreakdown?.pickup?.total > 0, "Expected pickup stage cost breakdown.");
assert(result.stageBreakdown?.interstate?.total > 0, "Expected interstate stage cost breakdown.");
assert(result.stageBreakdown?.delivery?.total > 0, "Expected delivery stage cost breakdown.");
const stageCostTotal = result.stageBreakdown.pickup.total + result.stageBreakdown.interstate.total + result.stageBreakdown.delivery.total;
assert(
  Math.abs(stageCostTotal - result.totals.routeCost) <= 1,
  "Expected stage costs to add up to route cost.",
);

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

const quoteDraftHtml = fs.readFileSync("index.html", "utf8");
const quoteDraftUi = fs.readFileSync("js/ui.js", "utf8");
const breakdownHtml = fs.readFileSync("breakdown.html", "utf8");
const estimateDocumentHtml = fs.readFileSync("estimate-document.html", "utf8");
const estimateDocumentJs = fs.readFileSync("js/estimateDocument.js", "utf8");
const estimatesJs = fs.readFileSync("js/estimates.js", "utf8");
const draftsHtml = fs.readFileSync("drafts.html", "utf8");
const draftsJs = fs.readFileSync("js/drafts.js", "utf8");
const quickQuoteHtml = fs.readFileSync("quick-quote.html", "utf8");
const quickQuoteJs = fs.readFileSync("js/quickQuote.js", "utf8");
const itemCatalogJs = fs.readFileSync("js/itemCatalog.js", "utf8");
const referencesHtml = fs.readFileSync("references.html", "utf8");
assert(quoteDraftHtml.includes("Direct Pickup"), "Expected Direct Pickup capture in Quote Draft.");
assert(quoteDraftHtml.includes("Direct Delivery"), "Expected Direct Delivery capture in Quote Draft.");
assert(quoteDraftHtml.includes("Elevator available"), "Expected elevatorAvailable capture in Quote Draft.");
assert(quoteDraftUi.includes("Protection Plan"), "Expected broker-facing Protection Plan label in Quote Draft.");
assert(quoteDraftUi.includes('protectionButton("RV"'), "Expected RV quick protection option.");
assert(quoteDraftUi.includes('protectionButton("FVP"'), "Expected FVP quick protection option.");
assert(quoteDraftUi.includes('protectionButton("DV"'), "Expected DV quick protection option.");
assert(!quoteDraftHtml.includes(">Narrow<"), "Expected broker-facing Narrow control to be hidden.");
assert(!quoteDraftHtml.includes("Long carry, ft"), "Expected broker-facing Long Carry control to be hidden.");
assert(!quoteDraftHtml.includes("Bubble Protection</option>"), "Expected Bubble Protection not to be hardcoded as broker-facing option.");
assert(breakdownHtml.includes("Route Stage Visibility"), "Expected Cost Breakdown to include route stage visibility.");
assert(breakdownHtml.includes("No formula change"), "Expected route stage visibility to be marked as no formula change.");
assert(estimateDocumentHtml.includes("Protection Plans & Liability"), "Expected customer estimate document to use Protection Plans language.");
assert(!estimateDocumentHtml.includes("Operational Cost"), "Expected customer estimate document not to expose Operational Cost.");
assert(!estimateDocumentHtml.includes("Margin"), "Expected customer estimate document not to expose Margin.");
assert(estimateDocumentJs.includes("selectedProtectionPlan"), "Expected estimate document to derive protection selection from selected plan.");
assert(estimatesJs.includes("Preview HTML/PDF"), "Expected My Estimates to expose customer document preview action.");
assert(estimatesJs.includes("breakdown.html?estimateId="), "Expected My Estimates to expose internal breakdown action.");
assert(!estimatesJs.includes("orders.html?estimateId="), "Expected My Estimates not to expose unsupported Order action.");
assert(!estimatesJs.includes("ebol.html?estimateId="), "Expected My Estimates not to expose unsupported eBOL action.");
assert(!estimatesJs.includes("data-convert-invoice"), "Expected My Estimates not to expose unsupported invoice conversion action.");
assert(draftsHtml.includes("draftSearch"), "Expected My Drafts to expose working search control.");
assert(draftsHtml.includes("draftStatusFilter"), "Expected My Drafts to expose working status filter.");
assert(draftsJs.includes("Continue Quote"), "Expected My Drafts primary action to continue quote.");
assert(draftsJs.includes("Review Cost"), "Expected My Drafts to expose live draft cost review.");
assert(draftsJs.includes("Missing Route"), "Expected My Drafts to classify incomplete route drafts.");
assert(quickQuoteHtml.includes("js/itemCatalog.js"), "Expected Quick Quote to load References Item Catalog source.");
assert(quickQuoteJs.includes("ReferenceItemCatalog"), "Expected Quick Quote templates to come from References Item Catalog.");
assert(quickQuoteJs.includes("Catalog Item"), "Expected Quick Quote item selector to be labeled as Catalog Item.");
assert(quickQuoteJs.includes("pickupDirect"), "Expected Quick Quote transfer to preserve Direct fields for Full Quote.");
assert(quickQuoteJs.includes("elevatorAvailable"), "Expected Quick Quote transfer to preserve elevator availability defaults.");
assert(itemCatalogJs.includes("Dining Table") && itemCatalogJs.includes("TV / Monitor"), "Expected Item Catalog source to include reference furniture/electronics templates.");
assert(referencesHtml.includes("js/itemCatalog.js"), "Expected References to use the shared Item Catalog source.");
assert(referencesHtml.includes("js/referencesItemCatalog.js"), "Expected References Item Catalog table to render from shared source.");

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
