const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sourceDir = path.join(root, "docs", "formula-spec", "normalized");

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
  return {
    id: record["Canonical Variable ID"],
    name: record.Name,
    section: variableSection(record),
    activeKey: activeKey(record.Name),
    exampleValue: record["Current / Example Value"],
    unit: record["Unit / Type"],
    readiness: record["Data Readiness"],
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
