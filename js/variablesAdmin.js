(function () {
  function money(value, digits = 2) {
    return `$${Number(value || 0).toFixed(digits)}`;
  }

  function percent(value, digits = 2) {
    return `${(Number(value || 0) * 100).toFixed(digits)}%`;
  }

  function safeText(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function runtimeInput(value, suffix = "") {
    return `
      <div class="flex items-center gap-2">
        <input class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700" value="${safeText(value)}" disabled />
        ${suffix ? `<span class="text-xs text-slate-400">${safeText(suffix)}</span>` : ""}
      </div>
    `;
  }

  function section(title, description, body) {
    return `
      <section class="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div class="mb-4">
          <h3 class="font-bold text-slate-800">${safeText(title)}</h3>
          <p class="text-sm text-slate-500 mt-1">${safeText(description)}</p>
        </div>
        ${body}
      </section>
    `;
  }

  function table(headers, rows) {
    return `
      <div class="overflow-x-auto border border-slate-200 rounded-xl">
        <table class="w-full text-sm min-w-[860px]">
          <thead class="bg-slate-50 text-slate-500">
            <tr>${headers.map((header) => `<th class="text-left px-4 py-3">${safeText(header)}</th>`).join("")}</tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${rows.join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function row(cells) {
    return `<tr>${cells.map((cell) => `<td class="px-4 py-3 align-top">${cell}</td>`).join("")}</tr>`;
  }

  function defaultFuelPrices() {
    return [
      {
        fuelType: "Regular",
        currentAvg: 4.555,
        fuelSurchargePct: 10,
        internalFuelPrice: 5.0105,
        updatedAt: window.CalculatorVariables?.updatedAt || "",
        updatedBy: window.CalculatorVariables?.updatedBy || "System",
      },
      {
        fuelType: "Diesel",
        currentAvg: 5.652,
        fuelSurchargePct: 10,
        internalFuelPrice: 6.2172,
        updatedAt: window.CalculatorVariables?.updatedAt || "",
        updatedBy: window.CalculatorVariables?.updatedBy || "System",
      },
    ];
  }

  function readFuelPrices() {
    return window.PricingConfig?.readStorageBucket?.("fuelPrices", defaultFuelPrices()) || defaultFuelPrices();
  }

  function calculateInternalFuelPrice(fuel) {
    const currentAvg = Number(fuel.currentAvg || 0);
    const fuelSurchargePct = Number(fuel.fuelSurchargePct || 0);
    return currentAvg * (1 + fuelSurchargePct / 100);
  }

  function renderHeader(vars) {
    const snapshot = window.PricingConfig?.snapshot?.() || {};
    return `
      <section class="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div class="flex justify-between items-start gap-6">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-slate-800">Pricing Variables</h1>
              <span class="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-semibold">Runtime-driven</span>
              <span class="px-3 py-1 text-xs rounded-full bg-amber-100 text-amber-700 font-semibold">Read-only MVP</span>
            </div>
            <p class="text-sm text-slate-500 mt-2 max-w-4xl">
              Values below are loaded from the active runtime configuration. Save is disabled until preview and versioning are enabled.
            </p>
          </div>
          <div class="text-right text-sm text-slate-500">
            <p>Formula: <b class="text-slate-700">${safeText(snapshot.formulaVersion || vars.formulaVersion || "-")}</b></p>
            <p>Variables: <b class="text-slate-700">${safeText(snapshot.variablesVersion || vars.variablesVersion || "-")}</b></p>
            <p>Updated by: <b class="text-slate-700">${safeText(snapshot.updatedBy || vars.updatedBy || "-")}</b></p>
          </div>
        </div>
      </section>
    `;
  }

  function renderPricing(settings) {
    const rows = [
      ["Margin Rate", percent(settings.marginRate), "Used in stage margin"],
      ["Rounding Increment", money(settings.rounding, 0), "Final price ceiling increment"],
      ["Priority Date Fee", money(settings.priorityDateFee, 0), "Additional option fee"],
      ["Storage Per Cu Ft / Day", money(settings.storagePerCuFtPerDay, 5), "Storage calculation"],
      ["Packaging Per Shipment", money(settings.packagingPerShipment), "Shipment-level handling base"],
      ["Exclusive Delivery Multiplier", `${Number(settings.exclusiveDeliveryMultiplier || 0).toFixed(2)}x`, "Exclusive delivery operational multiplier"],
    ].map(([name, value, note]) => row([
      `<span class="font-medium text-slate-800">${safeText(name)}</span>`,
      runtimeInput(value),
      `<span class="text-slate-500">${safeText(note)}</span>`,
    ]));

    return section("Pricing", "Safe commercial variables that directly affect new calculations.", table(["Variable", "Current Value", "Used In"], rows));
  }

  function renderAccessFees(settings) {
    const rows = [
      ["COI Fee", money(settings.coiFee, 0), "Pickup or delivery COI"],
      ["Stairs Fee / Floor", money(settings.stairsFeePerFloor, 0), "Stairs access"],
      ["Narrow / No Elevator Fee", money(settings.narrowAccessFee, 0), "Narrow access or elevator unavailable"],
      ["Long Carry Fee / 50 ft", money(settings.longCarryFeePer50Ft, 0), "Long carry distance"],
    ].map(([name, value, note]) => row([
      `<span class="font-medium text-slate-800">${safeText(name)}</span>`,
      runtimeInput(value),
      `<span class="text-slate-500">${safeText(note)}</span>`,
    ]));

    return section("Access Fees", "Access condition fees used by the quote calculation.", table(["Fee", "Current Value", "Used In"], rows));
  }

  function renderPackagingRates(rates) {
    const rows = Object.entries(rates || {}).map(([name, value]) => row([
      `<span class="font-medium text-slate-800">${safeText(name)}</span>`,
      runtimeInput(money(value, 0)),
      `<span class="text-slate-500">Item-level packaging cost</span>`,
    ]));

    return section("Packaging Rates", "Packaging options available in quote item rows and used in item packaging cost.", table(["Packaging", "Current Value", "Used In"], rows));
  }

  function renderProtectionPlans(plans) {
    const rows = Object.entries(plans || {}).map(([name, plan]) => row([
      `<span class="font-medium text-slate-800">${safeText(name)}</span>`,
      runtimeInput(percent(plan.rate || 0)),
      runtimeInput(money(plan.fixedFee || 0, 0)),
      `<span class="text-slate-500">Declared value protection calculation</span>`,
    ]));

    return section("Protection Plans", "Protection plans shown in quote item rows and used in insurance cost.", table(["Plan", "Rate", "Fixed Fee", "Used In"], rows));
  }

  function renderFuelPrices(fuelPrices) {
    const rows = fuelPrices.map((fuel) => {
      const internalFuelPrice = calculateInternalFuelPrice(fuel);
      return row([
        `<span class="font-medium text-slate-800">${safeText(fuel.fuelType)}</span>`,
        runtimeInput(money(fuel.currentAvg, 3)),
        runtimeInput(`${Number(fuel.fuelSurchargePct || 0).toFixed(2)}%`),
        runtimeInput(money(internalFuelPrice, 4)),
        `<span class="text-slate-500">${safeText(fuel.updatedAt || "-")}</span>`,
      ]);
    });

    return section(
      "Fuel Prices",
      "Runtime fuel values used by calculation. Internal Fuel Price is calculated from Current Avg and Fuel Surcharge.",
      table(["Fuel Type", "Current Avg", "Surcharge", "Internal Fuel Price", "Updated At"], rows),
    );
  }

  function renderScopeNote() {
    const hidden = [
      "Vehicle configuration",
      "Route mileage matrix",
      "Warning thresholds",
      "Labor / loading formulas",
      "Broker fee",
      "Damage surcharge",
      "Quick Quote templates",
      "Stackability coefficients",
    ];

    return section(
      "Read-only Scope",
      "These areas are intentionally hidden from Variables until separate governance and preview logic are ready.",
      `<div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        ${hidden.map((item) => `<div class="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-600">${safeText(item)}</div>`).join("")}
      </div>`,
    );
  }

  function updateTopbar(vars) {
    const badge = document.getElementById("formulaVersionBadge");
    if (badge) badge.textContent = vars.formulaVersion || "Formula";

    ["saveVariablesButton", "exportConfigButton"].forEach((id) => {
      const button = document.getElementById(id);
      if (!button) return;
      button.disabled = true;
      button.title = "Disabled until preview and versioning are implemented.";
      button.classList.add("opacity-60", "cursor-not-allowed");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("variablesRuntimeRoot");
    const vars = window.CalculatorVariables || {};
    const settings = vars.settings || {};
    if (!root) return;

    updateTopbar(vars);
    root.innerHTML = [
      renderHeader(vars),
      renderPricing(settings),
      renderAccessFees(settings),
      renderPackagingRates(vars.packagingRates),
      renderProtectionPlans(vars.protectionPlans),
      renderFuelPrices(readFuelPrices()),
      renderScopeNote(),
    ].join("");

    if (window.lucide) window.lucide.createIcons();
  });
})();
