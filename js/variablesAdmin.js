(function () {
  function setRowInput(label, value) {
    const cells = Array.from(document.querySelectorAll("td"));
    const cell = cells.find((entry) => entry.textContent.trim() === label);
    const input = cell?.closest("tr")?.querySelector("input");
    if (!input) return;
    input.value = value;
    input.readOnly = true;
    input.classList.add("bg-slate-50", "text-slate-600");
  }

  function disableActions() {
    Array.from(document.querySelectorAll("button")).forEach((button) => {
      if (!["Save Variables", "Export Config", "Refresh Data"].includes(button.textContent.trim())) return;
      button.disabled = true;
      button.title = "Read-only until interactive Pricing Engine is enabled";
      button.classList.add("opacity-60", "cursor-not-allowed");
    });
  }

  function disableFormControls() {
    document.querySelectorAll("main input, main select").forEach((control) => {
      control.disabled = true;
      control.classList.add("bg-slate-50", "text-slate-500", "cursor-not-allowed");
    });
  }

  function addReadOnlyNotice() {
    const header = document.querySelector("main .p-6 section");
    if (!header) return;
    const notice = document.createElement("div");
    notice.className = "mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800";
    notice.textContent = "Current values are synced from UAT-approved runtime constants. Editing is disabled until Pricing Engine persistence and snapshot governance are enabled.";
    header.appendChild(notice);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const vars = window.CalculatorVariables || {};
    const settings = vars.settings || {};
    const warnings = vars.warningRules || {};
    const handling = vars.itemHandlingMultipliers || {};

    setRowInput("Default Margin", Math.round((settings.marginRate || 0) * 100));
    setRowInput("Heavy Item Threshold", warnings.onePersonMaxWeightLb || 0);
    setRowInput("One Person Weight Threshold", warnings.onePersonMaxWeightLb || 0);
    setRowInput("Standard stackable item", handling.standard || 1);
    setRowInput("Fragile item", handling.fragile || 1);
    setRowInput("Non-stackable item", handling.nonStackable || 1);
    setRowInput("Crated item", handling.crated || 1);

    disableFormControls();
    disableActions();
    addReadOnlyNotice();
  });
})();
