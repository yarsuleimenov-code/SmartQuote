const fs = require("fs");
const path = require("path");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function countRows(file) {
  const text = fs.readFileSync(file, "utf8");
  return text.trim().split(/\r?\n/).length - 1;
}

const base = path.join("docs", "formula-spec", "normalized");
const files = {
  formulas: path.join(base, "formula_registry.csv"),
  variables: path.join(base, "variable_registry.csv"),
  references: path.join(base, "reference_registry.csv"),
  dependencies: path.join(base, "dependency_map.csv"),
  issues: path.join(base, "normalization_issues.csv"),
  order: path.join(base, "implementation_order.csv"),
};

Object.values(files).forEach((file) => assert(fs.existsSync(file), `Missing normalized artifact: ${file}`));
assert(countRows(files.formulas) === 225, "Formula Registry must contain 225 formulas.");
assert(countRows(files.variables) > 100, "Variable Registry must contain normalized variables.");
assert(countRows(files.references) >= 40, "Reference Registry must contain normalized references.");
assert(countRows(files.dependencies) >= 225, "Dependency Map must include at least one output link per formula.");
assert(countRows(files.order) >= 10, "Implementation Order must contain Formula Sprint steps.");

const formulas = fs.readFileSync(files.formulas, "utf8");
assert(formulas.includes("SYS-001"), "AS-IS formulas must be retained.");
assert(formulas.includes("TBE-FLOW-001"), "TO-BE formulas must be retained.");
assert(formulas.includes("Approved for Formula Sprint"), "TO-BE formulas must reflect P0 approval.");
assert(formulas.includes("Test Assumption"), "Missing data must be explicitly marked as a test assumption.");

console.log(JSON.stringify({
  status: "passed",
  formulas: countRows(files.formulas),
  variables: countRows(files.variables),
  references: countRows(files.references),
  dependencies: countRows(files.dependencies),
  issues: countRows(files.issues),
  implementationSteps: countRows(files.order),
}, null, 2));
