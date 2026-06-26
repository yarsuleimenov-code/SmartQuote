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
const visibleVariables = variables.filter((record) => record.visibleInVariables !== false);
const hiddenVariableIds = ["VAR-028", "VAR-TBE-019", "VAR-VEH-002", "VAR-VEH-007", "VAR-VEH-008", "VAR-FIT-004", "VAR-FIT-005", "VAR-FIT-006", "VAR-MRG-001", "VAR-MRG-002", "VAR-MRG-004", "VAR-RTE-001"];
assert(visibleVariables.length === 53, `Expected 53 business-visible variables, got ${visibleVariables.length}.`);
assert(hiddenVariableIds.every((id) => !visibleVariables.some((record) => record.id === id)), "Technical, duplicate, and governance-only variables must be hidden from Variables.");
assert(visibleVariables.some((record) => record.id === "VAR-TBE-018"), "Broker commission must remain visible in Variables.");
assert(visibleVariables.some((record) => record.id === "VAR-LAB-001"), "Minutes per cu ft must remain visible for business review.");
assert(visibleVariables.some((record) => record.id === "VAR-LAB-002"), "Minutes per lb must remain visible for business review.");
assert(visibleVariables.some((record) => record.id === "VAR-ACC-001"), "Free floor count must remain visible for business review.");
assert(visibleVariables.some((record) => record.id === "VAR-008" && record.displayName === "Pickup Curve Anchor Volume"), "Pickup Curve must expose the business anchor volume, not Formula A.");
assert(visibleVariables.some((record) => record.id === "VAR-009" && record.displayName === "Pickup Curve Anchor Time"), "Pickup Curve must expose the business anchor time, not Formula B.");
assert(visibleVariables.some((record) => record.id === "VAR-TIME-010" && record.displayName === "Pickup Time After Transition"), "Pickup Curve must expose the post-transition rate.");
assert(references.some((record) => record.id === "REF-TBE-007" && record.section === "Services"), "Crate materials reference must map to Services.");
assert(referencesHtml.includes('id="operationalReferencesRoot"'), "References must expose the operational references mount.");
assert(referencesRenderer.includes('id="vehiclesReferenceRoot"'), "Vehicles editor must mount inside the operational Vehicles section.");
assert(!referencesRenderer.includes("<details"), "Reference groups must render as one open screen, not collapsible blocks.");
assert(referencesRenderer.includes("text-blue-700"), "Operational variable cells must use blue read-only styling.");
assert(!referencesRenderer.includes("Broker and Dispatcher Compensation"), "Compensation must be maintained in Variables, not duplicated in References.");
assert(referencesRenderer.includes('table("Fuel Prices"'), "Fuel Prices must be shown in References, not Variables.");
const variablesRenderer = fs.readFileSync(path.join(root, "js", "variablesAdmin.js"), "utf8");
assert(variablesRenderer.includes('id="pickupTimeCurveMatrix"'), "Variables must render a business Pickup Time Curve matrix.");
assert(variablesRenderer.includes("Linear increment"), "Pickup Time Curve matrix must explain the post-threshold rule.");

console.log(JSON.stringify({
  status: "passed",
  variables: variables.length,
  visibleVariables: visibleVariables.length,
  references: references.length,
  variableSections: [...new Set(variables.map((record) => record.section))].length,
  referenceSections: [...new Set(references.map((record) => record.section))].length,
}));
