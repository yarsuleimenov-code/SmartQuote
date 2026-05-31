(function () {
  const QUICK_DEFAULT_CREW = 2;

  const zoneZip = {
    "NY Area": "11211",
    Boston: "02108",
    "DC Area": "20001",
    "CA North": "94601",
    "CA South": "90021",
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
    if (control.type === "checkbox") {
      item[field] = control.checked;
    } else if (["volume", "weight", "qty"].includes(field)) {
      item[field] = number(control.value);
    } else {
      item[field] = control.value;
    }
  }

  function quickItemToFullItem(item) {
    const volume = Math.max(number(item.volume), 0);
    return {
      id: item.id,
      name: item.name,
      length: volume,
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
          <label class="col-span-3">
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
          <div class="col-span-3 grid grid-cols-3 gap-2">
            <label class="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2"><input data-field="fragile" type="checkbox" class="accent-teal-500"${item.fragile ? " checked" : ""} />Fragile</label>
            <label class="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2"><input data-field="nonStackable" type="checkbox" class="accent-teal-500"${item.nonStackable ? " checked" : ""} />Non-stack</label>
            <label class="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2"><input data-field="crated" type="checkbox" class="accent-teal-500"${item.crated ? " checked" : ""} />Crate</label>
          </div>
          <div class="col-span-1 text-right">
            <button data-action="delete" class="text-slate-400 hover:text-red-600">Delete</button>
          </div>
        </div>
      </div>
    `).join("");
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

    byId("quickRouteStatus").textContent = result.routeSupported ? "Route Ready" : "Unsupported Route";
    byId("quickRouteStatus").className = result.routeSupported
      ? "px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold"
      : "px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold";
    byId("quickDistance").textContent = `${Math.round(result.distance)} mi`;
    byId("quickLowPrice").textContent = currency(low);
    byId("quickHighPrice").textContent = currency(high);
    byId("quickFinalPrice").textContent = currency(result.totals.finalPrice);
    byId("quickVehicle").textContent = result.vehicle.name;
    const estimatedCrew = result.requiredCrew || QUICK_DEFAULT_CREW;
    byId("quickCrew").textContent = `${estimatedCrew} ${estimatedCrew === 1 ? "person" : "people"}`;
    byId("quickEffectiveVolume").textContent = `${result.totals.effectiveVolume.toFixed(1)} cu ft`;
    byId("quickWeight").textContent = `${result.totals.totalWeight.toFixed(0)} lb`;
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
      if (event.target.dataset.action !== "delete") return;
      const card = event.target.closest("[data-quick-item-id]");
      if (quickItems.length === 1) {
        quickItems = [{
          id: card.dataset.quickItemId,
          name: "",
          volume: 0,
          weight: 0,
          qty: 1,
          fragile: false,
          nonStackable: false,
          crated: false,
        }];
      } else {
        quickItems = quickItems.filter((item) => item.id !== card.dataset.quickItemId);
      }
      renderItems();
      updateSummary();
    });
    byId("quickAddItem").addEventListener("click", () => {
      quickItems.push({
        id: createId(),
        name: "",
        volume: 0,
        weight: 0,
        qty: 1,
        fragile: false,
        nonStackable: false,
        crated: false,
      });
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
