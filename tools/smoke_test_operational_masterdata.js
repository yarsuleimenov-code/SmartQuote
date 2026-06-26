const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "js", "operationalMasterdata.js"), "utf8");
const referencesHtml = fs.readFileSync(path.join(root, "references.html"), "utf8");
const referencesRenderer = fs.readFileSync(path.join(root, "js", "referencesOperational.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context);

const masterdata = context.window.OperationalMasterdata;
const variables = masterdata?.variables || [];
const references = masterdata?.references || [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function unique(records) {
  return new Set(records.map((record) => record.id)).size === records.length;
}

assert(variables.length === 116, `Expected 116 variables, got ${variables.length}.`);
assert(references.length === 40, `Expected 40 references, got ${references.length}.`);
assert(unique(variables), "Variable IDs must be unique.");
assert(unique(references), "Reference IDs must be unique.");
assert(variables.every((record) => record.section && record.name && record.unit), "Every variable requires a section, name, and unit.");
assert(references.every((record) => record.section && record.name && record.fields), "Every reference requires a section, name, and operational fields.");
assert(variables.some((record) => record.id === "VAR-TBE-010" && record.section === "Protection, Storage and Packaging"), "Crate material price must map to the Services variable section.");
assert(references.some((record) => record.id === "REF-TBE-007" && record.section === "Services"), "Crate materials reference must map to Services.");
assert(referencesHtml.includes('id="operationalReferencesRoot"'), "References must expose the operational references mount.");
assert(referencesRenderer.includes('id="vehiclesReferenceRoot"'), "Vehicles editor must mount inside the operational Vehicles section.");
assert(!referencesRenderer.includes("<details"), "Reference groups must render as one open screen, not collapsible blocks.");
assert(referencesRenderer.includes("text-blue-700"), "Operational variable cells must use blue read-only styling.");

console.log(JSON.stringify({
  status: "passed",
  variables: variables.length,
  references: references.length,
  variableSections: [...new Set(variables.map((record) => record.section))].length,
  referenceSections: [...new Set(references.map((record) => record.section))].length,
}));
