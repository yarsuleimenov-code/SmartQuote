const fs = require("fs");
const vm = require("vm");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const context = { window: {}, console };
context.window.window = context.window;
vm.createContext(context);

[
  "js/zoneZipMap.js",
  "js/variables.js",
  "js/pricingConfig.js",
  "js/mockData.js",
  "js/calculator.js",
  "js/calculationContract.js",
].forEach((file) => {
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
});

function item({ id, protectionPlan, insurance, declaredValue, itemReferencePrice } = {}) {
  return {
    id: id || "fvp-item",
    name: "Protection test item",
    length: 24,
    width: 24,
    height: 24,
    weight: 20,
    qty: 1,
    packaging: "None",
    insurance,
    protectionPlan,
    declaredValue,
    itemReferencePrice,
    storageDays: 0,
    fragile: false,
    nonStackable: false,
    crated: false,
    comment: "",
  };
}

function quote(items) {
  const source = clone(context.window.CalculatorMockData);
  source.items = items;
  return source;
}

const blank = context.window.PricingCalculator.calculateQuote(clone(context.window.CalculatorBlankQuote));
assert(blank.totals.finalPrice === 0, "FVP-001: blank quote must remain zero.");

const rv = context.window.PricingCalculator.calculateQuote(quote([
  item({ id: "rv", protectionPlan: "RV", insurance: "Basic Liability", declaredValue: 1000 }),
]));
assert(rv.totals.insurance === 0, "FVP-002: RV-only order must have no protection charge.");

const oneFvp = context.window.PricingCalculator.calculateQuote(quote([
  item({ id: "fvp-one", protectionPlan: "FVP", insurance: "Full Coverage", declaredValue: 1000 }),
]));
assert(oneFvp.totals.insurance === 40, "FVP-003: one FVP item must cost $40 at the active test rate.");
assert(oneFvp.totals.fvpFixedFee === 15, "FVP-003: one FVP item must include the fixed fee once.");

const multiFvpQuote = quote([
  item({ id: "fvp-a", protectionPlan: "FVP", insurance: "Full Coverage", declaredValue: 1000 }),
  item({ id: "fvp-b", protectionPlan: "FVP", insurance: "Full Coverage", declaredValue: 500 }),
]);
const multiFvp = context.window.PricingCalculator.calculateQuote(multiFvpQuote);
assert(multiFvp.totals.insurance === 52.5, "FVP-004: two FVP items must apply one $15 fixed fee.");
assert(multiFvp.totals.fvpItemCount === 2, "FVP-004: expected two FVP items.");
assert(multiFvp.totals.fvpDeclaredValue === 1500, "FVP-004: expected summed FVP declared value.");
assert(multiFvp.totals.fvpVariableCost === 37.5, "FVP-004: expected variable FVP cost.");
assert(multiFvp.totals.fvpFixedFee === 15, "FVP-004: fixed fee must be charged once per order.");

const mixed = context.window.PricingCalculator.calculateQuote(quote([
  item({ id: "fvp-mixed", protectionPlan: "FVP", insurance: "Full Coverage", declaredValue: 1000 }),
  item({ id: "rv-mixed", protectionPlan: "RV", insurance: "Basic Liability", declaredValue: 10000 }),
]));
assert(mixed.totals.insurance === 40, "FVP-005: RV declared value must not change FVP protection cost.");

const dv = context.window.PricingCalculator.calculateQuote(quote([
  item({ id: "dv", protectionPlan: "DV", insurance: "Basic Liability", declaredValue: 10000, itemReferencePrice: 99999 }),
]));
assert(dv.totals.insurance === 0, "FVP-006: DV and Item Ref. Price must not create protection cost.");

const legacy = context.window.PricingCalculator.calculateQuote(quote([
  item({ id: "legacy", insurance: "Full Coverage", declaredValue: 1000 }),
]));
assert(legacy.items[0].protectionPlan === "FVP", "FVP-008: legacy Full Coverage must map to FVP.");
assert(legacy.totals.insurance === 40, "FVP-008: legacy Full Coverage must retain FVP pricing.");

const contracted = context.window.PricingCalculator.calculateQuote(multiFvpQuote);
const fvpTrace = contracted.calculationContract.trace.find((row) => row.formulaId === "TBE-FEE-002");
assert(contracted.calculationContract.formulaVersion === "formula-sprint-fvp-v1", "Expected new Formula Sprint formula version.");
assert(fvpTrace?.status === "Implemented / Formula Sprint", "Expected implemented FVP trace row.");
assert(fvpTrace?.value?.totalCost === 52.5, "Expected FVP trace total to match protection cost.");

const frozenSnapshot = clone({
  formulaVersion: contracted.calculationContract.formulaVersion,
  result: contracted,
});
context.window.CalculatorVariables.protectionPlans["Full Coverage"].rate = 0.1;
const recalculated = context.window.PricingCalculator.calculateQuote(multiFvpQuote);
assert(frozenSnapshot.result.totals.insurance === 52.5, "FVP-007: frozen snapshot must retain original protection cost.");
assert(frozenSnapshot.formulaVersion === "formula-sprint-fvp-v1", "FVP-007: frozen snapshot must retain Formula Sprint version.");
assert(recalculated.totals.insurance === 165, "FVP-007: live draft may recalculate with changed runtime rates.");

console.log(JSON.stringify({
  status: "passed",
  formulaVersion: contracted.calculationContract.formulaVersion,
  blankProtection: blank.totals.insurance,
  oneFvpProtection: oneFvp.totals.insurance,
  multiFvpProtection: multiFvp.totals.insurance,
  dvProtection: dv.totals.insurance,
  frozenProtection: frozenSnapshot.result.totals.insurance,
  recalculatedProtection: recalculated.totals.insurance,
}, null, 2));
