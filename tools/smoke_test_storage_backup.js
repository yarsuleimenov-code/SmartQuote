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

function loadContext(seed = {}) {
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
    "js/storageBackup.js",
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

function buildSnapshot(context, quote, result) {
  const createdAt = new Date().toISOString();
  return {
    snapshotVersion: 1,
    formulaVersion: context.window.CalculatorVariables.formulaVersion,
    variablesSnapshot: context.window.PricingConfig.snapshot(),
    createdAt,
    validUntil: new Date(Date.parse(createdAt) + 14 * 24 * 60 * 60 * 1000).toISOString(),
    estimateId: quote.estimateId,
    status: "storage-backup-smoke",
    quote: clone(quote),
    result: clone(result),
  };
}

const { context, localStorage } = loadContext({
  "zaberman-calculator-drafts": "not valid json",
  "zaberman-estimate-snapshots": "not valid json",
  "zaberman-zip-coverage-overrides": JSON.stringify({
    "90049": { coverageStatus: "approval_required", priceCoefficient: 1 },
  }),
});

const blankQuote = clone(context.window.CalculatorBlankQuote);
const blankResult = context.window.PricingCalculator.calculateQuote(blankQuote);
assert(blankResult.totals.finalPrice === 0, "Blank quote must remain $0.");

const quote = clone(context.window.CalculatorMockData);
quote.customer.leadName = "Storage Backup Smoke";
quote.estimateId = "EST-BACKUP";
const result = context.window.PricingCalculator.calculateQuote(quote);

context.window.CalculatorStorage.save(quote);
context.window.CalculatorStorage.saveEstimateSnapshot(buildSnapshot(context, quote, result));

const backup = context.window.StorageBackup.createBackupObject();
const requiredKeys = [
  "currentVariables",
  "variablesVersions",
  "vehicles",
  "fuelPrices",
  "calculationLogs",
  "zaberman-zip-coverage-overrides",
  "zaberman-calculator-drafts",
  "zaberman-estimate-snapshots",
  "zaberman-current-draft-id",
  "zaberman-current-estimate-id",
];
requiredKeys.forEach((key) => {
  assert(Object.prototype.hasOwnProperty.call(backup.storage, key), `Expected backup to include ${key}.`);
});

const valid = context.window.StorageBackup.validateBackup(backup);
assert(valid.valid, `Expected valid backup: ${valid.error || ""}`);

const originalDrafts = localStorage.getItem("zaberman-calculator-drafts");
const invalid = clone(backup);
invalid.storage["zaberman-calculator-drafts"] = "{broken";
const invalidResult = context.window.StorageBackup.importBackup(invalid);
assert(!invalidResult.success, "Invalid backup must be rejected.");
assert(localStorage.getItem("zaberman-calculator-drafts") === originalDrafts, "Invalid backup must not overwrite existing drafts.");

localStorage.setItem("zaberman-calculator-drafts", "[]");
localStorage.setItem("zaberman-estimate-snapshots", "[]");
localStorage.removeItem("zaberman-calculator-draft");
localStorage.removeItem("zaberman-estimate-snapshot");
localStorage.removeItem("zaberman-current-draft-id");
localStorage.removeItem("zaberman-current-estimate-id");
assert(context.window.CalculatorStorage.listDrafts().length === 0, "Expected drafts to be cleared before import.");

const importResult = context.window.StorageBackup.importBackup(backup);
assert(importResult.success, `Expected import to succeed: ${importResult.error || ""}`);
assert(localStorage.getItem(context.window.StorageBackup.preImportBackupKey), "Expected pre-import backup snapshot.");

const restoredDrafts = context.window.CalculatorStorage.listDrafts();
const restoredEstimates = context.window.CalculatorStorage.listEstimateSnapshots();
assert(restoredDrafts.length >= 1, "Expected import to restore drafts.");
assert(restoredEstimates.length >= 1, "Expected import to restore estimates.");
assert(context.window.CalculatorStorage.loadEstimateSnapshot(restoredEstimates[0].snapshotId), "Expected estimate snapshot to open after import.");

const healthContext = loadContext({
  "zaberman-calculator-drafts": "not valid json",
  "zaberman-estimate-snapshots": "not valid json",
});
assert(healthContext.context.window.CalculatorStorage.listDrafts().length === 0, "Corrupted drafts fallback must not throw.");
const health = healthContext.context.window.StorageBackup.storageHealth();
assert(health.corrupted.includes("zaberman-calculator-drafts"), "Expected corrupted drafts to be reported.");
assert(health.corrupted.includes("zaberman-estimate-snapshots"), "Expected corrupted estimates to be reported.");

console.log(JSON.stringify({
  status: "passed",
  exportedKeyCount: Object.keys(backup.storage).length,
  restoredDrafts: restoredDrafts.length,
  restoredEstimates: restoredEstimates.length,
  preImportBackupCreated: Boolean(localStorage.getItem(context.window.StorageBackup.preImportBackupKey)),
  corruptedKeysDetected: health.corrupted,
}, null, 2));
