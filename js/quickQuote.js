(function () {
  const QUICK_DEFAULT_CREW = 2;

  const zoneZip = {
    "NY Area": "11211",
    Boston: "02108",
    "DC Area": "20001",
    "CA North": "94601",
    "CA South": "90021",
  };

  const itemTemplates = {
    custom: { label: "Custom", name: "", volume: 0, weight: 0, fragile: false, nonStackable: false, crated: false },
    box: { label: "Box", name: "Box", volume: 3, weight: 40, fragile: false, nonStackable: false, crated: false },
    chair: { label: "Chair", name: "Chair", volume: 17, weight: 40, fragile: false, nonStackable: false, crated: false },
    sofa: { label: "Sofa", name: "Sofa", volume: 35, weight: 150, fragile: false, nonStackable: false, crated: false },
    table: { label: "Table", name: "Table", volume: 21, weight: 120, fragile: false, nonStackable: false, crated: false },
    cabinet: { label: "Cabinet", name: "Cabinet", volume: 25, weight: 120, fragile: false, nonStackable: false, crated: false },
    mattress: { label: "Mattress", name: "Mattress", volume: 45, weight: 80, fragile: false, nonStackable: true, crated: false },
    mirror: { label: "Artwork / Mirror", name: "Artwork / Mirror", volume: 8, weight: 40, fragile: true, nonStackable: true, crated: false },
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function currency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function createId() {
    return `quick-item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  let quickItems = [
    {
      id: "quick-1",
      template: "custom",
      name: "",
      volume: 0,
      weight: 0,
      qty: 1,
      fragile: false,
      nonStackable: false,
      crated: false,
    },
  ];

  function readItemControl(control) {
    const card = control.closest("[data-quick-item-id]");
    if (!card) return;
    const item = quickItems.find((entry) => entry.id === card.dataset.quickItemId);
    if (!item) return;
    const field = control.dataset.field;
    if (field === "template") {
      applyTemplate(item, control.value);
      renderItems();
      return;
    }
    if (control.type === "checkbox") {
      item[field] = control.checked;
    } else if (["volume", "weight", "qty"].includes(field)) {
      item[field] = number(control.value);
    } else {
      item[field] = control.value;
    }
  }

  function applyTemplate(item, templateKey) {
    const template = itemTemplates[templateKey] || itemTemplates.custom;
    item.template = templateKey;
    item.name = template.name;
    item.volume = template.volume;
    item.weight = template.weight;
    item.qty = item.qty || 1;
    item.fragile = template.fragile;
    item.nonStackable = template.nonStackable;
    item.crated = template.crated;
  }

  function renderTemplateOptions(selected) {
    return Object.entries(itemTemplates).map(([value, template]) => (
      `<option value="${value}"${value === selected ? " selected" : ""}>${template.label}</option>`
    )).join("");
  }

  function quickItemToFullItem(item) {
    const volume = Math.ceil(Math.max(number(item.volume), 0));
    return {
      id: item.id,
      name: item.name,
      length: volume * 12,
      width: 12,
      height: 12,
      weight: number(item.weight),
      qty: number(item.qty, 1),
      packaging: item.crated ? "Custom Crate" : item.fragile ? "Bubble Protection" : "Blanket Wrap",
      insurance: "Basic Liability",
      declaredValue: 0,
      storageDays: 0,
      fragile: Boolean(item.fragile),
      nonStackable: Boolean(item.nonStackable),
      crated: Boolean(item.crated),
      comment: item.name ? "Created from Quick Quote" : "",
    };
  }

  function buildQuote() {
    const pickupZone = byId("quickPickupZone").value;
    const deliveryZone = byId("quickDeliveryZone").value;
    const priority = byId("quickDeliveryPriority").value;
    return {
      estimateId: "QQ-NEW",
      status: "draft",
      customer: {
        leadName: byId("quickLeadName").value.trim(),
        name: byId("quickCustomerName").value.trim(),
        phone: byId("quickCustomerPhone").value.trim(),
        email: "",
      },
      route: {
        pickupZip: zoneZip[pickupZone],
        deliveryZip: zoneZip[deliveryZone],
        pickupAddress: `${pickupZone} quick quote zone`,
        deliveryAddress: `${deliveryZone} quick quote zone`,
      },
      access: {
        pickup: { addressType: "House", coi: false, stairs: false, elevatorUnavailable: false, narrowAccess: false, floor: 1, longCarryFt: 0, crew: QUICK_DEFAULT_CREW },
        delivery: { addressType: "House", coi: false, stairs: false, elevatorUnavailable: false, narrowAccess: false, floor: 1, longCarryFt: 0, crew: QUICK_DEFAULT_CREW },
      },
      options: {
        exclusiveDelivery: priority === "Exclusive Delivery",
        priorityDate: priority === "Requested Date",
        helperRequirement: "Auto",
        deliveryType: priority === "Exclusive Delivery" ? "Exclusive Delivery" : "Consolidated Route",
        requestedDate: "",
        manualAdjustment: 0,
        notes: "",
      },
      items: quickItems.map(quickItemToFullItem),
    };
  }

  function renderItems() {
    byId("quickItems").innerHTML = quickItems.map((item) => `
      <div data-quick-item-id="${item.id}" class="border border-slate-200 rounded-lg p-4 bg-slate-50">
        <div class="grid grid-cols-12 gap-3 items-end text-sm">
          <label class="col-span-2">
            <span class="text-xs text-slate-400">Template</span>
            <select data-field="template" class="mt-1 w-full border rounded-lg px-3 py-2 bg-white">${renderTemplateOptions(item.template || "custom")}</select>
          </label>
          <label class="col-span-5">
            <span class="text-xs text-slate-400">Item</span>
            <input data-field="name" class="mt-1 w-full border rounded-lg px-3 py-2 font-semibold" value="${escapeHtml(item.name)}" />
          </label>
          <label class="col-span-2">
            <span class="text-xs text-slate-400">Volume, cu ft</span>
            <input data-field="volume" type="number" class="mt-1 w-full border rounded-lg px-3 py-2" value="${item.volume || 0}" />
          </label>
          <label class="col-span-2">
            <span class="text-xs text-slate-400">Weight, lb</span>
            <input data-field="weight" type="number" class="mt-1 w-full border rounded-lg px-3 py-2" value="${item.weight || 0}" />
          </label>
          <label class="col-span-1">
            <span class="text-xs text-slate-400">Qty</span>
            <input data-field="qty" type="number" min="1" class="mt-1 w-full border rounded-lg px-3 py-2" value="${item.qty || 1}" />
          </label>
          <div class="col-span-12 grid grid-cols-3 gap-2">
            <label class="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2"><input data-field="fragile" type="checkbox" class="accent-teal-500"${item.fragile ? " checked" : ""} />Fragile</label>
            <label class="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2"><input data-field="nonStackable" type="checkbox" class="accent-teal-500"${item.nonStackable ? " checked" : ""} />Non-stack</label>
            <label class="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2"><input data-field="crated" type="checkbox" class="accent-teal-500"${item.crated ? " checked" : ""} />Crate</label>
          </div>
          <div class="col-span-12 flex justify-end gap-3 pt-1 text-xs font-medium">
            <button data-action="duplicate" class="text-teal-700 hover:text-teal-900 hover:underline" title="Duplicate item">Copy</button>
            <button data-action="clear" class="text-amber-700 hover:text-amber-900 hover:underline" title="Clear item">Clear</button>
            <button data-action="delete" class="text-slate-500 hover:text-red-700 hover:underline" title="Delete item">Delete</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  function createEmptyQuickItem(id = createId()) {
    return {
      id,
      template: "custom",
      name: "",
      volume: 0,
      weight: 0,
      qty: 1,
      fragile: false,
      nonStackable: false,
      crated: false,
    };
  }

  function buildSnapshot(quote, result) {
    const createdAt = new Date();
    const validUntil = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
    return {
      snapshotVersion: 1,
      createdAt: createdAt.toISOString(),
      validUntil: validUntil.toISOString(),
      estimateId: quote.estimateId,
      status: "quick-generated",
      quote,
      result,
    };
  }

  function updateSummary() {
    const quote = buildQuote();
    const result = window.PricingCalculator.calculateQuote(quote);
    const low = result.totals.finalPrice ? result.totals.finalPrice * 0.9 : 0;
    const high = result.totals.finalPrice ? result.totals.finalPrice * 1.1 : 0;
    const hasBillableItems = result.items.length > 0;

    byId("quickRouteStatus").textContent = result.routeSupported ? "Route Ready" : "Unsupported Route";
    byId("quickRouteStatus").className = result.routeSupported
      ? "px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold"
      : "px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold";
    byId("quickReadiness").textContent = !result.routeSupported
      ? "Unsupported Route"
      : hasBillableItems
        ? "Ready"
        : "Add item details";
    byId("quickReadiness").className = !result.routeSupported
      ? "px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold"
      : hasBillableItems
        ? "px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold"
        : "px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold";
    byId("quickDistance").textContent = `${Math.round(result.distance)} mi`;
    byId("quickLowPrice").textContent = currency(low);
    byId("quickHighPrice").textContent = currency(high);
    byId("quickFinalPrice").textContent = currency(result.totals.finalPrice);
    byId("quickVehicle").textContent = result.vehicle.name;
    const estimatedCrew = result.requiredCrew || QUICK_DEFAULT_CREW;
    byId("quickCrew").textContent = `${estimatedCrew} ${estimatedCrew === 1 ? "person" : "people"}`;
    byId("quickEffectiveVolume").textContent = `${result.totals.effectiveVolume.toFixed(1)} cu ft`;
    byId("quickWeight").textContent = `${result.totals.totalWeight.toFixed(0)} lb`;
    byId("quickPriceDrivers").innerHTML = renderPriceDrivers(quote, result);
    byId("quickWarnings").innerHTML = result.warnings.length
      ? result.warnings.map((warning) => `
          <div class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-700 flex-shrink-0"></i>
            <p class="text-amber-800">${escapeHtml(warning)}</p>
          </div>
        `).join("")
      : `
          <div class="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
            <i data-lucide="check-circle" class="w-5 h-5 text-green-700 flex-shrink-0"></i>
            <p class="text-green-800">No quick qualification warnings.</p>
          </div>
        `;

    if (window.lucide) lucide.createIcons();
    return { quote, result };
  }

  function renderPriceDrivers(quote, result) {
    const roundedPhysicalVolume = quote.items.reduce((sum, item) => sum + number(item.length) / 12 * number(item.qty, 1), 0);
    const drivers = [
      { label: "Route", value: `${result.pickupZone} to ${result.deliveryZone}`, note: `${Math.round(result.distance || 0)} mi` },
      { label: "Crew assumption", value: `${QUICK_DEFAULT_CREW} people`, note: "quick quote default" },
      { label: "Rounded volume", value: `${roundedPhysicalVolume.toFixed(0)} cu ft`, note: "entered cu ft rounded up" },
      { label: "Vehicle", value: result.vehicle?.name || "-", note: "auto selected" },
    ];

    if (result.totals.packaging > 0) {
      drivers.push({ label: "Packaging", value: currency(result.totals.packaging), note: "template-based handling" });
    }
    if (quote.options.exclusiveDelivery) {
      drivers.push({ label: "Delivery option", value: "Exclusive", note: "higher operational cost" });
    } else if (quote.options.priorityDate) {
      drivers.push({ label: "Delivery option", value: "Requested date", note: "priority fee included" });
    }

    return drivers.map((driver) => `
      <div class="flex justify-between gap-3 border-b border-slate-100 last:border-0 py-2">
        <div>
          <p class="font-semibold text-slate-700">${escapeHtml(driver.label)}</p>
          <p class="text-xs text-slate-400">${escapeHtml(driver.note)}</p>
        </div>
        <p class="text-right font-bold text-slate-800">${escapeHtml(driver.value)}</p>
      </div>
    `).join("");
  }

  function saveFullDraft() {
    const { quote } = updateSummary();
    window.CalculatorStorage.save(quote);
    byId("quickSaveState").textContent = "Saved";
  }

  function saveEstimateSnapshot() {
    const { quote, result } = updateSummary();
    window.CalculatorStorage.save(quote);
    window.CalculatorStorage.saveEstimateSnapshot(buildSnapshot(quote, result));
  }

  function bindEvents() {
    document.querySelectorAll("[data-quick-recalculate]").forEach((control) => {
      control.addEventListener("input", updateSummary);
      control.addEventListener("change", updateSummary);
    });
    byId("quickItems").addEventListener("input", (event) => {
      readItemControl(event.target);
      updateSummary();
    });
    byId("quickItems").addEventListener("change", (event) => {
      readItemControl(event.target);
      updateSummary();
    });
    byId("quickItems").addEventListener("click", (event) => {
      if (!event.target.dataset.action) return;
      const card = event.target.closest("[data-quick-item-id]");
      if (!card) return;
      const item = quickItems.find((entry) => entry.id === card.dataset.quickItemId);
      if (event.target.dataset.action === "duplicate" && item) {
        quickItems.splice(quickItems.indexOf(item) + 1, 0, { ...item, id: createId(), name: item.name ? `${item.name} copy` : "" });
      } else if (event.target.dataset.action === "clear") {
        quickItems = quickItems.map((entry) => entry.id === card.dataset.quickItemId ? createEmptyQuickItem(card.dataset.quickItemId) : entry);
      } else if (event.target.dataset.action === "delete" && quickItems.length === 1) {
        quickItems = [createEmptyQuickItem(card.dataset.quickItemId)];
      } else if (event.target.dataset.action === "delete") {
        quickItems = quickItems.filter((item) => item.id !== card.dataset.quickItemId);
      }
      renderItems();
      updateSummary();
    });
    byId("quickAddItem").addEventListener("click", () => {
      quickItems.push(createEmptyQuickItem());
      renderItems();
      updateSummary();
    });
    byId("quickSaveDraft").addEventListener("click", saveFullDraft);
    [byId("quickFullQuote"), byId("quickFullQuoteBottom")].forEach((link) => {
      link.addEventListener("click", saveFullDraft);
    });
    [byId("quickEstimate"), byId("quickEstimateBottom")].forEach((link) => {
      link.addEventListener("click", saveEstimateSnapshot);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderItems();
    bindEvents();
    updateSummary();
  });
})();
