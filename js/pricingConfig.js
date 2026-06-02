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

  function vehicleIdFromName(name) {
    return String(name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `vehicle-${Date.now()}`;
  }

  function normalizeVehicle(vehicle) {
    const raw = vehicle || {};
    const vehicleName = raw.vehicleName || raw.name || "";
    const capacityCuFt = Number(raw.capacityCuFt ?? raw.volume ?? 0);
    const maxWeightLb = Number(raw.maxWeightLb ?? raw.payload ?? 0);
    const maintenanceCostPerMile = Number(raw.maintenanceCostPerMile ?? raw.maintenancePerMile ?? raw.costPerMile ?? 0);
    const fuelPerMile = Number(raw.fuelPerMile || 0);
    const volume = capacityCuFt;
    const payload = maxWeightLb;
    const calculationMpg = Number(raw.calculationMpg || 0);
    const normalized = {
      ...cloneData(raw),
      vehicleId: raw.vehicleId || vehicleIdFromName(vehicleName),
      vehicleName,
      name: vehicleName,
      category: raw.category || "Vehicle",
      capacityCuFt,
      volume,
      maxWeightLb,
      payload,
      fuelType: raw.fuelType === "Regular" ? "Regular" : "Diesel",
      mpg: Number(raw.mpg || 0),
      calculationMpg: calculationMpg || Number(raw.mpg || 0),
      passengerCapacity: Math.max(Number(raw.passengerCapacity || 1), 1),
      maintenanceCostPerMile,
      maintenancePerMile: maintenanceCostPerMile,
      active: raw.active !== false,
    };

    normalized.fuelPerMile = fuelPerMile;
    normalized.fuelPerMilePerCuFt = Number(raw.fuelPerMilePerCuFt || (volume > 0 ? fuelPerMile / volume : 0));
    normalized.fuelPerMilePerLb = Number(raw.fuelPerMilePerLb || (payload > 0 ? fuelPerMile / payload : 0));
    normalized.maintenancePerMilePerCuFt = Number(raw.maintenancePerMilePerCuFt || (volume > 0 ? maintenanceCostPerMile / volume : 0));
    normalized.maintenancePerMilePerLb = Number(raw.maintenancePerMilePerLb || (payload > 0 ? maintenanceCostPerMile / payload : 0));
    return normalized;
  }

  function normalizeVehicles(vehicles) {
    return (Array.isArray(vehicles) ? vehicles : []).map(normalizeVehicle);
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
    const vehicles = readVehicles();
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
      vehicleTypes: cloneData(vehicles),
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
    const existingVehicles = readJson(storageKeys.vehicles, null);
    if (!Array.isArray(existingVehicles) || existingVehicles.length === 0 || existingVehicles.some((vehicle) => !vehicle.vehicleId)) {
      window.localStorage.setItem(storageKeys.vehicles, JSON.stringify(normalizeVehicles(window.CalculatorVariables?.vehicleTypes || [])));
    }
    applyVehiclesToRuntime();
    const currentSnapshot = snapshot();
    writeJsonIfMissing(storageKeys.currentVariables, currentSnapshot);
    writeJsonIfMissing(storageKeys.variablesVersions, [baselineRecord()]);
    writeJsonIfMissing(storageKeys.fuelPrices, defaultFuelPrices());
    writeJsonIfMissing(storageKeys.drafts, []);
    writeJsonIfMissing(storageKeys.estimates, []);
    writeJsonIfMissing(storageKeys.calculationLogs, []);
    return true;
  }

  function readVehicles() {
    const stored = readJson(storageKeys.vehicles, null);
    const source = Array.isArray(stored) && stored.length ? stored : window.CalculatorVariables?.vehicleTypes || [];
    return normalizeVehicles(source);
  }

  function getActiveVehicles() {
    const active = readVehicles().filter((vehicle) => vehicle.active !== false);
    return active.length ? active : readVehicles();
  }

  function saveVehicles(vehicles) {
    const normalized = normalizeVehicles(vehicles);
    if (canUseLocalStorage()) window.localStorage.setItem(storageKeys.vehicles, JSON.stringify(normalized));
    window.CalculatorVariables.vehicleTypes = normalized;
    return normalized;
  }

  function applyVehiclesToRuntime() {
    window.CalculatorVariables.vehicleTypes = readVehicles();
    return window.CalculatorVariables.vehicleTypes;
  }

  function applySavedConfig() {
    mergeInto(window.CalculatorVariables, readSavedConfig());
    applyVehiclesToRuntime();
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
    normalizeVehicle,
    readVehicles,
    getActiveVehicles,
    saveVehicles,
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
  applyVehiclesToRuntime();
})();
