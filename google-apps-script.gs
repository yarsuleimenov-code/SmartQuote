const SHEETS = {
  quotes: "Quotes",
  items: "QuoteItems",
  estimates: "Estimates",
  pricing: "PricingResults",
  audit: "AuditLog",
};

const AUTH_TOKEN_PROPERTY = "SHEETS_AUTH_TOKEN";

const HEADERS = {
  Quotes: [
    "remote_id",
    "timestamp",
    "quote_id",
    "estimate_id",
    "status",
    "customer_lead_name",
    "customer_name",
    "customer_phone",
    "customer_email",
    "pickup_zip",
    "delivery_zip",
    "pickup_zone",
    "delivery_zone",
    "distance",
    "route_supported",
    "pickup_address",
    "delivery_address",
    "delivery_type",
    "helper_requirement",
    "priority_date",
    "exclusive_delivery",
    "manual_adjustment",
    "notes",
    "access_json",
    "options_json",
  ],
  QuoteItems: [
    "remote_id",
    "quote_id",
    "estimate_id",
    "item_id",
    "item_name",
    "qty",
    "length_in",
    "width_in",
    "height_in",
    "weight_lb",
    "total_weight_lb",
    "physical_volume_cuft",
    "effective_volume_cuft",
    "packaging",
    "protection_plan",
    "declared_value",
    "storage_days",
    "fragile",
    "non_stackable",
    "crated",
    "warning",
    "comment",
  ],
  Estimates: [
    "remote_id",
    "timestamp",
    "quote_id",
    "estimate_id",
    "status",
    "created_at",
    "valid_until",
    "customer_name",
    "final_price",
    "protection_plan",
    "warning_count",
  ],
  PricingResults: [
    "remote_id",
    "quote_id",
    "estimate_id",
    "total_volume",
    "effective_volume",
    "total_weight",
    "vehicle",
    "required_crew",
    "operational_cost",
    "route_cost",
    "labor_cost",
    "additional_charges",
    "packaging",
    "storage",
    "insurance",
    "access_fees",
    "option_fees",
    "margin",
    "raw_price",
    "rounding_delta",
    "final_price",
    "warnings_json",
  ],
  AuditLog: [
    "remote_id",
    "timestamp",
    "action",
    "quote_id",
    "estimate_id",
    "status",
    "source",
    "payload_json",
  ],
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    verifyAuth_(data);
    const remoteId = Utilities.getUuid();
    const timestamp = data.timestamp || new Date().toISOString();

    ensureWorkbook_();
    appendQuote_(remoteId, timestamp, data);
    appendItems_(remoteId, data);
    appendEstimate_(remoteId, timestamp, data);
    appendPricing_(remoteId, data);
    appendAudit_(remoteId, timestamp, data);

    return json_({
      success: true,
      remote_id: remoteId,
      quote_id: data.quote_id,
      estimate_id: data.estimate_id,
    });
  } catch (error) {
    return json_({ success: false, error: String(error) });
  }
}

function doGet() {
  return json_({
    success: true,
    service: "Zaberman LLC Pricing Calculator Sheets API",
    auth_configured: Boolean(getExpectedToken_()),
  });
}

function verifyAuth_(data) {
  const expectedToken = getExpectedToken_();
  if (!expectedToken) {
    throw new Error("SHEETS_AUTH_TOKEN script property is not configured.");
  }

  if (!data || data.auth_token !== expectedToken) {
    throw new Error("Unauthorized Google Sheets save request.");
  }
}

function getExpectedToken_() {
  return PropertiesService.getScriptProperties().getProperty(AUTH_TOKEN_PROPERTY);
}

function ensureWorkbook_() {
  Object.keys(HEADERS).forEach(function (sheetName) {
    const sheet = getSheet_(sheetName);
    ensureHeaders_(sheet, HEADERS[sheetName]);
  });
}

function appendQuote_(remoteId, timestamp, data) {
  const route = data.route || {};
  const customer = data.customer || {};
  const options = data.options || {};
  getSheet_(SHEETS.quotes).appendRow([
    remoteId,
    timestamp,
    data.quote_id,
    data.estimate_id,
    data.status,
    customer.lead_name,
    customer.name,
    customer.phone,
    customer.email,
    route.pickup_zip,
    route.delivery_zip,
    route.pickup_zone,
    route.delivery_zone,
    route.distance,
    route.route_supported,
    route.pickup_address,
    route.delivery_address,
    options.deliveryType,
    options.helperRequirement,
    options.priorityDate,
    options.exclusiveDelivery,
    data.manual_adjustment,
    data.notes,
    JSON.stringify(data.access || {}),
    JSON.stringify(options),
  ]);
}

function appendItems_(remoteId, data) {
  const sheet = getSheet_(SHEETS.items);
  (data.items || []).forEach(function (item) {
    sheet.appendRow([
      remoteId,
      data.quote_id,
      data.estimate_id,
      item.id,
      item.name,
      item.qty,
      item.length,
      item.width,
      item.height,
      item.weight,
      item.totalWeight,
      item.volume,
      item.effectiveVolume,
      item.packaging,
      item.insurance,
      item.declaredValue,
      item.storageDays,
      item.fragile,
      item.nonStackable,
      item.crated,
      item.warning,
      item.comment,
    ]);
  });
}

function appendEstimate_(remoteId, timestamp, data) {
  const customer = data.customer || {};
  const totals = data.totals || {};
  getSheet_(SHEETS.estimates).appendRow([
    remoteId,
    timestamp,
    data.quote_id,
    data.estimate_id,
    data.status,
    timestamp,
    "",
    customer.name,
    totals.final_price,
    data.protection_plan,
    (data.warnings || []).length,
  ]);
}

function appendPricing_(remoteId, data) {
  const totals = data.totals || {};
  getSheet_(SHEETS.pricing).appendRow([
    remoteId,
    data.quote_id,
    data.estimate_id,
    totals.total_volume,
    totals.effective_volume,
    totals.total_weight,
    data.vehicle && data.vehicle.name,
    data.required_crew,
    totals.operational_cost,
    totals.route_cost,
    totals.labor_cost,
    totals.additional_charges,
    totals.packaging,
    totals.storage,
    totals.insurance,
    totals.access_fees,
    totals.option_fees,
    totals.margin,
    totals.raw_price,
    totals.rounding_delta,
    totals.final_price,
    JSON.stringify(data.warnings || []),
  ]);
}

function appendAudit_(remoteId, timestamp, data) {
  const auditPayload = Object.assign({}, data);
  delete auditPayload.auth_token;
  getSheet_(SHEETS.audit).appendRow([
    remoteId,
    timestamp,
    data.action,
    data.quote_id,
    data.estimate_id,
    data.status,
    data.source,
    JSON.stringify(auditPayload),
  ]);
}

function getSheet_(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
}

function ensureHeaders_(sheet, headers) {
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeaders = firstRow.some(Boolean);
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
