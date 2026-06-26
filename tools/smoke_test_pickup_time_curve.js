const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "js", "variables.js"), "utf8"), context);

const settings = context.window.CalculatorVariables.settings;

function pickupMinutes(volume) {
  if (volume < settings.loadingVolumeThresholdCuFt) {
    return (settings.loadingFormulaA * volume) / (settings.loadingFormulaB + volume);
  }
  return settings.loadingThresholdMinutes + 0.5 * (volume - settings.loadingVolumeThresholdCuFt);
}

function assertClose(actual, expected, label) {
  if (Math.abs(actual - expected) > 0.01) {
    throw new Error(`${label}: expected ${expected}, got ${actual}.`);
  }
}

assertClose(pickupMinutes(35), 40, "35 cu ft anchor");
assertClose(pickupMinutes(80), 73.13, "80 cu ft transition");
assertClose(pickupMinutes(120), 93.13, "120 cu ft control point");
assertClose(pickupMinutes(488), 277.13, "488 cu ft control point");

console.log(JSON.stringify({
  status: "passed",
  points: [35, 80, 120, 488].map((volume) => ({ volume, minutes: Math.round(pickupMinutes(volume) * 100) / 100 })),
}));
