const fs = require("fs");
const path = require("path");

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
  return {
    headers,
    rows,
  };
}

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "docs", "formula-spec", "tobe_formula_master.csv");
const variablesPath = path.join(root, "docs", "formula-spec", "tobe_variables_governance.csv");
const referencesPath = path.join(root, "docs", "formula-spec", "tobe_reference_sources.csv");
const outputPath = path.join(root, "js", "formulaMasterData.js");
const source = parseCsv(fs.readFileSync(sourcePath, "utf8"));
const variables = parseCsv(fs.readFileSync(variablesPath, "utf8"));
const references = parseCsv(fs.readFileSync(referencesPath, "utf8"));

const records = source.rows.map((record) => ({
  id: record[0],
  block: record[1],
  name: record[2],
  formula: record[3],
  description: record[4],
  source: record[5],
  output: record[6],
  level: "Target Architecture",
  usedIn: record[6],
}));
const variableTerms = variables.rows.map((record) => record[1]).filter(Boolean);
const referenceTerms = references.rows.map((record) => record[1]).filter(Boolean);

const output = `// Generated from docs/formula-spec/tobe_formula_master.csv.\n` +
  `// Run: node tools/build_formula_catalog.js\n` +
  `window.FormulaMasterData = ${JSON.stringify(records, null, 2)};\n` +
  `window.FormulaCatalogMetadata = ${JSON.stringify({ variableTerms, referenceTerms }, null, 2)};\n`;

fs.writeFileSync(outputPath, output, "utf8");
console.log(JSON.stringify({ source: sourcePath, output: outputPath, formulas: records.length }, null, 2));
