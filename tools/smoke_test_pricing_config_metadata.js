const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const storage = new Map([
  ["zaberman-pricing-config", JSON.stringify({ formulaVersion: "excel-derived-v0.1", settings: { marginRate: 0.31 } })],
]);
const context = {
  window: {
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
      removeItem(key) { storage.delete(key); },
    },
  },
};

vm.runInNewContext(fs.readFileSync(path.join(root, "js", "variables.js"), "utf8"), context);
vm.runInNewContext(fs.readFileSync(path.join(root, "js", "pricingConfig.js"), "utf8"), context);

if (context.window.CalculatorVariables.formulaVersion !== "formula-sprint-fvp-v1") {
  throw new Error(`Expected deployed formula version, got ${context.window.CalculatorVariables.formulaVersion}.`);
}
if (context.window.CalculatorVariables.settings.marginRate !== 0.31) {
  throw new Error("Saved pricing values must remain active while formula metadata is migrated.");
}
if (context.window.CalculatorVariables.settings.brokerCommissionRate !== 0.04) {
  throw new Error("Broker commission rate must default to 4%.");
}
if (context.window.CalculatorVariables.settings.directFixedFee !== 300) {
  throw new Error("Direct fixed fee must default to $300.");
}
if (context.window.CalculatorVariables.settings.pickupTimeCoefficients !== 1 || context.window.CalculatorVariables.settings.deliveryTimeCoefficients !== 0.8) {
  throw new Error("Pickup and delivery time coefficients must default to 1.0 and 0.8.");
}
if (context.window.CalculatorVariables.settings.freeFloorCount !== 3) {
  throw new Error("Free floor count must default to 3.");
}
if (context.window.CalculatorVariables.settings.coiFee !== 35) {
  throw new Error("COI fee must default to $35.");
}

console.log(JSON.stringify({
  status: "passed",
  formulaVersion: context.window.CalculatorVariables.formulaVersion,
  marginRate: context.window.CalculatorVariables.settings.marginRate,
  brokerCommissionRate: context.window.CalculatorVariables.settings.brokerCommissionRate,
  directFixedFee: context.window.CalculatorVariables.settings.directFixedFee,
  pickupTimeCoefficients: context.window.CalculatorVariables.settings.pickupTimeCoefficients,
  deliveryTimeCoefficients: context.window.CalculatorVariables.settings.deliveryTimeCoefficients,
  freeFloorCount: context.window.CalculatorVariables.settings.freeFloorCount,
  coiFee: context.window.CalculatorVariables.settings.coiFee,
}));
