(function () {
  const config = window.ZabermanConfig?.pricingAdmin || {};
  const endpoint = String(config.endpoint || window.PRICING_ADMIN_SCRIPT_URL || "").trim();
  const storageKeys = window.PricingConfig?.storageKeys || {
    currentVariables: "currentVariables",
    variablesVersions: "variablesVersions",
    vehicles: "vehicles",
    fuelPrices: "fuelPrices",
    calculationLogs: "calculationLogs",
  };

  function canUseLocalStorage() {
    try {
      return Boolean(window.localStorage);
    } catch {
      return false;
    }
  }

  function readJson(key, fallback) {
    if (!canUseLocalStorage()) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    if (!canUseLocalStorage()) return false;
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  }

  function appendJson(key, value) {
    const list = readJson(key, []);
    const next = Array.isArray(list) ? list.slice() : [];
    next.unshift(value);
    writeJson(key, next);
    return next;
  }

  async function sendRemote(action, payload) {
    if (!endpoint) {
      return {
        success: false,
        skipped: true,
        reason: "PRICING_ADMIN_SCRIPT_URL is not configured.",
      };
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action, payload }),
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: false, error: text || "Invalid Apps Script response." };
      }
      return { ...data, status: response.status };
    } catch (error) {
      return {
        success: false,
        skipped: true,
        reason: error.message || "Pricing Admin remote save failed.",
      };
    }
  }

  function buildAudit(action, entityType, entityId, previousSnapshot, newSnapshot, source = "frontend") {
    return {
      auditId: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      entityType,
      entityId,
      previousSnapshot,
      newSnapshot,
      updatedBy: "Admin",
      source,
    };
  }

  window.PricingAdminStorage = {
    endpoint,
    isRemoteConfigured() {
      return Boolean(endpoint);
    },
    readCurrentVariables() {
      return readJson(storageKeys.currentVariables, window.PricingConfig?.snapshot?.() || null);
    },
    readVariablesVersions() {
      return readJson(storageKeys.variablesVersions, []);
    },
    readFuelPrices() {
      return readJson(storageKeys.fuelPrices, []);
    },
    readVehicles() {
      return readJson(storageKeys.vehicles, []);
    },
    async saveVariablesVersion(versionRecord) {
      const record = {
        ...versionRecord,
        updatedAt: versionRecord.updatedAt || new Date().toISOString(),
      };
      writeJson(storageKeys.currentVariables, record.variablesSnapshot || record);
      appendJson(storageKeys.variablesVersions, record);
      const audit = buildAudit("save_variables_version", "variables", record.variablesVersion, null, record);
      appendJson(storageKeys.calculationLogs, audit);
      const remote = await sendRemote("save_variables_version", record);
      return { success: true, local: true, remote };
    },
    async saveFuelPrices(fuelPrices) {
      const records = Array.isArray(fuelPrices) ? fuelPrices : [];
      writeJson(storageKeys.fuelPrices, records);
      const audit = buildAudit("save_fuel_prices", "fuel_prices", "fuel_prices", null, records);
      appendJson(storageKeys.calculationLogs, audit);
      const remote = await sendRemote("save_fuel_prices", records);
      return { success: true, local: true, remote };
    },
    async saveVehicles(vehicles) {
      const records = Array.isArray(vehicles) ? vehicles : [];
      writeJson(storageKeys.vehicles, records);
      const audit = buildAudit("save_vehicles", "vehicles", "vehicles", null, records);
      appendJson(storageKeys.calculationLogs, audit);
      const remote = await sendRemote("save_vehicles", records);
      return { success: true, local: true, remote };
    },
    async saveConfigExport(exportRecord) {
      const record = {
        exportId: exportRecord.exportId || `export-${Date.now()}`,
        timestamp: exportRecord.timestamp || new Date().toISOString(),
        ...exportRecord,
      };
      const remote = await sendRemote("save_config_export", record);
      return { success: true, local: false, remote };
    },
    async appendAudit(auditRecord) {
      const record = {
        auditId: auditRecord.auditId || `audit-${Date.now()}`,
        timestamp: auditRecord.timestamp || new Date().toISOString(),
        ...auditRecord,
      };
      appendJson(storageKeys.calculationLogs, record);
      const remote = await sendRemote("append_audit", record);
      return { success: true, local: true, remote };
    },
  };
})();
