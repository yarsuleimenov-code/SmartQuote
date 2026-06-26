(function () {
  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function money(value, digits = 2) {
    return `$${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
  }

  function status(value) {
    const approved = value === "Active" || value === "Ready";
    return `<span class="rounded-full px-2 py-1 text-xs font-semibold ${approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}">${escapeHtml(value)}</span>`;
  }

  function variableCell(value) {
    return { value: escapeHtml(value), variable: true };
  }

  function renderCell(cell) {
    if (cell && typeof cell === "object" && cell.variable) {
      return `<span class="inline-flex min-w-[68px] rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-medium text-blue-700">${cell.value}</span>`;
    }
    return cell;
  }

  function table(title, description, columns, rows, emptyMessage = "No approved rows configured yet.") {
    return `
      <article class="mb-4 overflow-hidden rounded-lg border border-slate-200">
        <div class="border-b border-slate-200 bg-slate-50 px-4 py-3"><h4 class="font-semibold text-slate-800">${escapeHtml(title)}</h4><p class="mt-1 text-xs text-slate-400">${escapeHtml(description)}</p></div>
        <div class="overflow-x-auto"><table class="w-full min-w-[760px] text-sm"><thead class="bg-white text-slate-500"><tr>${columns.map((column) => `<th class="px-4 py-3 text-left">${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody class="divide-y divide-slate-200">${rows.length ? rows.map((row) => `<tr>${row.map((cell) => `<td class="px-4 py-3 text-slate-700">${renderCell(cell)}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${columns.length}" class="px-4 py-4 text-slate-500">${escapeHtml(emptyMessage)}</td></tr>`}</tbody></table></div>
      </article>`;
  }

  function group(title, description, content) {
    return `<section class="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white"><div class="border-b border-slate-200 px-5 py-4"><h3 class="font-bold text-slate-800">${escapeHtml(title)}</h3><p class="mt-1 text-xs text-slate-400">${escapeHtml(description)}</p></div><div class="p-5">${content}</div></section>`;
  }

  function matrixTable(vars) {
    const zones = Object.keys(vars.distanceMatrix || {});
    return `
      <article class="overflow-hidden rounded-lg border border-slate-200">
        <div class="border-b border-slate-200 bg-slate-50 px-4 py-3"><h4 class="font-semibold text-slate-800">Distance Matrix</h4><p class="mt-1 text-xs text-slate-400">Approved average route miles used by the current calculator.</p></div>
        <div class="overflow-x-auto"><table class="w-full min-w-[900px] text-sm"><thead class="bg-white text-slate-500"><tr><th class="px-4 py-3 text-left">From / To</th>${zones.map((zone) => `<th class="px-4 py-3 text-right">${escapeHtml(zone)}</th>`).join("")}</tr></thead><tbody class="divide-y divide-slate-200">${zones.map((origin) => `<tr><td class="px-4 py-3 font-semibold text-slate-800">${escapeHtml(origin)}</td>${zones.map((destination) => `<td class="px-4 py-3 text-right text-slate-700">${renderCell(variableCell(`${Number(vars.distanceMatrix?.[origin]?.[destination] || 0).toLocaleString("en-US")} mi`))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      </article>`;
  }

  function itemCatalogRows() {
    return (window.ReferenceItemCatalog?.active?.() || []).filter((item) => item.id !== "custom").map((item) => [
      escapeHtml(item.name),
      variableCell(`${item.length} x ${item.width} x ${item.height} in`),
      variableCell(`${item.weight} lb`),
      variableCell(item.packaging),
      variableCell(item.flags || "Standard"),
      status("Active"),
    ]);
  }

  function serviceAreas() {
    return [
      ["NYC", variableCell("East Coast"), variableCell("Both"), variableCell(money(45)), variableCell(money(25)), variableCell(money(40)), variableCell(money(60)), variableCell("Dense urban zone"), status("Active")],
      ["NY Area", variableCell("East Coast"), variableCell("Both"), variableCell(money(25)), variableCell(money(10)), variableCell(money(0)), variableCell(money(30)), variableCell("General NY metro area"), status("Active")],
      ["Boston", variableCell("East Coast"), variableCell("Both"), variableCell(money(18)), variableCell(money(0)), variableCell(money(0)), variableCell(money(20)), variableCell("Standard city zone"), status("Active")],
      ["Washington DC", variableCell("East Coast"), variableCell("Both"), variableCell(money(20)), variableCell(money(0)), variableCell(money(0)), variableCell(money(20)), variableCell("Standard city zone"), status("Active")],
      ["CA South", variableCell("West Coast"), variableCell("Both"), variableCell(money(0)), variableCell(money(0)), variableCell(money(0)), variableCell(money(30)), variableCell("West coast zone"), status("Active")],
    ];
  }

  function packagingRows(vars) {
    const minutes = { None: 0, "Blanket Wrap": 10, "Bubble Protection": 15, "TV / Monitor Box": 20, "Custom Crate": "TBD" };
    return Object.entries(vars.packagingRates || {}).map(([name, rate]) => [escapeHtml(name), variableCell(money(rate)), variableCell(String(minutes[name] ?? "TBD")), status("Active")]);
  }

  function protectionRows(vars) {
    return Object.entries(vars.protectionPlans || {}).map(([name, plan]) => [escapeHtml(name), variableCell(`${Number(plan.rate || 0) * 100}%`), variableCell(money(plan.fixedFee)), name === "Basic Liability" ? "Included" : "Declared value", status("Active")]);
  }

  function fuelRows(vars) {
    return (vars.fuelPrices || []).map((fuel) => [
      escapeHtml(fuel.fuelType),
      variableCell(money(fuel.currentAvg, 3)),
      variableCell(`${Number(fuel.fuelSurchargePct || 0)}%`),
      variableCell(money(fuel.internalFuelPrice, 4)),
      status("Active"),
    ]);
  }

  function storageRows(vars) {
    const branchByArea = { NYC: "East Coast Branch", "NY Area": "East Coast Branch", Boston: "East Coast Branch", "Washington DC": "East Coast Branch", "CA South": "West Coast Branch" };
    return serviceAreas().map(([area, region]) => [area, variableCell(branchByArea[area] || region), variableCell(money(vars.settings?.storagePerCuFtPerDay, 4)), "per cu ft / day", status("Test assumption")]);
  }

  function crewRules() {
    return [
      ["One-person item limit", variableCell("Up to 125 lb"), variableCell("1 person"), "No", status("Active")],
      ["Standard team limit", variableCell("126-250 lb"), variableCell("2 people"), "No", status("Active")],
      ["Helper review", variableCell("Over 250 lb"), variableCell("2+ people"), "Required", status("Active")],
    ];
  }

  function laborRows(vars) {
    const hourlyWage = Number(vars.settings?.wagePerMinute || 0) * 60;
    return [
      ["Mover / Helper", variableCell(money(hourlyWage)), "per hour", "Current wage baseline", status("Test assumption")],
      ["Special Labor", variableCell(money(50)), "per hour", "CFO-approved MVP rate", status("Active")],
    ];
  }

  function warningRows(vars) {
    return Object.entries(vars.warningRules || {}).map(([rule, value]) => [escapeHtml(rule.replace(/([a-z])([A-Z])/g, "$1 $2")), variableCell(String(value)), "Review", status("Active")]);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("operationalReferencesRoot");
    const vars = window.CalculatorVariables || {};
    if (!root) return;
    root.innerHTML = `
      <section class="mb-6 rounded-xl border border-slate-200 bg-white p-5"><div class="flex flex-wrap items-start justify-between gap-4"><div><div class="flex items-center gap-3"><h2 class="text-xl font-bold text-slate-800">Operational References</h2><span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Read-only MVP</span></div><p class="mt-2 text-sm text-slate-500">Operational tables only. System registries and duplicate reference records are intentionally hidden.</p></div><div class="text-right text-sm text-slate-500"><p>Editing is limited to existing supported tables.</p><p>New tables are read-only until governance is approved.</p></div></div></section>
      ${group("Route and Coverage", "Route mileage and branch-level service data.", matrixTable(vars) + table("Service Areas", "Regional charges are captured for operations review and are not active in pricing.", ["Service Area", "Region", "Applies To", "Toll Fee", "Parking Fee", "Ticket Risk", "Zone Surcharge", "Notes", "Status"], serviceAreas(), ""))}
      ${group("Vehicles", "Fleet capacity, body dimensions, doors, and equipment.", '<div id="vehiclesReferenceRoot"></div>' + table("Capacity Economics", "Future capacity pricing inputs. No approved data is configured.", ["Route Type", "Capacity Rate", "Utilization Threshold", "Premium Multiplier", "Status"], []))}
      ${group("Items and Handling", "Catalog defaults, handling thresholds, and access constraints.", table("Item Catalog", "Broker-facing item defaults used by Quick Quote and Full Quote.", ["Item", "Dimensions", "Weight", "Packaging", "Flags", "Status"], itemCatalogRows()) + table("Item Handling and Crew Rules", "Handling limits used for operational review. No new price impact is active.", ["Rule", "Weight Band", "Minimum Crew", "Helpers", "Status"], crewRules()) + table("Physical Access Rules", "Future dimensional and access feasibility controls.", ["Access Type", "Dimension Limit", "Doorway", "Review Rule", "Status"], []))}
      ${group("Services", "Fuel, packaging, protection, storage, and crate reference data.", table("Fuel Prices", "Runtime fuel reference used by fuel cost per mile. Values are maintained in Pricing Admin.", ["Fuel Type", "Current Avg.", "Fuel Surcharge", "Internal Fuel Price", "Status"], fuelRows(vars)) + table("Packaging Rates", "Current packaging rate plus captured packing time for future labor calculations.", ["Packaging", "Rate", "Packing Minutes", "Status"], packagingRows(vars)) + table("Protection Plans", "Protection configuration used by current RV/FVP selection.", ["Plan", "Rate", "Fixed Fee", "Basis", "Status"], protectionRows(vars)) + table("Storage Rates by Branch", "Current test-mode storage rates. Branch selection is not yet active in pricing.", ["Service Area", "Branch", "Rate", "Unit", "Status"], storageRows(vars)) + table("Crate Materials and Labor", "Test-mode inputs for future Custom Crate pricing. They do not affect quotes yet.", ["Material", "Material Cost / sq ft", "Labor Cost / sq ft", "Waste %", "Labor Min / sq ft", "Minimum Labor", "Hardware Cost", "Vendor", "Status"], [["Standard plywood crate", variableCell(money(2.5)), variableCell(money(4.5)), variableCell("15%"), variableCell("6"), variableCell("30 min"), variableCell(money(12)), "Local vendor", status("Test assumption")]]))}
      ${group("People and Operations", "Labor baseline used for operational review. Compensation values are maintained in Variables.", table("Labor Roles and Wage Rates", "Current baseline values; compensation plans remain outside active pricing.", ["Role", "Rate", "Unit", "Notes", "Status"], laborRows(vars)))}
      ${group("Warnings and Approval", "Operational thresholds used by quote readiness and review.", table("Warning Rules", "Current thresholds are shown for review. Approval enforcement remains disabled.", ["Rule", "Threshold", "Action", "Status"], warningRows(vars)))}`;
  });
})();
