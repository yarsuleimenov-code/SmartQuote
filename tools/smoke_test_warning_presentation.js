const fs = require("fs");
const vm = require("vm");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const context = { window: {} };
context.window.window = context.window;
vm.createContext(context);
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

console.log(JSON.stringify({
  blankReadiness: blank.readiness.label,
  unsupportedReadiness: unsupported.readiness.label,
  fvpReadiness: fvp.readiness.label,
  heavyReadiness: heavy.readiness.label,
  readyReadiness: ready.readiness.label,
  enforcementEnabled: unsupported.enforcementEnabled,
}, null, 2));

