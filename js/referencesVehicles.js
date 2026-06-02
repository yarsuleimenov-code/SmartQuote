(function () {
  const categories = ["Van", "Box Truck", "Truck", "Vehicle"];
  const fuelTypes = ["Diesel", "Regular"];
  let vehicles = [];
  let editingId = null;

  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function safeText(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function vehicleIdFromName(name) {
    return String(name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `vehicle-${Date.now()}`;
  }

  function emptyVehicle() {
    return {
      vehicleId: "",
      vehicleName: "",
      category: "Van",
      capacityCuFt: 0,
      maxWeightLb: 0,
      fuelType: "Diesel",
      mpg: 0,
      passengerCapacity: 1,
      maintenanceCostPerMile: 0,
      active: true,
    };
  }

  function normalize(vehicle) {
    return window.PricingConfig.normalizeVehicle(vehicle);
  }

  function loadVehicles() {
    vehicles = window.PricingConfig.readVehicles();
  }

  async function persistVehicles() {
    const saved = window.PricingConfig.saveVehicles(vehicles);
    let remote = { skipped: true, reason: "Pricing Admin Storage adapter is not available." };
    if (window.PricingAdminStorage?.saveVehicles) {
      const result = await window.PricingAdminStorage.saveVehicles(saved);
      remote = result.remote;
    }
    return { saved, remote };
  }

  function showPersistResult(result) {
    const remote = result?.remote || {};
    showStatus(remote.success ? "Vehicles saved locally and remotely." : "Vehicles saved locally. Remote save skipped or failed.", remote.success ? "success" : "warning");
  }

  function showStatus(message, type = "info") {
    const status = document.getElementById("vehiclesStatus");
    if (!status) return;
    const classes = {
      success: "border-emerald-200 bg-emerald-50 text-emerald-800",
      warning: "border-amber-200 bg-amber-50 text-amber-800",
      error: "border-red-200 bg-red-50 text-red-800",
      info: "border-slate-200 bg-slate-50 text-slate-600",
    };
    status.className = `mt-4 rounded-lg border px-4 py-3 text-sm ${classes[type] || classes.info}`;
    status.textContent = message;
  }

  function formValue(id) {
    return document.getElementById(id)?.value?.trim() || "";
  }

  function validate(vehicle) {
    if (!vehicle.vehicleName) return "Vehicle name is required.";
    if (!fuelTypes.includes(vehicle.fuelType)) return "Fuel Type must be Regular or Diesel.";
    if (vehicle.capacityCuFt <= 0) return "Capacity must be greater than 0.";
    if (vehicle.maxWeightLb <= 0) return "Max Weight must be greater than 0.";
    if (vehicle.mpg <= 0) return "MPG must be greater than 0.";
    if (vehicle.passengerCapacity < 1) return "Passenger Capacity must be at least 1.";
    return "";
  }

  function readFormVehicle() {
    const original = vehicles.find((vehicle) => vehicle.vehicleId === editingId) || {};
    const vehicleName = formValue("vehicleName");
    return normalize({
      ...original,
      vehicleId: editingId || vehicleIdFromName(vehicleName),
      vehicleName,
      category: formValue("vehicleCategory") || "Vehicle",
      capacityCuFt: number(formValue("vehicleCapacity")),
      maxWeightLb: number(formValue("vehicleMaxWeight")),
      fuelType: formValue("vehicleFuelType"),
      mpg: number(formValue("vehicleMpg")),
      passengerCapacity: number(formValue("vehiclePassengerCapacity"), 1),
      maintenanceCostPerMile: number(formValue("vehicleMaintenanceCost")),
      active: document.getElementById("vehicleActive")?.checked !== false,
    });
  }

  function fillForm(vehicle) {
    const record = vehicle || emptyVehicle();
    editingId = record.vehicleId || null;
    document.getElementById("vehicleName").value = record.vehicleName || "";
    document.getElementById("vehicleCategory").value = record.category || "Vehicle";
    document.getElementById("vehicleCapacity").value = record.capacityCuFt || "";
    document.getElementById("vehicleMaxWeight").value = record.maxWeightLb || "";
    document.getElementById("vehicleFuelType").value = record.fuelType || "Diesel";
    document.getElementById("vehicleMpg").value = record.mpg || "";
    document.getElementById("vehiclePassengerCapacity").value = record.passengerCapacity || 1;
    document.getElementById("vehicleMaintenanceCost").value = record.maintenanceCostPerMile || "";
    document.getElementById("vehicleActive").checked = record.active !== false;
    document.getElementById("vehicleFormTitle").textContent = editingId ? "Edit Vehicle" : "Add Vehicle";
    document.getElementById("vehicleFormPanel").classList.remove("hidden");
  }

  function clearForm() {
    editingId = null;
    document.getElementById("vehicleFormPanel").classList.add("hidden");
  }

  function renderRows() {
    return vehicles.map((vehicle) => `
      <tr class="${vehicle.active === false ? "bg-slate-50 text-slate-400" : ""}">
        <td class="px-4 py-3">
          <div class="font-semibold text-slate-800">${safeText(vehicle.vehicleName)}</div>
          <div class="text-xs text-slate-400">${safeText(vehicle.vehicleId)}</div>
        </td>
        <td class="px-4 py-3">${safeText(vehicle.category)}</td>
        <td class="px-4 py-3">${number(vehicle.capacityCuFt).toLocaleString()} cu ft</td>
        <td class="px-4 py-3">${number(vehicle.maxWeightLb).toLocaleString()} lb</td>
        <td class="px-4 py-3">${safeText(vehicle.fuelType)}</td>
        <td class="px-4 py-3">${number(vehicle.mpg).toFixed(2)}</td>
        <td class="px-4 py-3">${number(vehicle.passengerCapacity)}</td>
        <td class="px-4 py-3">$${number(vehicle.maintenanceCostPerMile).toFixed(3)}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded-full text-xs font-semibold ${vehicle.active === false ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"}">
            ${vehicle.active === false ? "Inactive" : "Active"}
          </span>
        </td>
        <td class="px-4 py-3 text-right whitespace-nowrap">
          <button type="button" data-action="edit" data-id="${safeText(vehicle.vehicleId)}" class="text-teal-700 hover:text-teal-900 font-semibold mr-3">Edit</button>
          <button type="button" data-action="deactivate" data-id="${safeText(vehicle.vehicleId)}" class="text-amber-700 hover:text-amber-900 font-semibold" ${vehicle.active === false ? "disabled" : ""}>Deactivate</button>
        </td>
      </tr>
    `).join("");
  }

  function render(root) {
    root.innerHTML = `
      <div class="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 class="font-bold text-slate-800">Vehicles</h3>
          <p class="text-xs text-slate-400 mt-1">Runtime vehicle source used by vehicle fit and fuel cost logic.</p>
        </div>
        <button id="addVehicleButton" type="button" class="px-3 py-2 rounded-lg bg-teal-500 text-white text-sm hover:bg-teal-600">Add Vehicle</button>
      </div>

      <div class="overflow-x-auto border border-slate-200 rounded-xl">
        <table class="w-full text-sm min-w-[1180px]">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="text-left px-4 py-3">Vehicle</th>
              <th class="text-left px-4 py-3">Category</th>
              <th class="text-left px-4 py-3">Capacity, cu ft</th>
              <th class="text-left px-4 py-3">Max Weight, lb</th>
              <th class="text-left px-4 py-3">Fuel Type</th>
              <th class="text-left px-4 py-3">MPG</th>
              <th class="text-left px-4 py-3">Passenger Capacity</th>
              <th class="text-left px-4 py-3">Maintenance / Mile</th>
              <th class="text-left px-4 py-3">Active</th>
              <th class="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody id="vehiclesTableBody" class="divide-y divide-slate-200">${renderRows()}</tbody>
        </table>
      </div>

      <div id="vehicleFormPanel" class="hidden mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div class="flex items-center justify-between mb-4">
          <h4 id="vehicleFormTitle" class="font-semibold text-slate-800">Add Vehicle</h4>
          <button id="cancelVehicleButton" type="button" class="text-sm text-slate-500 hover:text-slate-800">Cancel</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <label><span class="text-xs text-slate-400">Vehicle Name</span><input id="vehicleName" class="mt-1 w-full border rounded-lg px-3 py-2" /></label>
          <label><span class="text-xs text-slate-400">Category</span><select id="vehicleCategory" class="mt-1 w-full border rounded-lg px-3 py-2">${categories.map((category) => `<option>${safeText(category)}</option>`).join("")}</select></label>
          <label><span class="text-xs text-slate-400">Capacity, cu ft</span><input id="vehicleCapacity" type="number" min="1" step="0.1" class="mt-1 w-full border rounded-lg px-3 py-2" /></label>
          <label><span class="text-xs text-slate-400">Max Weight, lb</span><input id="vehicleMaxWeight" type="number" min="1" step="1" class="mt-1 w-full border rounded-lg px-3 py-2" /></label>
          <label><span class="text-xs text-slate-400">Fuel Type</span><select id="vehicleFuelType" class="mt-1 w-full border rounded-lg px-3 py-2">${fuelTypes.map((fuel) => `<option>${fuel}</option>`).join("")}</select></label>
          <label><span class="text-xs text-slate-400">MPG</span><input id="vehicleMpg" type="number" min="0.1" step="0.01" class="mt-1 w-full border rounded-lg px-3 py-2" /></label>
          <label><span class="text-xs text-slate-400">Passenger Capacity</span><input id="vehiclePassengerCapacity" type="number" min="1" step="1" class="mt-1 w-full border rounded-lg px-3 py-2" /></label>
          <label><span class="text-xs text-slate-400">Maintenance / Mile</span><input id="vehicleMaintenanceCost" type="number" min="0" step="0.001" class="mt-1 w-full border rounded-lg px-3 py-2" /></label>
        </div>
        <label class="mt-4 inline-flex items-center gap-2 text-sm"><input id="vehicleActive" type="checkbox" class="accent-teal-500" checked /> Active</label>
        <div class="mt-4 flex justify-end gap-2">
          <button id="saveVehicleButton" type="button" class="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900">Save Vehicle</button>
        </div>
      </div>
      <div id="vehiclesStatus" class="hidden"></div>
    `;
  }

  function bind(root) {
    root.addEventListener("click", async (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const action = button.dataset.action;
      const id = button.dataset.id;

      if (button.id === "addVehicleButton") {
        fillForm(emptyVehicle());
        return;
      }
      if (button.id === "cancelVehicleButton") {
        clearForm();
        return;
      }
      if (button.id === "saveVehicleButton") {
        const vehicle = readFormVehicle();
        const error = validate(vehicle);
        if (error) {
          showStatus(error, "error");
          return;
        }
        const index = vehicles.findIndex((entry) => entry.vehicleId === vehicle.vehicleId);
        if (index >= 0) vehicles[index] = vehicle;
        else vehicles.push(vehicle);
        const result = await persistVehicles();
        clearForm();
        render(root);
        showPersistResult(result);
        return;
      }
      if (action === "edit") {
        fillForm(vehicles.find((vehicle) => vehicle.vehicleId === id));
        return;
      }
      if (action === "deactivate") {
        const vehicle = vehicles.find((entry) => entry.vehicleId === id);
        if (!vehicle) return;
        vehicle.active = false;
        const result = await persistVehicles();
        render(root);
        showPersistResult(result);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("vehiclesReferenceRoot");
    if (!root || !window.PricingConfig) return;
    loadVehicles();
    render(root);
    bind(root);
    if (window.lucide) window.lucide.createIcons();
  });
})();
