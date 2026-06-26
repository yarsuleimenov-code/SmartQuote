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

console.log(JSON.stringify({
  status: "passed",
  formulaVersion: context.window.CalculatorVariables.formulaVersion,
  marginRate: context.window.CalculatorVariables.settings.marginRate,
}));
