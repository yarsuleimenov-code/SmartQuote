const fs = require("fs");
const vm = require("vm");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const localStorage = {
  getItem() { return null; },
  setItem() {},
};
const context = { window: { localStorage } };
vm.createContext(context);
vm.runInContext(fs.readFileSync("js/coverageZipData.js", "utf8"), context, {
  filename: "js/coverageZipData.js",
});
vm.runInContext(fs.readFileSync("js/zipCoverage.js", "utf8"), context, {
  filename: "js/zipCoverage.js",
});
vm.runInContext(fs.readFileSync("js/zoneZipMap.js", "utf8"), context, {
  filename: "js/zoneZipMap.js",
});

const source = context.window.CoverageZipData;
const records = source?.records || [];
const zones = new Set(records.map((record) => record.zone));
const regions = new Set(records.map((record) => record.region));
const zipCodes = records.map((record) => record.zip);
const activeZipMap = context.window.CalculatorZoneZipMap;
const html = fs.readFileSync("coverage-zips.html", "utf8");
const ui = fs.readFileSync("js/coverageZips.js", "utf8");
const coverageAdapter = fs.readFileSync("js/zipCoverage.js", "utf8");
const sidebar = fs.readFileSync("sidebar.js", "utf8");
const middleware = fs.readFileSync("functions/_middleware.js", "utf8");

assert(source.sourceFile === "coverage_zip_route_zone_map.xlsx", "Expected workbook source metadata.");
assert(source.sourceSheet === "zone_zip_map", "Expected zone_zip_map source sheet.");
assert(records.length === 2607, "Expected 2,607 ZIP coverage records.");
assert(Object.keys(activeZipMap).length === 2607, "Expected active calculator ZIP map to use only 2,607 coverage ZIPs.");
assert(zipCodes.every((zip) => activeZipMap[zip]), "Expected every coverage ZIP in the active calculator map.");
assert(new Set(zipCodes).size === records.length, "Expected unique ZIP codes.");
assert(zipCodes.every((zip) => /^\d{5}$/.test(zip)), "Expected five-digit ZIP strings.");
assert(zones.size === 11, "Expected 11 coverage zones.");
assert(regions.size === 2 && regions.has("CA") && regions.has("NY"), "Expected CA and NY regions.");
assert(records.some((record) => record.zip === "90049" && record.zone === "CA (A)"), "Expected CA coverage sample.");
assert(records.some((record) => record.zip === "11694" && record.zone === "NYC"), "Expected NY coverage sample.");

[
  "coverageZipSearch",
  "coverageZoneFilter",
  "coverageStatusFilter",
  "coverageClearFilters",
  "coverageZipRows",
  "coverageEmptyState",
].forEach((id) => {
  assert(html.includes(`id="${id}"`), `Expected coverage UI element ${id}.`);
});

assert(ui.includes("record.zip.startsWith(search)"), "Expected ZIP prefix search.");
assert(ui.includes("record.zone === zone"), "Expected zone filtering.");
assert(ui.includes("const pageSize = 100"), "Expected paginated rendering.");
assert(ui.includes("window.ZipCoverage.storageKey"), "Expected shared ZIP coverage storage adapter.");
assert(ui.includes('value: "covered"'), "Expected Covered status.");
assert(ui.includes('value: "disabled"'), "Expected Excluded compatibility status.");
assert(ui.includes('value: "approval_required"'), "Expected Review compatibility status.");
assert(ui.includes("✅ Covered"), "Expected Covered status label.");
assert(ui.includes("⛔ Excluded"), "Expected Excluded status label.");
assert(ui.includes("⚠ Review"), "Expected Review status label.");
assert(ui.includes("applyStatusStyle"), "Expected selected status visual styling.");
assert(ui.includes("const zoneBadgeClasses"), "Expected stable zone badge color mapping.");
[
  "Boston",
  "CA (A)",
  "CA (C)",
  "CA (D)",
  "CA (LA)",
  "CA (SF)",
  "NY (DC)",
  "NY (LI)",
  "NY (NORTH)",
  "NY (SOUTH)",
  "NYC",
].forEach((zone) => {
  assert(ui.includes(`"${zone}"`), `Expected badge color mapping for ${zone}.`);
});
assert(ui.includes("zoneBadgeClassName(record.zone)"), "Expected Assigned Zone badges to use zone colors.");
assert(coverageAdapter.includes("const defaultPriceCoefficient = 1"), "Expected default ZIP coefficient 1.0.");
assert(ui.includes("zip-coefficient-input"), "Expected editable future ZIP coefficient.");
assert(ui.includes("Math.min(2, Math.max(0.5"), "Expected coefficient validation between 0.50 and 2.00.");
assert(html.includes("ZIP Coefficient"), "Expected ZIP coefficient table column.");
assert(html.includes("Coverage"), "Expected Coverage table column.");
assert(html.includes('aria-live="polite"'), "Expected accessible save status announcements.");
assert(sidebar.includes('href: "coverage-zips.html"'), "Expected ZIP Coverage navigation.");
assert(middleware.includes('"/coverage-zips.html"'), "Expected admin middleware protection.");

console.log(JSON.stringify({
  records: records.length,
  zones: zones.size,
  regions: Array.from(regions).sort(),
  uniqueZipCodes: new Set(zipCodes).size,
  pageSize: 100,
}, null, 2));
