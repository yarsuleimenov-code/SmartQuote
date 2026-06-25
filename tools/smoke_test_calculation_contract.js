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
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const localStorage = createLocalStorage();
const context = { window: { localStorage }, localStorage, console };
context.window.window = context.window;
vm.createContext(context);

[
  "js/zoneZipMap.js",
  "js/variables.js",
  "js/pricingConfig.js",
  "js/mockData.js",
  "js/calculator.js",
].forEach((file) => vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file }));

const quote = clone(context.window.CalculatorMockData);
const baseline = context.window.PricingCalculator.calculateQuote(quote);

vm.runInContext(fs.readFileSync("js/calculationContract.js", "utf8"), context, {
  filename: "js/calculationContract.js",
});

const contracted = context.window.PricingCalculator.calculateQuote(quote);
const blankQuote = clone(context.window.CalculatorBlankQuote);
const blankResult = context.window.PricingCalculator.calculateQuote(blankQuote);
const contract = contracted.calculationContract;

assert(contracted.totals.finalPrice === baseline.totals.finalPrice, "Contract must not change final price.");
assert(contracted.totals.operationalCost === baseline.totals.operationalCost, "Contract must not change operational cost.");
assert(contracted.totals.rawPrice === baseline.totals.rawPrice, "Contract must not change raw price.");
assert(contract?.contractVersion === "smartquote-calculation-v1", "Expected calculation contract version.");
assert(contract?.traceVersion === "normalized-formula-trace-v1", "Expected trace version.");
assert(contract?.formulaVersion === context.window.CalculatorVariables.formulaVersion, "Expected formula version.");
assert(contract?.variablesVersion === context.window.CalculatorVariables.variablesVersion, "Expected variables version.");
assert(contract?.normalizedInput?.route?.pickupZip === String(quote.route.pickupZip), "Expected normalized route input.");
assert(contract?.trace?.some((row) => row.formulaId === "FINAL-014" && row.value === baseline.totals.finalPrice), "Expected final price trace.");
assert(contract?.trace?.every((row) => row.formulaId && row.outputPath), "Expected normalized trace rows.");
assert(blankResult.totals.finalPrice === 0, "Blank quote must remain zero.");
assert(blankResult.calculationContract?.trace?.length > 0, "Blank quote should still have an auditable trace.");

console.log(JSON.stringify({
  status: "passed",
  contractVersion: contract.contractVersion,
  traceVersion: contract.traceVersion,
  formulaVersion: contract.formulaVersion,
  variablesVersion: contract.variablesVersion,
  traceRows: contract.trace.length,
  baselineFinalPrice: baseline.totals.finalPrice,
  contractedFinalPrice: contracted.totals.finalPrice,
  blankFinalPrice: blankResult.totals.finalPrice,
}, null, 2));
