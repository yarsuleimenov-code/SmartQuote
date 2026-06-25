const fs = require("fs");
const vm = require("vm");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const asIsSource = fs.readFileSync("docs/formula-spec/as_is_formula_master.csv", "utf8");
const toBeSource = fs.readFileSync("docs/formula-spec/tobe_formula_master.csv", "utf8");
const asIsIds = [...asIsSource.matchAll(/^"([^"]+)"/gm)].map((match) => match[1]).filter((id) => id !== "Formula ID");
const toBeIds = [...toBeSource.matchAll(/^"([^"]+)"/gm)].map((match) => match[1]).filter((id) => id !== "ID");
const expectedIds = [...asIsIds, ...toBeIds];
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync("js/formulaMasterData.js", "utf8"), context);
vm.runInContext(fs.readFileSync("js/formulasCatalog.js", "utf8"), context);

const records = context.window.FormulaMasterData;
const actualIds = records.map((record) => record.id);
const missing = expectedIds.filter((id) => !actualIds.includes(id));
const duplicates = actualIds.filter((id, index) => actualIds.indexOf(id) !== index);
const html = fs.readFileSync("formulas.html", "utf8");
const renderer = fs.readFileSync("js/formulasCatalog.js", "utf8");

assert(records.length === expectedIds.length, `Expected ${expectedIds.length} formulas, received ${records.length}.`);
assert(records.length === 225, `Expected unified catalog with 225 formulas, received ${records.length}.`);
assert(asIsIds.every((id) => actualIds.includes(id)), "All AS-IS Formula IDs must be included.");
assert(toBeIds.every((id) => actualIds.includes(id)), "All TO-BE Formula IDs must be included.");
assert(missing.length === 0, `Missing formula IDs: ${missing.join(", ")}`);
assert(duplicates.length === 0, `Duplicate formula IDs: ${duplicates.join(", ")}`);
assert(records.every((record) => record.block && record.name && record.formula), "Every formula must include block, name, and expression.");
assert(html.includes("js/formulaMasterData.js"), "Formula masterdata asset must be loaded.");
assert(html.includes("js/formulasCatalog.js"), "Formula catalog renderer must be loaded.");
assert(renderer.includes("text-blue-700"), "Runtime variables must use blue differentiation.");
assert(renderer.includes("text-emerald-700"), "References must use green differentiation.");
assert(renderer.includes("text-slate-900"), "Formula expressions must use black differentiation.");
assert(context.window.FormulaCatalogMetadata.variableTerms.length > 0, "TO-BE variable terms must be included.");
assert(context.window.FormulaCatalogMetadata.referenceTerms.length > 0, "TO-BE reference terms must be included.");

const routeMatches = context.window.FormulaCatalog.filterRecords(records, "route", "all");
const exactIdMatch = context.window.FormulaCatalog.filterRecords(records, records[0].id, "all");
const selectedBlock = records[0].block;
const blockMatches = context.window.FormulaCatalog.filterRecords(records, "", selectedBlock);
assert(routeMatches.length > 0 && routeMatches.length < records.length, "Search must narrow the formula catalog.");
assert(exactIdMatch.length === 1, "Formula ID search must resolve a unique record.");
assert(blockMatches.length > 0 && blockMatches.every((record) => record.block === selectedBlock), "Block filter must return only the selected block.");

console.log(JSON.stringify({
  status: "passed",
  formulas: records.length,
  blocks: new Set(records.map((record) => record.block)).size,
  firstId: records[0].id,
  lastId: records[records.length - 1].id,
  routeSearchMatches: routeMatches.length,
  selectedBlock,
  selectedBlockMatches: blockMatches.length,
}, null, 2));
