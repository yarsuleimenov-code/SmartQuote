(function () {
  const storageKey = "zaberman-pricing-config";
  const storageKeys = {
    currentVariables: "currentVariables",
    variablesVersions: "variablesVersions",
    vehicles: "vehicles",
    fuelPrices: "fuelPrices",
    drafts: "drafts",
    estimates: "estimates",
    calculationLogs: "calculationLogs",
  };
  const baseline = cloneData(window.CalculatorVariables || {});

  function cloneData(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function canUseLocalStorage() {
    try {
      return Boolean(window.localStorage);
    } catch {
      return false;
    }
  }

  function readSavedConfig() {
    if (!canUseLocalStorage()) return {};
    try {
      return JSON.parse(window.localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  }

  function writeSavedConfig(config) {
    if (!canUseLocalStorage()) return false;
    window.localStorage.setItem(storageKey, JSON.stringify(config || {}));
    return true;
  }

  function readJson(storageName, fallback) {
    if (!canUseLocalStorage()) return fallback;
    try {
      const raw = window.localStorage.getItem(storageName);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJsonIfMissing(storageName, value) {
    if (!canUseLocalStorage() || window.localStorage.getItem(storageName)) return false;
    window.localStorage.setItem(storageName, JSON.stringify(value));
    return true;
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function mergeInto(target, source) {
    Object.entries(source || {}).forEach(([key, value]) => {
      if (typeof target[key] === "function") return;
      if (Array.isArray(value)) {
        target[key] = cloneData(value);
      } else if (isPlainObject(value) && isPlainObject(target[key])) {
        mergeInto(target[key], value);
      } else if (value !== undefined) {
        target[key] = value;
      }
    });
    return target;
  }

  function snapshot() {
    const current = window.CalculatorVariables || {};
    return {
      formulaVersion: current.formulaVersion || "unknown",
      variablesVersion: current.variablesVersion || "unknown",
      updatedAt: current.updatedAt || "",
      updatedBy: current.updatedBy || "",
      changeNotes: current.changeNotes || "",
      settings: cloneData(current.settings),
      warningRules: cloneData(current.warningRules),
      packagingRates: cloneData(current.packagingRates),
      protectionPlans: cloneData(current.protectionPlans),
      fuelPrices: cloneData(readJson(storageKeys.fuelPrices, current.fuelPrices || [])),
      vehicleTypes: cloneData(current.vehicleTypes),
      distanceMatrix: cloneData(current.distanceMatrix),
      itemHandlingMultipliers: cloneData(current.itemHandlingMultipliers),
    };
  }

  function baselineRecord() {
    const currentSnapshot = snapshot();
    return {
      variablesVersion: currentSnapshot.variablesVersion,
      formulaVersion: currentSnapshot.formulaVersion,
      status: "baseline",
      updatedAt: currentSnapshot.updatedAt,
      updatedBy: currentSnapshot.updatedBy,
      changeNotes: currentSnapshot.changeNotes,
      variablesSnapshot: currentSnapshot,
    };
  }

  function defaultFuelPrices() {
    const timestamp = baseline.updatedAt || new Date().toISOString();
    const defaultPrices = baseline.fuelPrices || [
      {
        fuelType: "Regular",
        currentAvg: 4.555,
        fuelSurchargePct: 10,
        internalFuelPrice: 5.0105,
      },
      {
        fuelType: "Diesel",
        currentAvg: 5.652,
        fuelSurchargePct: 10,
        internalFuelPrice: 6.2172,
      },
    ];
    return defaultPrices.map((fuel) => ({
      variablesVersion: baseline.variablesVersion || "baseline",
      updatedAt: timestamp,
      updatedBy: baseline.updatedBy || "System",
      ...fuel,
    }));
  }

  function initializeStorageStructure() {
    if (!canUseLocalStorage()) return false;
    const currentSnapshot = snapshot();
    writeJsonIfMissing(storageKeys.currentVariables, currentSnapshot);
    writeJsonIfMissing(storageKeys.variablesVersions, [baselineRecord()]);
    writeJsonIfMissing(storageKeys.vehicles, cloneData(window.CalculatorVariables?.vehicleTypes || []));
    writeJsonIfMissing(storageKeys.fuelPrices, defaultFuelPrices());
    writeJsonIfMissing(storageKeys.drafts, []);
    writeJsonIfMissing(storageKeys.estimates, []);
    writeJsonIfMissing(storageKeys.calculationLogs, []);
    return true;
  }

  function applySavedConfig() {
    mergeInto(window.CalculatorVariables, readSavedConfig());
    return window.CalculatorVariables;
  }

  window.PricingConfig = {
    storageKey,
    storageKeys,
    baseline,
    applySavedConfig,
    readSavedConfig,
    initializeStorageStructure,
    readStorageBucket(name, fallback = null) {
      return readJson(storageKeys[name] || name, fallback);
    },
    saveAdminConfig(config) {
      writeSavedConfig(config);
      const applied = applySavedConfig();
      initializeStorageStructure();
      return applied;
    },
    resetAdminConfig() {
      if (canUseLocalStorage()) window.localStorage.removeItem(storageKey);
      window.CalculatorVariables = mergeInto(window.CalculatorVariables, baseline);
      initializeStorageStructure();
      return window.CalculatorVariables;
    },
    snapshot,
  };

  applySavedConfig();
  initializeStorageStructure();
})();
