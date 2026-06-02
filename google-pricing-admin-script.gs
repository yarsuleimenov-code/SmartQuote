const PRICING_ADMIN_SHEETS = {
  variablesVersions: "variables_versions",
  fuelPrices: "fuel_prices",
  vehicles: "vehicles",
  audit: "pricing_admin_audit",
  configExports: "config_exports",
};

const PRICING_ADMIN_HEADERS = {
  variables_versions: [
    "variablesVersion",
    "formulaVersion",
    "status",
    "updatedAt",
    "updatedBy",
    "changeNotes",
    "variablesSnapshotJson",
  ],
  fuel_prices: [
    "variablesVersion",
    "fuelType",
    "currentAvg",
    "fuelSurchargePct",
    "internalFuelPrice",
    "updatedAt",
    "updatedBy",
  ],
  vehicles: [
    "vehicleId",
    "vehicleName",
    "category",
    "capacityCuFt",
    "maxWeightLb",
    "fuelType",
    "mpg",
    "passengerCapacity",
    "costPerMile",
    "active",
    "variablesVersion",
    "updatedAt",
    "updatedBy",
  ],
  pricing_admin_audit: [
    "auditId",
    "timestamp",
    "action",
    "entityType",
    "entityId",
    "previousSnapshotJson",
    "newSnapshotJson",
    "updatedBy",
    "source",
  ],
  config_exports: [
    "exportId",
    "timestamp",
    "formulaVersion",
    "variablesVersion",
    "exportJson",
  ],
};

function doGet() {
  ensurePricingAdminWorkbook_();
  return pricingAdminJson_({
    success: true,
    app: "SmartQuote Pricing Admin Storage",
    sheets: Object.values(PRICING_ADMIN_SHEETS),
  });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const action = data.action;
    const payload = data.payload;

    ensurePricingAdminWorkbook_();

    if (action === "save_variables_version") {
      appendVariablesVersion_(payload);
    } else if (action === "save_fuel_prices") {
      appendFuelPrices_(payload);
    } else if (action === "save_vehicles") {
      appendVehicles_(payload);
    } else if (action === "append_audit") {
      appendAudit_(payload);
    } else if (action === "save_config_export") {
      appendConfigExport_(payload);
    } else {
      throw new Error("Unsupported pricing admin action: " + action);
    }

    return pricingAdminJson_({ success: true, action });
  } catch (error) {
    return pricingAdminJson_({
      success: false,
      error: error.message || String(error),
    });
  }
}

function appendVariablesVersion_(record) {
  const snapshot = record.variablesSnapshot || {};
  appendRow_("variables_versions", [
    record.variablesVersion || snapshot.variablesVersion || "",
    record.formulaVersion || snapshot.formulaVersion || "",
    record.status || "saved",
    record.updatedAt || new Date().toISOString(),
    record.updatedBy || "",
    record.changeNotes || "",
    JSON.stringify(snapshot),
  ]);
}

function appendFuelPrices_(records) {
  (Array.isArray(records) ? records : []).forEach((record) => {
    appendRow_("fuel_prices", [
      record.variablesVersion || "",
      record.fuelType || "",
      numberOrBlank_(record.currentAvg),
      numberOrBlank_(record.fuelSurchargePct),
      numberOrBlank_(record.internalFuelPrice),
      record.updatedAt || new Date().toISOString(),
      record.updatedBy || "",
    ]);
  });
}

function appendVehicles_(records) {
  (Array.isArray(records) ? records : []).forEach((record) => {
    appendRow_("vehicles", [
      record.vehicleId || record.id || "",
      record.vehicleName || record.name || "",
      record.category || "",
      numberOrBlank_(record.capacityCuFt || record.volume),
      numberOrBlank_(record.maxWeightLb || record.payload),
      record.fuelType || "",
      numberOrBlank_(record.mpg),
      numberOrBlank_(record.passengerCapacity),
      numberOrBlank_(record.costPerMile || record.maintenancePerMile),
      record.active === false ? false : true,
      record.variablesVersion || "",
      record.updatedAt || new Date().toISOString(),
      record.updatedBy || "",
    ]);
  });
}

function appendAudit_(record) {
  appendRow_("pricing_admin_audit", [
    record.auditId || Utilities.getUuid(),
    record.timestamp || new Date().toISOString(),
    record.action || "",
    record.entityType || "",
    record.entityId || "",
    JSON.stringify(record.previousSnapshot || {}),
    JSON.stringify(record.newSnapshot || {}),
    record.updatedBy || "",
    record.source || "frontend",
  ]);
}

function appendConfigExport_(record) {
  appendRow_("config_exports", [
    record.exportId || Utilities.getUuid(),
    record.timestamp || new Date().toISOString(),
    record.formulaVersion || "",
    record.variablesVersion || "",
    JSON.stringify(record.exportJson || record),
  ]);
}

function ensurePricingAdminWorkbook_() {
  Object.values(PRICING_ADMIN_SHEETS).forEach((sheetName) => {
    const sheet = getOrCreateSheet_(sheetName);
    const headers = PRICING_ADMIN_HEADERS[sheetName];
    if (!headers) return;
    const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const isEmpty = existing.every((cell) => !cell);
    if (isEmpty) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }
  });
}

function appendRow_(sheetName, row) {
  getOrCreateSheet_(sheetName).appendRow(row);
}

function getOrCreateSheet_(sheetName) {
  const workbook = SpreadsheetApp.getActiveSpreadsheet();
  return workbook.getSheetByName(sheetName) || workbook.insertSheet(sheetName);
}

function numberOrBlank_(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : "";
}

function pricingAdminJson_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
