const fs = require("fs");
const vm = require("vm");

function createLocalStorage() {
  const store = new Map();
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

const localStorage = createLocalStorage();
const context = {
  window: { localStorage },
  console,
};
context.window.window = context.window;
context.localStorage = localStorage;
vm.createContext(context);

[
  "js/zoneZipMap.js",
  "js/variables.js",
  "js/pricingConfig.js",
  "js/mockData.js",
  "js/calculator.js",
].forEach((file) => {
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
});

const requiredBuckets = [
  "currentVariables",
  "variablesVersions",
  "vehicles",
  "fuelPrices",
  "drafts",
  "estimates",
  "calculationLogs",
];

for (const bucket of requiredBuckets) {
  if (!localStorage.getItem(bucket)) {
    throw new Error(`Expected localStorage bucket ${bucket} to be initialized.`);
  }
}

const currentVariables = JSON.parse(localStorage.getItem("currentVariables"));
const versions = JSON.parse(localStorage.getItem("variablesVersions"));
const vehicles = JSON.parse(localStorage.getItem("vehicles"));
const fuelPrices = JSON.parse(localStorage.getItem("fuelPrices"));

if (currentVariables.formulaVersion !== "formula-sprint-fvp-v1") {
  throw new Error(`Unexpected formulaVersion ${currentVariables.formulaVersion}.`);
}

if (currentVariables.variablesVersion !== "baseline-2026-06-02") {
  throw new Error(`Unexpected variablesVersion ${currentVariables.variablesVersion}.`);
}

if (!Array.isArray(versions) || versions.length !== 1 || versions[0].status !== "baseline") {
  throw new Error("Expected exactly one baseline variables version.");
}

if (!Array.isArray(vehicles) || vehicles.length < 1) {
  throw new Error("Expected baseline vehicles to be stored.");
}

if (!Array.isArray(fuelPrices) || fuelPrices.length !== 2) {
  throw new Error("Expected Regular and Diesel fuel price baseline records.");
}

const quote = JSON.parse(JSON.stringify(context.window.CalculatorMockData));
const result = context.window.PricingCalculator.calculateQuote(quote);

if (result.totals.finalPrice !== 1460) {
  throw new Error(`Expected baseline demo final price to remain 1460, got ${result.totals.finalPrice}.`);
}

console.log(JSON.stringify({
  formulaVersion: currentVariables.formulaVersion,
  variablesVersion: currentVariables.variablesVersion,
  buckets: requiredBuckets,
  baselineVehicleCount: vehicles.length,
  baselineFuelTypes: fuelPrices.map((fuel) => fuel.fuelType),
  demoFinalPrice: result.totals.finalPrice,
}, null, 2));
