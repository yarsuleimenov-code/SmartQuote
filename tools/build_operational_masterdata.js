const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sourceDir = path.join(root, "docs", "formula-spec", "normalized");

// Business-operational Variables screen: active AS-IS inputs plus approved
// compensation and primary labor, handling, access, and time inputs for
// business review. The full registry remains available for Formula Trace.
const visibleVariableIds = new Set([
  "VAR-001", "VAR-002", "VAR-003",
  "VAR-006", "VAR-007", "VAR-008", "VAR-009", "VAR-010", "VAR-011", "VAR-012", "VAR-013", "VAR-014", "VAR-015", "VAR-016", "VAR-017", "VAR-019", "VAR-020", "VAR-021", "VAR-022", "VAR-023", "VAR-024", "VAR-025", "VAR-026", "VAR-027", "VAR-029", "VAR-030",
  "VAR-TBE-002", "VAR-TBE-003", "VAR-TBE-004", "VAR-TBE-008", "VAR-TBE-009", "VAR-TBE-014", "VAR-TBE-015", "VAR-TBE-016", "VAR-TBE-017", "VAR-TBE-018",
  "VAR-TIME-003", "VAR-TIME-010", "VAR-HND-001", "VAR-HND-002", "VAR-HND-003", "VAR-HND-004", "VAR-HND-005", "VAR-HND-007", "VAR-HND-010", "VAR-HND-013", "VAR-ACC-001", "VAR-ACC-003", "VAR-LAB-001", "VAR-LAB-002", "VAR-LAB-003", "VAR-LAB-004", "VAR-LAB-005",
]);

const businessUnits = {
  directFixedFee: "USD/order",
  pickupTimeCoefficients: "multiplier",
  deliveryTimeCoefficients: "multiplier",
  hourlyWageByRole: "USD/hour",
  overtimeMultiplier: "multiplier",
  payrollBurdenRate: "%",
  timeEstimateBufferPct: "%",
  onePersonMaxItemWeightLb: "lb",
  twoPersonItemWeightThresholdLb: "lb",
  awkwardItemLengthThresholdIn: "in",
  itemMinimumHandlingMinutes: "minutes",
  largeLightItemVolumeThresholdCuFt: "cu ft",
  heavyPieceWeightThresholdLb: "lb",
  helperActiveMinutesPerHeavyPiece: "minutes/piece",
  accessHeavyImpactMinutes: "minutes",
  freeFloorCount: "floors",
  extraLaborMinimumHours: "hours",
  minutesPerCuFt: "min/cu ft",
  minutesPerLb: "min/lb",
  pickupTimeMultiplier: "multiplier",
  deliveryTimeMultiplier: "multiplier",
  minimumHandlingMinutes: "minutes",
  pickupCurveAnchorVolume: "cu ft",
  pickupCurveAnchorMinutes: "minutes",
  pickupCurveTransitionVolume: "cu ft",
  pickupCurveTransitionMinutes: "minutes",
  pickupPostThresholdRate: "min/cu ft",
  minimumPickupLoadingMinutes: "minutes",
};

const businessVariablePresentation = {
  "VAR-008": { name: "pickupCurveAnchorVolume", displayName: "Pickup Curve Anchor Volume", presentation: "pickupCurveAnchorVolume" },
  "VAR-009": { name: "pickupCurveAnchorMinutes", displayName: "Pickup Curve Anchor Time", presentation: "pickupCurveAnchorMinutes" },
  "VAR-010": { name: "pickupCurveTransitionVolume", displayName: "Pickup Curve Transition Volume", activeKey: "loadingVolumeThresholdCuFt" },
  "VAR-011": { name: "pickupCurveTransitionMinutes", displayName: "Pickup Curve Transition Time", activeKey: "loadingThresholdMinutes" },
  "VAR-014": { name: "minimumPickupLoadingMinutes", displayName: "Minimum Pickup Loading Time", activeKey: "minLoadingMinutes" },
  "VAR-TIME-010": { name: "pickupPostThresholdRate", displayName: "Pickup Time After Transition", presentation: "pickupPostThresholdRate" },
};

function parseCsv(content) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (quoted) {
      if (character === '"' && content[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
      continue;
    }
    if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(value);
      value = "";
    } else if (character === "\n") {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  if (value || row.length) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }
  const [headers, ...records] = rows;
  return records.filter((record) => record.some(Boolean)).map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] || ""])));
}

function variableSection(record) {
  const value = `${record["Canonical Variable ID"]} ${record.Name}`.toLowerCase();
  if (/(warning|approval)/.test(value)) return "Warnings and Approval";
  if (/(protection|storage|packaging|crate)/.test(value)) return "Protection, Storage and Packaging";
  if (/(capacity|vehicle|cargo|routecapacity|interstatecost)/.test(value)) return "Capacity and Vehicle Economics";
  if (/(handling|item|piece|weight|awkward|helper)/.test(value)) return "Item Handling";
  if (/(access|stairs|floor|carry|coi|direct|location|parking)/.test(value)) return "Access and Service";
  if (/(labor|time|wage|loading|unloading|minute|overtime|payroll|pickup|delivery)/.test(value)) return "Labor and Time";
  return "Pricing and Margin";
}

function referenceSection(record) {
  const value = `${record["Canonical Reference ID"]} ${record.Name}`.toLowerCase();
  if (/(zip|zone|distance|service area|route engine|manual zip)/.test(value)) return "Route and Coverage";
  if (/vehicle/.test(value)) return "Vehicles";
  if (/(quote draft|quick quote|item|handling|physical access)/.test(value)) return "Items and Handling";
  if (/(packaging|protection|storage|crate)/.test(value)) return "Services";
  if (/(labor|payroll|broker|dispatcher|overhead)/.test(value)) return "People and Operations";
  return "Quality and Control";
}

function activeKey(name) {
  const aliases = {
    roundingIncrement: "rounding",
    storageRate: "storagePerCuFtPerDay",
    "fvpRate / fvpFixedFee": "protectionPlans.Full Coverage",
    "fuel currentAvg / fuelSurchargePct": "fuelPrices",
    packagingRates: "packagingRates",
    extraLaborRate: "extraLaborRate",
  };
  return aliases[name] || name;
}

function normalizeVariable(record) {
  const presentation = businessVariablePresentation[record["Canonical Variable ID"]] || {};
  const name = presentation.name || record.Name;
  return {
    id: record["Canonical Variable ID"],
    name,
    displayName: presentation.displayName || "",
    section: variableSection(record),
    activeKey: presentation.activeKey || activeKey(record.Name),
    presentation: presentation.presentation || "",
    exampleValue: record["Current / Example Value"],
    unit: businessUnits[name] || record["Unit / Type"],
    readiness: record["Data Readiness"],
    visibleInVariables: visibleVariableIds.has(record["Canonical Variable ID"]),
  };
}

function normalizeReference(record) {
  return {
    id: record["Canonical Reference ID"],
    name: record.Name,
    section: referenceSection(record),
    fields: record["Key Fields"],
    readiness: record["Data Readiness"],
  };
}

function csvEscape(value) {
  return `"${String(value || "").replace(/"/g, '""')}"`;
}

const variables = parseCsv(fs.readFileSync(path.join(sourceDir, "variable_registry.csv"), "utf8")).map(normalizeVariable);
const references = parseCsv(fs.readFileSync(path.join(sourceDir, "reference_registry.csv"), "utf8")).map(normalizeReference);

const output = `// Generated from normalized Formula Sprint registries. Do not edit manually.\n(function () {\n  window.OperationalMasterdata = ${JSON.stringify({ variables, references }, null, 2)};\n})();\n`;
fs.writeFileSync(path.join(root, "js", "operationalMasterdata.js"), output, "utf8");

const mappingRows = [
  ["Type", "Canonical ID", "Name", "Operational Screen", "Section", "Active Key / Fields", "Data Readiness"],
  ...variables.map((record) => ["Variable", record.id, record.name, "Variables", record.section, record.activeKey, record.readiness]),
  ...references.map((record) => ["Reference", record.id, record.name, "References", record.section, record.fields, record.readiness]),
];
fs.writeFileSync(path.join(root, "docs", "operational-masterdata-mapping.csv"), mappingRows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n", "utf8");

console.log(JSON.stringify({ variables: variables.length, references: references.length, output: "js/operationalMasterdata.js" }));
