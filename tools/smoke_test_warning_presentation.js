const fs = require("fs");
const vm = require("vm");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const storage = new Map();
const localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
};
const context = { window: { localStorage } };
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync("js/coverageZipData.js", "utf8"), context, {
  filename: "js/coverageZipData.js",
});
vm.runInContext(fs.readFileSync("js/zipCoverage.js", "utf8"), context, {
  filename: "js/zipCoverage.js",
});
vm.runInContext(fs.readFileSync("js/warningPresentation.js", "utf8"), context, {
  filename: "js/warningPresentation.js",
});

const build = context.window.WarningPresentation.build;

const blank = build({
  quote: { route: { pickupZip: "", deliveryZip: "" } },
  result: { routeSupported: false, items: [], totals: { effectiveVolume: 0 } },
});
assert(blank.readiness.id === "review", "Blank quote should require review, not be blocked.");
assert(blank.warnings.some((entry) => entry.id === "WARN-UI-ROUTE-MISSING"), "Expected missing route warning.");
assert(blank.warnings.some((entry) => entry.id === "WARN-UI-ITEM-MISSING"), "Expected missing item warning.");

const unsupported = build({
  quote: { route: { pickupZip: "00000", deliveryZip: "99999" } },
  result: { routeSupported: false, items: [], totals: { effectiveVolume: 0 } },
});
assert(unsupported.readiness.id === "blocked", "Unsupported entered route should be blocked.");
assert(unsupported.blocksEstimate === true, "Unsupported route should carry blocking intent.");
assert(unsupported.enforcementEnabled === false, "Blocking enforcement must remain disabled before governance approval.");

const fvp = build({
  quote: { route: { pickupZip: "11211", deliveryZip: "90021" } },
  result: {
    routeSupported: true,
    items: [{
      id: "item-1",
      name: "Table",
      warning: "OK",
      protectionPlan: "FVP",
      declaredValue: 0,
    }],
    totals: { effectiveVolume: 20 },
  },
});
const fvpWarning = fvp.warnings.find((entry) => entry.id === "WARN-UI-FVP-VALUE-item-1");
assert(fvp.readiness.id === "blocked", "FVP without Declared Value should be blocked.");
assert(fvpWarning?.target === "item:item-1:declaredValue", "FVP action should target Declared Value.");

const heavy = build({
  quote: { route: { pickupZip: "11211", deliveryZip: "90021" } },
  result: {
    routeSupported: true,
    items: [{
      id: "item-2",
      name: "Cabinet",
      warning: "Heavy. 2 people needed",
      protectionPlan: "RV",
      declaredValue: 0,
    }],
    totals: { effectiveVolume: 25 },
  },
});
assert(heavy.readiness.id === "review", "Heavy item should require review.");
assert(heavy.warnings[0].severity === "approval", "Heavy item should map to approval-required presentation.");

const ready = build({
  quote: { route: { pickupZip: "11211", deliveryZip: "90021" } },
  result: {
    routeSupported: true,
    items: [{
      id: "item-3",
      name: "Lamp",
      warning: "OK",
      protectionPlan: "RV",
      declaredValue: 0,
    }],
    totals: { effectiveVolume: 10 },
  },
});
assert(ready.readiness.id === "ready", "Valid AS-IS quote should be ready.");
assert(ready.warnings.length === 0, "Valid AS-IS quote should not show warning cards.");

localStorage.setItem("zaberman-zip-coverage-overrides", JSON.stringify({
  "11211": { coverageStatus: "disabled", priceCoefficient: 1 },
  "90021": { coverageStatus: "approval_required", priceCoefficient: 1.2 },
}));
const coverageReview = build({
  quote: { route: { pickupZip: "11211", deliveryZip: "90021" } },
  result: {
    routeSupported: true,
    items: [{
      id: "item-4",
      name: "Chair",
      warning: "OK",
      protectionPlan: "RV",
      declaredValue: 0,
    }],
    totals: { effectiveVolume: 10 },
  },
});
assert(
  coverageReview.warnings.some((entry) => entry.id === "WARN-UI-ZIP-EXCLUDED-11211"),
  "Expected Excluded ZIP warning.",
);
assert(
  coverageReview.warnings.some((entry) => entry.id === "WARN-UI-ZIP-REVIEW-90021"),
  "Expected Review ZIP warning.",
);
assert(coverageReview.blocksEstimate === false, "ZIP coverage statuses must warn without blocking.");

const directMissingDate = build({
  quote: {
    route: { pickupZip: "11211", deliveryZip: "90021" },
    options: { pickupDirect: true, pickupDirectDate: "" },
  },
  result: {
    routeSupported: true,
    items: [{
      id: "item-5",
      name: "Sofa",
      warning: "OK",
      protectionPlan: "RV",
      declaredValue: 0,
    }],
    totals: { effectiveVolume: 60 },
  },
});
assert(directMissingDate.readiness.id === "review", "Direct service without date should require review without blocking calculation.");
assert(directMissingDate.warnings.some((entry) => entry.id === "WARN-UI-DIRECT-DATE-PICKUP"), "Expected Direct pickup date warning.");
assert(directMissingDate.enforcementEnabled === false, "Direct warning enforcement must remain disabled.");
assert(directMissingDate.blocksEstimate === false, "Direct warning should not block estimate generation.");

const accessReview = build({
  quote: {
    route: { pickupZip: "11211", deliveryZip: "90021" },
    access: {
      pickup: { floor: 5, elevatorAvailable: false, stairs: true },
      delivery: { floor: 1, elevatorAvailable: true },
    },
  },
  result: {
    routeSupported: true,
    items: [{
      id: "item-6",
      name: "Dresser",
      warning: "OK",
      protectionPlan: "RV",
      declaredValue: 0,
    }],
    totals: { effectiveVolume: 30 },
  },
});
assert(accessReview.readiness.id === "review", "High floor without elevator should require review.");
assert(accessReview.warnings.some((entry) => entry.id === "WARN-UI-FLOOR-PICKUP"), "Expected floor/elevator access warning.");
assert(accessReview.blocksEstimate === false, "Access review should not block estimate generation.");

const specialRequirements = build({
  quote: {
    route: { pickupZip: "11211", deliveryZip: "90021" },
    options: { extraLaborPeople: 2, extraLaborHours: 0 },
  },
  result: {
    routeSupported: true,
    items: [{
      id: "item-7",
      name: "Mirror",
      warning: "OK",
      protectionPlan: "RV",
      declaredValue: 0,
      fragile: true,
      nonStackable: true,
      packaging: "Custom Crate",
    }],
    totals: { effectiveVolume: 20 },
  },
});
assert(specialRequirements.readiness.id === "review", "Special requirements should require review without formula changes.");
assert(specialRequirements.warnings.some((entry) => entry.id === "WARN-UI-SPECIAL-LABOR-INCOMPLETE"), "Expected incomplete special labor warning.");
assert(specialRequirements.warnings.some((entry) => entry.id === "WARN-UI-FRAGILE-item-7"), "Expected fragile item warning.");
assert(specialRequirements.warnings.some((entry) => entry.id === "WARN-UI-NONSTACK-item-7"), "Expected non-stackable item warning.");
assert(specialRequirements.warnings.some((entry) => entry.id === "WARN-UI-CRATE-item-7"), "Expected custom crate item warning.");
assert(specialRequirements.blocksEstimate === false, "Special requirements should not block before governance approval.");

console.log(JSON.stringify({
  blankReadiness: blank.readiness.label,
  unsupportedReadiness: unsupported.readiness.label,
  fvpReadiness: fvp.readiness.label,
  heavyReadiness: heavy.readiness.label,
  readyReadiness: ready.readiness.label,
  coverageReadiness: coverageReview.readiness.label,
  directReadiness: directMissingDate.readiness.label,
  accessReadiness: accessReview.readiness.label,
  specialRequirementsWarnings: specialRequirements.warnings.length,
  enforcementEnabled: unsupported.enforcementEnabled,
}, null, 2));
