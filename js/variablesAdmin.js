(function () {
  const sectionOrder = [
    "Pricing and Margin",
    "Labor and Time",
    "Access and Service",
    "Item Handling",
    "Capacity and Vehicle Economics",
    "Protection, Storage and Packaging",
    "Warnings and Approval",
  ];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function readPath(source, path) {
    return String(path || "").split(".").reduce((value, key) => value && value[key], source);
  }

  function formatNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "";
    return number.toLocaleString("en-US", { maximumFractionDigits: 5 });
  }

  function humanize(value) {
    return String(value || "-")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/Cu Ft/g, "cu ft")
      .replace(/Lb/g, "lb")
      .replace(/Pct/g, "%")
      .replace(/^./, (character) => character.toUpperCase());
  }

  function displayUnit(record) {
    if (record.unit !== "Variable") return record.unit || "-";
    if (/(rate|pct)/i.test(record.name)) return "%";
    if (/(fee|cost|price|wage|payout|overhead)/i.test(record.name)) return "USD";
    if (/multiplier/i.test(record.name)) return "Multiplier";
    return "Variable";
  }

  function formatValue(record, vars) {
    if (record.activeKey === "extraLaborRate") return "$50";
    if (record.activeKey === "fuelPrices") {
      const fuel = vars.fuelPrices || [];
      return fuel.map((entry) => `${entry.fuelType}: $${formatNumber(entry.internalFuelPrice)}`).join(" | ") || "Not configured";
    }
    if (record.activeKey === "packagingRates") return `${Object.keys(vars.packagingRates || {}).length} active rates`;
    if (record.activeKey === "protectionPlans.Full Coverage") {
      const plan = vars.protectionPlans?.["Full Coverage"];
      return plan ? `${formatNumber(Number(plan.rate || 0) * 100)}% + $${formatNumber(plan.fixedFee)}` : "Not configured";
    }
    const value = readPath(vars.settings || {}, record.activeKey);
    if (value === undefined || value === null || value === "") return record.readiness === "Ready" ? "Not configured" : "Test assumption";
    if ((/percent|rate|pct/i.test(record.unit) || /(rate|pct)/i.test(record.name)) && Number(value) >= 0 && Number(value) <= 1) return `${formatNumber(Number(value) * 100)}%`;
    if (/^usd/i.test(record.unit) || (record.unit === "Variable" && /(fee|cost|price|wage|payout|overhead)/i.test(record.name))) return `$${formatNumber(value)}`;
    return formatNumber(value) || String(value);
  }

  function section(rows, title, vars) {
    if (!rows.length) return "";
    return `
      <section class="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h3 class="font-bold text-slate-800">${escapeHtml(title)}</h3>
          <span class="text-xs text-slate-400">${rows.length} variables</span>
        </div>
        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full min-w-[720px] text-sm">
            <thead class="bg-slate-50 text-slate-500"><tr>
              <th class="px-4 py-3 text-left">Variable ID</th>
              <th class="px-4 py-3 text-left">Name</th>
              <th class="px-4 py-3 text-left">Active Value</th>
              <th class="px-4 py-3 text-left">Unit</th>
            </tr></thead>
            <tbody class="divide-y divide-slate-200">
              ${rows.map((record) => `
                <tr>
                  <td class="px-4 py-3 font-mono text-xs text-slate-500">${escapeHtml(record.id)}</td>
                  <td class="px-4 py-3 font-medium text-slate-800">${escapeHtml(humanize(record.name))}</td>
                  <td class="px-4 py-3"><span class="inline-flex min-w-[96px] rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-medium text-blue-700">${escapeHtml(formatValue(record, vars))}</span></td>
                  <td class="px-4 py-3 text-slate-500">${escapeHtml(displayUnit(record))}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </section>`;
  }

  function renderHeader(vars, records) {
    const snapshot = window.PricingConfig?.snapshot?.() || {};
    const ready = records.filter((record) => record.readiness === "Ready").length;
    return `
      <section class="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-3"><h1 class="text-2xl font-bold text-slate-800">Pricing Variables</h1><span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Read-only MVP</span></div>
            <p class="mt-2 text-sm text-slate-500">Operational control of active and future calculation variables. Editing remains disabled until governed activation is approved.</p>
          </div>
          <div class="text-right text-sm text-slate-500"><p>Formula: <b class="text-slate-700">${escapeHtml(snapshot.formulaVersion || vars.formulaVersion || "-")}</b></p><p>Variables: <b class="text-slate-700">${escapeHtml(snapshot.variablesVersion || vars.variablesVersion || "-")}</b></p></div>
        </div>
        <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div class="rounded-lg bg-slate-50 px-4 py-3"><div class="text-xs uppercase text-slate-400">Variables</div><div class="mt-1 text-xl font-bold text-slate-800">${records.length}</div></div>
          <div class="rounded-lg bg-emerald-50 px-4 py-3"><div class="text-xs uppercase text-emerald-600">Ready data</div><div class="mt-1 text-xl font-bold text-emerald-800">${ready}</div></div>
          <div class="rounded-lg bg-amber-50 px-4 py-3"><div class="text-xs uppercase text-amber-600">Test assumptions</div><div class="mt-1 text-xl font-bold text-amber-800">${records.length - ready}</div></div>
        </div>
      </section>`;
  }

  function renderFilters() {
    return `
      <section class="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-[1fr_280px]">
          <label class="text-xs text-slate-400">Search<input id="variablesSearch" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700" placeholder="Search variable ID or name" /></label>
          <label class="text-xs text-slate-400">Section<select id="variablesSection" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"><option value="">All sections</option>${sectionOrder.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("")}</select></label>
        </div>
      </section>`;
  }

  function updateTopbar(vars) {
    const badge = document.getElementById("formulaVersionBadge");
    if (badge) badge.textContent = vars.formulaVersion || "Formula";
    ["saveVariablesButton", "exportConfigButton"].forEach((id) => {
      const button = document.getElementById(id);
      if (button) button.title = "Disabled until governed editing and benchmark preview are approved.";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("variablesRuntimeRoot");
    const vars = window.CalculatorVariables || {};
    const records = window.OperationalMasterdata?.variables || [];
    if (!root) return;
    updateTopbar(vars);
    root.innerHTML = `${renderHeader(vars, records)}${renderFilters()}<div id="variablesSections"></div>`;
    const sectionsRoot = document.getElementById("variablesSections");
    const render = () => {
      const query = document.getElementById("variablesSearch").value.trim().toLowerCase();
      const selected = document.getElementById("variablesSection").value;
      const filtered = records.filter((record) => (!selected || record.section === selected) && (!query || `${record.id} ${record.name}`.toLowerCase().includes(query)));
      sectionsRoot.innerHTML = sectionOrder.map((name) => section(filtered.filter((record) => record.section === name), name, vars)).join("") || '<section class="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">No matching variables.</section>';
    };
    document.getElementById("variablesSearch").addEventListener("input", render);
    document.getElementById("variablesSection").addEventListener("change", render);
    render();
  });
})();
