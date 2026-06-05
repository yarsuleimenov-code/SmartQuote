const fs = require("fs");
const vm = require("vm");

const storageData = {};
const context = {
  window: {},
  console,
  localStorage: {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(storageData, key) ? storageData[key] : null;
    },
    setItem(key, value) {
      storageData[key] = String(value);
    },
    removeItem(key) {
      delete storageData[key];
    },
  },
};
context.window.window = context.window;
context.window.localStorage = context.localStorage;
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function buildSnapshot(quote, result) {
  return {
    snapshotVersion: 1,
    formulaVersion: context.window.CalculatorVariables?.formulaVersion || "unknown",
    variablesSnapshot: context.window.PricingConfig?.snapshot?.() || null,
    createdAt: "2026-06-05T00:00:00.000Z",
    validUntil: "2026-06-19T00:00:00.000Z",
    estimateId: quote.estimateId || "ES-TEST",
    status: "generated",
    extraLaborPeople: result.totals.extraLaborPeople,
    extraLaborHours: result.totals.extraLaborHours,
    extraLaborRate: result.totals.extraLaborRate,
    extraLaborCost: result.totals.extraLaborCost,
    effectiveCostPerCuFt: result.totals.effectiveCostPerCuFt,
    quote,
    result,
  };
}

const blankQuote = clone(context.window.CalculatorBlankQuote);
blankQuote.options.extraLaborPeople = 2;
blankQuote.options.extraLaborHours = 2;
blankQuote.options.extraLaborRate = 50;
const blankResult = context.window.PricingCalculator.calculateQuote(blankQuote);
assert(blankResult.totals.finalPrice === 0, `Expected blank quote to remain $0, got ${blankResult.totals.finalPrice}.`);
assert(blankResult.totals.extraLaborCost === 0, `Expected blank quote extra labor to apply as $0, got ${blankResult.totals.extraLaborCost}.`);

const baseQuote = clone(context.window.CalculatorMockData);
baseQuote.options.extraLaborPeople = 0;
baseQuote.options.extraLaborHours = 0;
baseQuote.options.extraLaborRate = 50;
const baseResult = context.window.PricingCalculator.calculateQuote(baseQuote);

const laborQuote = clone(baseQuote);
laborQuote.options.extraLaborPeople = 2;
laborQuote.options.extraLaborHours = 2;
laborQuote.options.extraLaborRate = 50;
const laborResult = context.window.PricingCalculator.calculateQuote(laborQuote);
assert(laborResult.totals.extraLaborCost === 200, `Expected 2 x 2 x $50 to equal $200, got ${laborResult.totals.extraLaborCost}.`);
assert(laborResult.totals.finalPrice - baseResult.totals.finalPrice === 200, `Expected final price to increase by $200, got ${laborResult.totals.finalPrice - baseResult.totals.finalPrice}.`);

const zeroPeopleQuote = clone(baseQuote);
zeroPeopleQuote.options.extraLaborPeople = 0;
zeroPeopleQuote.options.extraLaborHours = 2;
zeroPeopleQuote.options.extraLaborRate = 50;
const zeroPeopleResult = context.window.PricingCalculator.calculateQuote(zeroPeopleQuote);
assert(zeroPeopleResult.totals.extraLaborCost === 0, `Expected 0 people to add $0, got ${zeroPeopleResult.totals.extraLaborCost}.`);
assert(zeroPeopleResult.totals.finalPrice === baseResult.totals.finalPrice, "Expected 0 people to leave final price unchanged.");

const zeroHoursQuote = clone(baseQuote);
zeroHoursQuote.options.extraLaborPeople = 2;
zeroHoursQuote.options.extraLaborHours = 0;
zeroHoursQuote.options.extraLaborRate = 50;
const zeroHoursResult = context.window.PricingCalculator.calculateQuote(zeroHoursQuote);
assert(zeroHoursResult.totals.extraLaborCost === 0, `Expected 0 hours to add $0, got ${zeroHoursResult.totals.extraLaborCost}.`);
assert(zeroHoursResult.totals.finalPrice === baseResult.totals.finalPrice, "Expected 0 hours to leave final price unchanged.");

const refPriceQuote = clone(baseQuote);
const refPriceResult = context.window.PricingCalculator.calculateQuote(refPriceQuote);
assert(refPriceResult.totals.finalPrice === baseResult.totals.finalPrice, "Expected Item Reference Price to be calculated without changing total.");

const singleItemQuote = clone(baseQuote);
singleItemQuote.items = [singleItemQuote.items[0]];
const singleItemResult = context.window.PricingCalculator.calculateQuote(singleItemQuote);
assert(singleItemResult.items[0].itemReferencePrice === singleItemResult.totals.finalPrice, "Expected one item reference price to equal the full quote amount.");
assert(singleItemResult.items[0].itemReferenceAllocationMethod === "weight", "Expected one weighted item to use weight allocation.");

const weightAllocationQuote = clone(context.window.CalculatorBlankQuote);
weightAllocationQuote.route = { pickupZip: "11211", deliveryZip: "90021", pickupAddress: "", deliveryAddress: "" };
weightAllocationQuote.items = [
  { id: "weight-a", name: "Weight A", length: 12, width: 12, height: 12, weight: 40, qty: 1, packaging: "None", insurance: "Basic Liability", declaredValue: 0, storageDays: 0, fragile: false, nonStackable: false, crated: false, comment: "" },
  { id: "weight-b", name: "Weight B", length: 12, width: 12, height: 12, weight: 60, qty: 1, packaging: "None", insurance: "Basic Liability", declaredValue: 0, storageDays: 0, fragile: false, nonStackable: false, crated: false, comment: "" },
];
const weightAllocationResult = context.window.PricingCalculator.calculateQuote(weightAllocationQuote);
const expectedWeightA = Math.round((weightAllocationResult.totals.finalPrice * 0.4) * 100) / 100;
const expectedWeightB = Math.round((weightAllocationResult.totals.finalPrice * 0.6) * 100) / 100;
assert(weightAllocationResult.items[0].itemReferencePrice === expectedWeightA, `Expected weight item A allocation ${expectedWeightA}, got ${weightAllocationResult.items[0].itemReferencePrice}.`);
assert(weightAllocationResult.items[1].itemReferencePrice === expectedWeightB, `Expected weight item B allocation ${expectedWeightB}, got ${weightAllocationResult.items[1].itemReferencePrice}.`);
assert(weightAllocationResult.items.every((item) => item.itemReferenceAllocationMethod === "weight"), "Expected total weight > 0 to use weight allocation.");

const volumeFallbackQuote = clone(weightAllocationQuote);
volumeFallbackQuote.items = [
  { ...weightAllocationQuote.items[0], id: "volume-a", weight: 0, length: 12, width: 12, height: 12 },
  { ...weightAllocationQuote.items[1], id: "volume-b", weight: 0, length: 24, width: 12, height: 12 },
];
const volumeFallbackResult = context.window.PricingCalculator.calculateQuote(volumeFallbackQuote);
const expectedVolumeA = Math.round((volumeFallbackResult.totals.finalPrice * (1 / 3)) * 100) / 100;
const expectedVolumeB = Math.round((volumeFallbackResult.totals.finalPrice * (2 / 3)) * 100) / 100;
assert(volumeFallbackResult.items[0].itemReferencePrice === expectedVolumeA, `Expected volume fallback item A allocation ${expectedVolumeA}, got ${volumeFallbackResult.items[0].itemReferencePrice}.`);
assert(volumeFallbackResult.items[1].itemReferencePrice === expectedVolumeB, `Expected volume fallback item B allocation ${expectedVolumeB}, got ${volumeFallbackResult.items[1].itemReferencePrice}.`);
assert(volumeFallbackResult.items.every((item) => item.itemReferenceAllocationMethod === "effectiveVolume"), "Expected zero total weight to use effective volume allocation.");

const expectedEffectiveCost = Math.round((laborResult.totals.finalPrice / laborResult.totals.totalVolume) * 100) / 100;
assert(laborResult.totals.effectiveCostPerCuFt === expectedEffectiveCost, `Expected effective cost per cu ft ${expectedEffectiveCost}, got ${laborResult.totals.effectiveCostPerCuFt}.`);

const savedSnapshot = buildSnapshot(laborQuote, laborResult);
context.window.CalculatorStorage.saveEstimateSnapshot(savedSnapshot);
const loadedSnapshot = context.window.CalculatorStorage.loadEstimateSnapshot();
assert(loadedSnapshot.extraLaborPeople === 2, "Expected snapshot to contain extraLaborPeople.");
assert(loadedSnapshot.extraLaborHours === 2, "Expected snapshot to contain extraLaborHours.");
assert(loadedSnapshot.extraLaborRate === 50, "Expected snapshot to contain extraLaborRate.");
assert(loadedSnapshot.extraLaborCost === 200, "Expected snapshot to contain extraLaborCost.");
assert(loadedSnapshot.effectiveCostPerCuFt === expectedEffectiveCost, "Expected snapshot to contain effectiveCostPerCuFt.");

const quoteDraftHtml = fs.readFileSync("index.html", "utf8");
assert(!quoteDraftHtml.includes("Operational Cost"), "Expected broker-facing Quote Draft not to show Operational Cost.");
assert(!quoteDraftHtml.includes(">Margin<") && !quoteDraftHtml.includes("Margin $"), "Expected broker-facing Quote Draft not to show Margin.");

console.log(JSON.stringify({
  blankFinalPrice: blankResult.totals.finalPrice,
  baseFinalPrice: baseResult.totals.finalPrice,
  laborFinalPrice: laborResult.totals.finalPrice,
  extraLaborCost: laborResult.totals.extraLaborCost,
  effectiveCostPerCuFt: laborResult.totals.effectiveCostPerCuFt,
  weightAllocation: weightAllocationResult.items.map((item) => item.itemReferencePrice),
  volumeFallbackAllocation: volumeFallbackResult.items.map((item) => item.itemReferencePrice),
  singleItemReferencePrice: singleItemResult.items[0].itemReferencePrice,
  snapshotExtraLaborCost: loadedSnapshot.extraLaborCost,
}, null, 2));
