(function () {
  const storageKey = "zaberman-pricing-config";
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
      settings: cloneData(current.settings),
      warningRules: cloneData(current.warningRules),
      packagingRates: cloneData(current.packagingRates),
      protectionPlans: cloneData(current.protectionPlans),
      vehicleTypes: cloneData(current.vehicleTypes),
      distanceMatrix: cloneData(current.distanceMatrix),
      itemHandlingMultipliers: cloneData(current.itemHandlingMultipliers),
    };
  }

  function applySavedConfig() {
    mergeInto(window.CalculatorVariables, readSavedConfig());
    return window.CalculatorVariables;
  }

  window.PricingConfig = {
    storageKey,
    baseline,
    applySavedConfig,
    readSavedConfig,
    saveAdminConfig(config) {
      writeSavedConfig(config);
      return applySavedConfig();
    },
    resetAdminConfig() {
      if (canUseLocalStorage()) window.localStorage.removeItem(storageKey);
      window.CalculatorVariables = mergeInto(window.CalculatorVariables, baseline);
      return window.CalculatorVariables;
    },
    snapshot,
  };

  applySavedConfig();
})();
