import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve(import.meta.dirname, "..");
const specDir = path.join(root, "docs", "formula-spec");
const normalizedDir = path.join(specDir, "normalized");
const outputDir = path.join(root, "outputs", "masterdata-normalization");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const headers = rows.shift() || [];
  return { headers, rows };
}

async function readCsv(name) {
  return parseCsv(await fs.readFile(path.join(specDir, name), "utf8"));
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(headers, rows) {
  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}

function normalizeName(value) {
  return String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function containsTerm(text, term) {
  const normalizedText = ` ${normalizeName(text)} `;
  const normalizedTerm = normalizeName(term);
  return normalizedTerm.length >= 4 && normalizedText.includes(` ${normalizedTerm} `);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function isMissingValue(value) {
  return !String(value || "").trim() || /\b(tbd|unknown|not defined|needs data)\b/i.test(String(value));
}

function canonicalize(rows, kind) {
  const groups = new Map();
  rows.forEach((row) => {
    const name = row[2];
    const key = normalizeName(name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });

  const registry = [];
  const issues = [];
  groups.forEach((group, key) => {
    const preferred = group.find((row) => String(row[0]).toUpperCase() === "TO-BE") || group[0];
    const aliases = group.filter((row) => row !== preferred).map((row) => row[1]);
    const values = kind === "variable" ? unique(group.map((row) => row[4])) : [];
    const conflict = values.length > 1;
    const statusText = kind === "variable" ? preferred[9] : preferred[7];
    const missing = kind === "variable"
      ? isMissingValue(preferred[4])
      : /нуж|need|missing|risk|owner/i.test(String(statusText || ""));
    const assumption = missing
      ? kind === "variable"
        ? "Use documented example value when present; otherwise use 0 in test fixtures only."
        : "Use current local seed/reference fixture for tests; production source and owner remain required."
      : "";

    registry.push(kind === "variable" ? {
      canonicalId: preferred[1],
      name: preferred[2],
      description: preferred[3],
      currentOrExampleValue: preferred[4],
      unitOrType: preferred[5],
      source: preferred[6],
      usedIn: preferred[7],
      owner: preferred[8] || "Business owner to confirm",
      readiness: missing ? "Test Assumption" : "Ready",
      governance: preferred[10] || preferred[9],
      aliasIds: aliases.join("; "),
      sourceScopes: unique(group.map((row) => row[0])).join("; "),
      conflict: conflict ? "Yes" : "No",
      testAssumption: assumption,
    } : {
      canonicalId: preferred[1],
      name: preferred[2],
      description: preferred[3],
      keyFields: preferred[4],
      sourceOwner: preferred[5],
      usedIn: preferred[6],
      readiness: missing ? "Test Assumption" : "Ready",
      riskNote: preferred[7],
      aliasIds: aliases.join("; "),
      sourceScopes: unique(group.map((row) => row[0])).join("; "),
      conflict: group.length > 1 ? "Review aliases" : "No",
      testAssumption: assumption,
    });

    if (group.length > 1 || conflict) {
      issues.push({
        issueId: `${kind === "variable" ? "VAR" : "REF"}-NORM-${String(issues.length + 1).padStart(3, "0")}`,
        area: kind === "variable" ? "Variables" : "References",
        severity: conflict ? "P1" : "P2",
        type: conflict ? "Conflicting duplicate" : "Alias / duplicate name",
        entityIds: group.map((row) => row[1]).join("; "),
        entityName: preferred[2],
        finding: conflict
          ? `Multiple values found: ${values.join(" | ")}`
          : "Multiple IDs use the same normalized business name.",
        decision: `Use ${preferred[1]} as canonical; retain other IDs as aliases.`,
        testAssumption: assumption,
      });
    }
  });
  return { registry, issues };
}

const formulasSource = await readCsv("audit_all_formulas.csv");
const variablesSource = await readCsv("audit_all_variables.csv");
const referencesSource = await readCsv("audit_all_references.csv");
const constantsSource = await readCsv("formula_constants_audit.csv");
const mappingSource = await readCsv("business_formula_id_mapping.csv");
const executionSource = await readCsv("dev_execution_order.csv");

const { registry: variableRegistry, issues: variableIssues } = canonicalize(variablesSource.rows, "variable");
const { registry: referenceRegistry, issues: referenceIssues } = canonicalize(referencesSource.rows, "reference");

const constantLinks = new Map();
constantsSource.rows.forEach((row) => {
  if (!constantLinks.has(row[0])) constantLinks.set(row[0], []);
  constantLinks.get(row[0]).push(row[2]);
});
const relatedFormulaLinks = new Map();
mappingSource.rows.forEach((row) => {
  const businessId = row[0];
  const related = String(row[1] || "").split(/\s*\/\s*/).filter(Boolean);
  relatedFormulaLinks.set(businessId, related);
  related.forEach((id) => {
    if (!relatedFormulaLinks.has(id)) relatedFormulaLinks.set(id, []);
    relatedFormulaLinks.get(id).push(businessId);
  });
});

const formulaNameGroups = new Map();
formulasSource.rows.forEach((row) => {
  const key = normalizeName(row[3]);
  if (!formulaNameGroups.has(key)) formulaNameGroups.set(key, []);
  formulaNameGroups.get(key).push(row[1]);
});

const formulaRegistry = formulasSource.rows.map((row) => {
  const [scope, id, block, name, formula, description, level, source, output, sourceStatus, usedIn] = row;
  const searchable = [name, formula, description, source, output, usedIn].join(" ");
  const variableIds = unique([
    ...(constantLinks.get(id) || []),
    ...variableRegistry.filter((variable) => containsTerm(searchable, variable.name)).map((variable) => variable.canonicalId),
  ]);
  const referenceIds = unique(
    referenceRegistry.filter((reference) => containsTerm(searchable, reference.name)).map((reference) => reference.canonicalId),
  );
  const missingDependencies = [];
  if (/variable|coefficient|rate|threshold|fee/i.test(searchable) && variableIds.length === 0) missingDependencies.push("Variable mapping");
  if (/reference|dictionary|vehicle|zip|catalog|distance matrix|service area/i.test(searchable) && referenceIds.length === 0) missingDependencies.push("Reference mapping");
  const mappedVariables = variableRegistry.filter((variable) => variableIds.includes(variable.canonicalId));
  const mappedReferences = referenceRegistry.filter((reference) => referenceIds.includes(reference.canonicalId));
  const assumptionNeeded = [...mappedVariables, ...mappedReferences].some((entity) => entity.readiness !== "Ready") || missingDependencies.length > 0;
  const semanticDuplicates = formulaNameGroups.get(normalizeName(name)) || [];
  const relatedIds = unique([...(relatedFormulaLinks.get(id) || []), ...semanticDuplicates.filter((otherId) => otherId !== id)]);
  return {
    formulaId: id,
    block,
    name,
    formula,
    description,
    levelStage: level,
    inputSource: source,
    variableIds: variableIds.join("; "),
    referenceIds: referenceIds.join("; "),
    outputNext: output,
    usedIn,
    sourceScope: scope,
    implementationStatus: scope === "AS-IS" ? "Implemented / Baseline" : "Approved for Formula Sprint",
    dataReadiness: assumptionNeeded ? "Test Assumption" : "Ready",
    relatedFormulaIds: relatedIds.join("; "),
    testAssumption: assumptionNeeded
      ? "Use normalized registry example values and current local reference seeds for tests; replace with governed production values before release."
      : "",
    normalizationNotes: missingDependencies.length ? `Review mapping: ${missingDependencies.join(", ")}` : "",
  };
});

const dependencyRows = [];
formulaRegistry.forEach((formula) => {
  String(formula.variableIds).split(/;\s*/).filter(Boolean).forEach((id) => dependencyRows.push([
    formula.formulaId, formula.block, "Variable", id,
    variableRegistry.find((variable) => variable.canonicalId === id)?.name || "",
    "Input", formula.outputNext, formula.dataReadiness,
  ]));
  String(formula.referenceIds).split(/;\s*/).filter(Boolean).forEach((id) => dependencyRows.push([
    formula.formulaId, formula.block, "Reference", id,
    referenceRegistry.find((reference) => reference.canonicalId === id)?.name || "",
    "Input", formula.outputNext, formula.dataReadiness,
  ]));
  dependencyRows.push([
    formula.formulaId, formula.block, "Output", formula.formulaId,
    formula.name, "Calculated result", formula.outputNext, formula.dataReadiness,
  ]);
});

const formulaIssues = [];
formulaRegistry.forEach((formula) => {
  if (formula.relatedFormulaIds) {
    formulaIssues.push({
      issueId: `FOR-NORM-${String(formulaIssues.length + 1).padStart(3, "0")}`,
      area: "Formulas",
      severity: "P2",
      type: "Related / overlapping formula",
      entityIds: `${formula.formulaId}; ${formula.relatedFormulaIds}`,
      entityName: formula.name,
      finding: "Related formula IDs describe the same or a more detailed business concept.",
      decision: "Keep all Formula IDs for traceability; use Related Formula IDs as the implementation bridge.",
      testAssumption: "",
    });
  }
  if (formula.normalizationNotes) {
    formulaIssues.push({
      issueId: `FOR-NORM-${String(formulaIssues.length + 1).padStart(3, "0")}`,
      area: "Formulas",
      severity: "P1",
      type: "Dependency mapping gap",
      entityIds: formula.formulaId,
      entityName: formula.name,
      finding: formula.normalizationNotes,
      decision: "Use test assumption for Formula Sprint fixture; assign governed dependency before production.",
      testAssumption: formula.testAssumption,
    });
  }
});
const issues = [...formulaIssues, ...variableIssues, ...referenceIssues];

const implementationOrder = executionSource.rows.map((row) => ({
  step: Number(row[0]),
  executionBlock: row[1],
  formulaScope: row[2],
  inputsRequired: row[3],
  referencesRequired: row[4],
  variablesRequired: row[5],
  outputs: row[6],
  traceRequired: row[7],
  failureWarning: row[8],
  readiness: /tbd|missing|unknown/i.test(row.slice(3).join(" ")) ? "Test Assumption" : "Ready for Sprint",
}));

const formulaHeaders = [
  "Formula ID", "Block", "Name", "Formula", "Description", "Level / Stage", "Input / Source",
  "Variable IDs", "Reference IDs", "Output / Next", "Used In", "Source Scope", "Implementation Status",
  "Data Readiness", "Related Formula IDs", "Test Assumption", "Normalization Notes",
];
const formulaRows = formulaRegistry.map((item) => Object.values(item));
const variableHeaders = [
  "Canonical Variable ID", "Name", "Description", "Current / Example Value", "Unit / Type", "Source",
  "Used In", "Owner", "Data Readiness", "Governance", "Alias IDs", "Source Scopes", "Conflict", "Test Assumption",
];
const variableRows = variableRegistry.map((item) => Object.values(item));
const referenceHeaders = [
  "Canonical Reference ID", "Name", "Description", "Key Fields", "Source / Owner", "Used In",
  "Data Readiness", "Risk Note", "Alias IDs", "Source Scopes", "Conflict", "Test Assumption",
];
const referenceRows = referenceRegistry.map((item) => Object.values(item));
const dependencyHeaders = ["Formula ID", "Block", "Dependency Type", "Dependency ID", "Dependency Name", "Role", "Output / Next", "Data Readiness"];
const issueHeaders = ["Issue ID", "Area", "Severity", "Type", "Entity IDs", "Entity Name", "Finding", "Decision", "Test Assumption"];
const issueRows = issues.map((item) => Object.values(item));
const implementationHeaders = ["Step", "Execution Block", "Formula IDs / Scope", "Inputs Required", "References Required", "Variables Required", "Outputs", "Trace Required", "Failure / Warning", "Readiness"];
const implementationRows = implementationOrder.map((item) => Object.values(item));

await fs.mkdir(normalizedDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });
await Promise.all([
  fs.writeFile(path.join(normalizedDir, "formula_registry.csv"), toCsv(formulaHeaders, formulaRows), "utf8"),
  fs.writeFile(path.join(normalizedDir, "variable_registry.csv"), toCsv(variableHeaders, variableRows), "utf8"),
  fs.writeFile(path.join(normalizedDir, "reference_registry.csv"), toCsv(referenceHeaders, referenceRows), "utf8"),
  fs.writeFile(path.join(normalizedDir, "dependency_map.csv"), toCsv(dependencyHeaders, dependencyRows), "utf8"),
  fs.writeFile(path.join(normalizedDir, "normalization_issues.csv"), toCsv(issueHeaders, issueRows), "utf8"),
  fs.writeFile(path.join(normalizedDir, "implementation_order.csv"), toCsv(implementationHeaders, implementationRows), "utf8"),
]);

const workbook = Workbook.create();
const navy = "#0F172A";
const blue = "#1D4ED8";
const green = "#047857";
const lightBlue = "#DBEAFE";
const lightGreen = "#D1FAE5";
const lightAmber = "#FEF3C7";
const lightRed = "#FEE2E2";
const border = "#CBD5E1";

function styleTitle(sheet, title, subtitle, endColumn) {
  sheet.showGridLines = false;
  sheet.getRange(`A1:${endColumn}1`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange("A1").format = { fill: navy, font: { color: "#FFFFFF", bold: true, size: 18 }, rowHeight: 30 };
  sheet.getRange(`A2:${endColumn}2`).merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange("A2").format = { fill: "#E2E8F0", font: { color: "#475569", italic: true }, wrapText: true, rowHeight: 32 };
}

function writeTable(sheet, startRow, headers, rows, tableName, widths = []) {
  const start = startRow;
  const endRow = start + rows.length;
  const endCol = String.fromCharCode(64 + headers.length);
  sheet.getRange(`A${start}:${endCol}${endRow}`).values = [headers, ...rows];
  sheet.getRange(`A${start}:${endCol}${start}`).format = {
    fill: navy,
    font: { color: "#FFFFFF", bold: true },
    wrapText: true,
    rowHeight: 30,
    borders: { preset: "outside", style: "thin", color: border },
  };
  sheet.getRange(`A${start}:${endCol}${endRow}`).format.wrapText = true;
  sheet.getRange(`A${start}:${endCol}${endRow}`).format.verticalAlignment = "top";
  sheet.getRange(`A${start}:${endCol}${endRow}`).format.borders = {
    insideHorizontal: { style: "thin", color: "#E2E8F0" },
    bottom: { style: "thin", color: border },
  };
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, endRow, 1).format.columnWidth = width;
  });
  sheet.freezePanes.freezeRows(start);
  const table = sheet.tables.add(`A${start}:${endCol}${endRow}`, true, tableName);
  table.style = "TableStyleMedium2";
  table.showFilterButton = true;
  return { endRow, endCol };
}

const summary = workbook.worksheets.add("Summary");
styleTitle(summary, "SmartQuote Masterdata Normalization", "Canonical registries for Formula Sprint. P0 formulas are treated as approved; missing business data uses explicit test assumptions.", "H");
summary.getRange("A4:B11").values = [
  ["Metric", "Value"],
  ["Formula rows", null],
  ["Canonical variables", null],
  ["Canonical references", null],
  ["Dependency links", null],
  ["Normalization issues", null],
  ["Test assumptions", null],
  ["Formula Sprint status", "Ready with documented assumptions"],
];
summary.getRange("B5").formulas = [["=COUNTA('Formula Registry'!A4:A228)"]];
summary.getRange("B6").formulas = [["=COUNTA('Variable Registry'!A4:A500)"]];
summary.getRange("B7").formulas = [["=COUNTA('Reference Registry'!A4:A200)"]];
summary.getRange("B8").formulas = [["=COUNTA('Dependency Map'!A4:A2000)"]];
summary.getRange("B9").formulas = [["=COUNTA('Issues & Assumptions'!A4:A1000)"]];
summary.getRange("B10").formulas = [["=COUNTIF('Formula Registry'!N4:N228,\"Test Assumption\")"]];
summary.getRange("A4:B4").format = { fill: navy, font: { color: "#FFFFFF", bold: true } };
summary.getRange("A5:A11").format.font = { bold: true, color: "#334155" };
summary.getRange("B5:B10").format.numberFormat = "#,##0";
summary.getRange("A4:B11").format.borders = { preset: "all", style: "thin", color: border };
summary.getRange("A13:H18").values = [
  ["Normalization Rule", "Decision", "", "", "", "", "", ""],
  ["Formula rows", "Keep all 225 Formula IDs for traceability; link overlaps instead of deleting formulas.", "", "", "", "", "", ""],
  ["Variables", "Use TO-BE row as canonical when the same business name exists; preserve AS-IS IDs as aliases.", "", "", "", "", "", ""],
  ["References", "Use TO-BE row as canonical when names overlap; preserve current local sources as test fixtures.", "", "", "", "", "", ""],
  ["Missing values", "TBD values receive explicit test assumptions and cannot be treated as production-approved numbers.", "", "", "", "", "", ""],
  ["Pricing engine", "No changes to js/calculator.js or active formulas in this normalization stage.", "", "", "", "", "", ""],
];
for (let row = 13; row <= 18; row += 1) summary.getRange(`B${row}:H${row}`).merge();
summary.getRange("A13:H13").format = { fill: blue, font: { color: "#FFFFFF", bold: true } };
summary.getRange("A14:H18").format = { wrapText: true, borders: { preset: "all", style: "thin", color: border } };
summary.getRange("A:A").format.columnWidth = 24;
summary.getRange("B:H").format.columnWidth = 18;
summary.freezePanes.freezeRows(3);

const formulaSheet = workbook.worksheets.add("Formula Registry");
styleTitle(formulaSheet, "Formula Registry", "225 normalized formula rows with canonical dependency IDs, outputs, readiness, and test assumptions.", "Q");
writeTable(formulaSheet, 3, formulaHeaders, formulaRows, "FormulaRegistryTable", [18, 22, 28, 44, 48, 18, 40, 28, 28, 34, 26, 14, 24, 18, 28, 44, 28]);
formulaSheet.getRange(`H4:H${formulaRows.length + 3}`).format.font = { color: blue };
formulaSheet.getRange(`I4:I${formulaRows.length + 3}`).format.font = { color: green };
formulaSheet.getRange(`N4:N${formulaRows.length + 3}`).conditionalFormats.add("containsText", { text: "Test Assumption", format: { fill: lightAmber, font: { color: "#92400E" } } });

const variableSheet = workbook.worksheets.add("Variable Registry");
styleTitle(variableSheet, "Variable Registry", "Canonical variables. Duplicate AS-IS IDs are retained as aliases; TBD values are test-only assumptions.", "N");
writeTable(variableSheet, 3, variableHeaders, variableRows, "VariableRegistryTable", [22, 24, 45, 20, 16, 34, 28, 20, 18, 38, 22, 16, 12, 44]);
variableSheet.getRange(`A4:A${variableRows.length + 3}`).format.font = { color: blue, bold: true };
variableSheet.getRange(`I4:I${variableRows.length + 3}`).conditionalFormats.add("containsText", { text: "Test Assumption", format: { fill: lightAmber, font: { color: "#92400E" } } });
variableSheet.getRange(`M4:M${variableRows.length + 3}`).conditionalFormats.add("containsText", { text: "Yes", format: { fill: lightRed, font: { color: "#991B1B" } } });

const referenceSheet = workbook.worksheets.add("Reference Registry");
styleTitle(referenceSheet, "Reference Registry", "Canonical references and test-fixture rules. Production ownership/source gaps remain visible.", "L");
writeTable(referenceSheet, 3, referenceHeaders, referenceRows, "ReferenceRegistryTable", [22, 26, 45, 38, 34, 28, 18, 42, 22, 16, 16, 44]);
referenceSheet.getRange(`A4:A${referenceRows.length + 3}`).format.font = { color: green, bold: true };
referenceSheet.getRange(`G4:G${referenceRows.length + 3}`).conditionalFormats.add("containsText", { text: "Test Assumption", format: { fill: lightAmber, font: { color: "#92400E" } } });

const dependencySheet = workbook.worksheets.add("Dependency Map");
styleTitle(dependencySheet, "Formula Dependency Map", "Exploded Formula -> Variable / Reference / Output links for implementation and trace generation.", "H");
writeTable(dependencySheet, 3, dependencyHeaders, dependencyRows, "DependencyMapTable", [22, 24, 18, 24, 28, 18, 38, 18]);
dependencySheet.getRange(`C4:C${dependencyRows.length + 3}`).conditionalFormats.add("containsText", { text: "Variable", format: { fill: lightBlue, font: { color: blue } } });
dependencySheet.getRange(`C4:C${dependencyRows.length + 3}`).conditionalFormats.add("containsText", { text: "Reference", format: { fill: lightGreen, font: { color: green } } });

const issuesSheet = workbook.worksheets.add("Issues & Assumptions");
styleTitle(issuesSheet, "Normalization Issues & Test Assumptions", "No issue blocks test implementation. P1 items require governed mapping/value before production release.", "I");
writeTable(issuesSheet, 3, issueHeaders, issueRows, "NormalizationIssuesTable", [18, 16, 10, 26, 32, 28, 48, 48, 48]);
issuesSheet.getRange(`C4:C${issueRows.length + 3}`).conditionalFormats.add("containsText", { text: "P1", format: { fill: lightRed, font: { color: "#991B1B", bold: true } } });
issuesSheet.getRange(`C4:C${issueRows.length + 3}`).conditionalFormats.add("containsText", { text: "P2", format: { fill: lightAmber, font: { color: "#92400E" } } });

const orderSheet = workbook.worksheets.add("Implementation Order");
styleTitle(orderSheet, "Formula Sprint Implementation Order", "Recommended execution sequence after normalization. Each block must emit trace and preserve snapshot compatibility.", "J");
writeTable(orderSheet, 3, implementationHeaders, implementationRows, "ImplementationOrderTable", [8, 26, 32, 38, 34, 34, 32, 14, 38, 18]);
orderSheet.getRange(`J4:J${implementationRows.length + 3}`).conditionalFormats.add("containsText", { text: "Test Assumption", format: { fill: lightAmber, font: { color: "#92400E" } } });

const inspect = await workbook.inspect({
  kind: "table",
  range: "Summary!A1:H18",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 10,
});
console.log(inspect.ndjson);

const errorScan = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "normalization workbook formula error scan",
});
console.log(errorScan.ndjson);

for (const sheetName of ["Summary", "Formula Registry", "Variable Registry", "Reference Registry", "Dependency Map", "Issues & Assumptions", "Implementation Order"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 0.8, format: "png" });
  await fs.writeFile(path.join(outputDir, `${sheetName.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
const workbookPath = path.join(outputDir, "SmartQuote_Masterdata_Normalization.xlsx");
await xlsx.save(workbookPath);

console.log(JSON.stringify({
  workbookPath,
  formulas: formulaRows.length,
  variables: variableRows.length,
  references: referenceRows.length,
  dependencies: dependencyRows.length,
  issues: issueRows.length,
  implementationSteps: implementationRows.length,
}, null, 2));
