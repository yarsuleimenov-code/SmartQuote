(function () {
  function currency(value) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function createId() {
    return `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function createApp({ initialQuote, calculateQuote, storage, sheet }) {
    let quote = initialQuote;
    const blankQuote = JSON.parse(JSON.stringify(initialQuote));
    let result = calculateQuote(quote);

    const fields = {};

    function byId(id) {
      return document.getElementById(id);
    }

    function cacheFields() {
      [
        "leadName", "customerName", "customerPhone", "customerEmail",
        "pickupZip", "deliveryZip", "pickupAddress", "deliveryAddress",
        "pickupAddressType", "deliveryAddressType", "pickupFloor", "deliveryFloor",
        "pickupLongCarry", "deliveryLongCarry", "pickupCrew", "deliveryCrew", "helperRequirement", "deliveryType",
        "requestedDate", "manualAdjustment", "notes",
      ].forEach((id) => {
        fields[id] = byId(id);
      });
    }

    function setFieldValues() {
      fields.leadName.value = quote.customer.leadName || "";
      fields.customerName.value = quote.customer.name || "";
      fields.customerPhone.value = quote.customer.phone || "";
      fields.customerEmail.value = quote.customer.email || "";
      fields.pickupZip.value = quote.route.pickupZip || "";
      fields.deliveryZip.value = quote.route.deliveryZip || "";
      fields.pickupAddress.value = quote.route.pickupAddress || "";
      fields.deliveryAddress.value = quote.route.deliveryAddress || "";
      fields.pickupAddressType.value = quote.access.pickup.addressType || "House";
      fields.deliveryAddressType.value = quote.access.delivery.addressType || "House";
      fields.pickupFloor.value = quote.access.pickup.floor || 1;
      fields.deliveryFloor.value = quote.access.delivery.floor || 1;
      fields.pickupLongCarry.value = quote.access.pickup.longCarryFt || 0;
      fields.deliveryLongCarry.value = quote.access.delivery.longCarryFt || 0;
      fields.pickupCrew.value = quote.access.pickup.crew || "";
      fields.deliveryCrew.value = quote.access.delivery.crew || "";
      fields.helperRequirement.value = quote.options.helperRequirement || "Auto";
      fields.deliveryType.value = quote.options.deliveryType || "Consolidated Route";
      fields.requestedDate.value = quote.options.requestedDate || "";
      fields.manualAdjustment.value = quote.options.manualAdjustment || 0;
      fields.notes.value = quote.options.notes || "";

      ["pickupCoi", "pickupStairs", "pickupElevatorUnavailable", "pickupNarrowAccess"].forEach((id) => {
        byId(id).checked = Boolean(quote.access.pickup[id.replace("pickup", "").charAt(0).toLowerCase() + id.replace("pickup", "").slice(1)]);
      });
      ["deliveryCoi", "deliveryStairs", "deliveryElevatorUnavailable", "deliveryNarrowAccess"].forEach((id) => {
        byId(id).checked = Boolean(quote.access.delivery[id.replace("delivery", "").charAt(0).toLowerCase() + id.replace("delivery", "").slice(1)]);
      });
      byId("exclusiveDelivery").checked = Boolean(quote.options.exclusiveDelivery);
      byId("priorityDate").checked = Boolean(quote.options.priorityDate);
    }

    function readQuote() {
      quote.customer = {
        leadName: fields.leadName.value.trim(),
        name: fields.customerName.value.trim(),
        phone: fields.customerPhone.value.trim(),
        email: fields.customerEmail.value.trim(),
      };
      quote.route = {
        pickupZip: fields.pickupZip.value.trim(),
        deliveryZip: fields.deliveryZip.value.trim(),
        pickupAddress: fields.pickupAddress.value.trim(),
        deliveryAddress: fields.deliveryAddress.value.trim(),
      };
      quote.access = {
        pickup: {
          addressType: fields.pickupAddressType.value,
          coi: byId("pickupCoi").checked,
          stairs: byId("pickupStairs").checked,
          elevatorUnavailable: byId("pickupElevatorUnavailable").checked,
          narrowAccess: byId("pickupNarrowAccess").checked,
          floor: number(fields.pickupFloor.value),
          longCarryFt: number(fields.pickupLongCarry.value),
          crew: number(fields.pickupCrew.value),
        },
        delivery: {
          addressType: fields.deliveryAddressType.value,
          coi: byId("deliveryCoi").checked,
          stairs: byId("deliveryStairs").checked,
          elevatorUnavailable: byId("deliveryElevatorUnavailable").checked,
          narrowAccess: byId("deliveryNarrowAccess").checked,
          floor: number(fields.deliveryFloor.value),
          longCarryFt: number(fields.deliveryLongCarry.value),
          crew: number(fields.deliveryCrew.value),
        },
      };
      quote.options = {
        exclusiveDelivery: byId("exclusiveDelivery").checked,
        priorityDate: byId("priorityDate").checked,
        helperRequirement: fields.helperRequirement.value,
        deliveryType: fields.deliveryType.value,
        requestedDate: fields.requestedDate.value,
        manualAdjustment: number(fields.manualAdjustment.value),
        notes: fields.notes.value.trim(),
      };
    }

    function itemSelect(value, options) {
      return options.map((option) => `<option${option === value ? " selected" : ""}>${option}</option>`).join("");
    }

    function renderItems() {
      const tbody = byId("itemsBody");
      tbody.innerHTML = quote.items.map((item, index) => {
        const computed = result.items.find((entry) => entry.id === item.id) || {};
        return `
          <tr data-item-id="${item.id}" class="border-b border-slate-200 bg-white">
            <td class="px-3 pt-3"><input data-field="name" class="w-64 border rounded-lg px-2 py-2" value="${escapeHtml(item.name)}" /></td>
            <td class="px-3 pt-3"><input data-field="length" type="number" class="w-20 border rounded-lg px-2 py-2" value="${item.length || 0}" /></td>
            <td class="px-3 pt-3"><input data-field="width" type="number" class="w-20 border rounded-lg px-2 py-2" value="${item.width || 0}" /></td>
            <td class="px-3 pt-3"><input data-field="height" type="number" class="w-20 border rounded-lg px-2 py-2" value="${item.height || 0}" /></td>
            <td class="px-3 pt-3"><input data-field="weight" type="number" class="w-20 border rounded-lg px-2 py-2" value="${item.weight || 0}" /></td>
            <td class="px-3 pt-3"><input data-field="qty" type="number" min="1" class="w-16 border rounded-lg px-2 py-2" value="${item.qty || 1}" /></td>
            <td class="px-3 pt-3"><select data-field="packaging" class="w-40 border rounded-lg px-2 py-2">${itemSelect(item.packaging, Object.keys(window.CalculatorVariables.packagingRates))}</select></td>
            <td class="px-3 py-3 font-semibold text-slate-800" data-computed="effectiveVolume">${computed.effectiveVolume || 0}</td>
            <td class="px-3 py-3" data-computed="totalWeight">${computed.totalWeight || 0}</td>
          </tr>
          <tr data-item-id="${item.id}" class="border-b border-slate-200 bg-slate-50/60">
            <td colspan="9" class="px-3 pb-2">
              <div class="grid grid-cols-12 gap-3 items-end text-sm">
                <label class="col-span-2">
                  <span class="text-xs text-slate-400">Protection</span>
                  <select data-field="insurance" class="mt-1 w-full border rounded-lg px-2 py-2 bg-white">${itemSelect(item.insurance, Object.keys(window.CalculatorVariables.protectionPlans))}</select>
                </label>
                <label class="col-span-1">
                  <span class="text-xs text-slate-400">Value</span>
                  <input data-field="declaredValue" type="number" class="mt-1 w-full border rounded-lg px-2 py-2" value="${item.declaredValue || 0}" />
                </label>
                <label class="col-span-1">
                  <span class="text-xs text-slate-400">Storage</span>
                  <input data-field="storageDays" type="number" class="mt-1 w-full border rounded-lg px-2 py-2" value="${item.storageDays || 0}" />
                </label>
                <label class="col-span-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2"><input data-field="fragile" type="checkbox" class="accent-teal-500"${item.fragile ? " checked" : ""} />Fragile</label>
                <label class="col-span-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2"><input data-field="nonStackable" type="checkbox" class="accent-teal-500"${item.nonStackable ? " checked" : ""} />Non-stack</label>
                <label class="col-span-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2"><input data-field="crated" type="checkbox" class="accent-teal-500"${item.crated ? " checked" : ""} />Crate</label>
                <label class="col-span-5">
                  <span class="text-xs text-slate-400">Comment</span>
                  <input data-field="comment" class="mt-1 w-full border rounded-lg px-2 py-2 bg-white" value="${escapeHtml(item.comment)}" />
                </label>
              </div>
            </td>
          </tr>
          <tr data-item-id="${item.id}" class="border-b border-slate-200 bg-slate-50/60">
            <td colspan="9" class="px-3 pb-3">
              <div class="flex items-center justify-between gap-4 text-xs">
                <div class="text-slate-500">
                  Warning:
                  <span data-computed="warning" class="${computed.warning && computed.warning !== "OK" ? "text-amber-700" : "text-green-700"}">${computed.warning || "OK"}</span>
                </div>
                <div class="flex justify-end gap-3 font-medium">
                  <button data-action="duplicate-item" class="text-teal-700 hover:text-teal-900 hover:underline">Copy</button>
                  <button data-action="clear-item" class="text-amber-700 hover:text-amber-900 hover:underline">Clear</button>
                  <button data-action="delete-item" class="text-slate-500 hover:text-red-700 hover:underline">Delete</button>
                </div>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }

    function updateSummary() {
      byId("routeStatus").textContent = result.routeSupported ? "Route Ready" : "Unsupported ZIP";
      byId("routeStatus").className = result.routeSupported
        ? "px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold"
        : "px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold";
      byId("pickupZone").textContent = result.pickupZone;
      byId("deliveryZone").textContent = result.deliveryZone;
      byId("routeDistance").textContent = `${Math.round(result.distance)} mi`;
      byId("vehicleFit").textContent = result.vehicle.name;
      byId("requiredCrew").textContent = result.requiredCrew
        ? `P ${result.crew.pickup} / D ${result.crew.delivery}`
        : "0";
      byId("finalPrice").textContent = currency(result.totals.finalPrice);
      byId("marginAmount").textContent = `Margin ${currency(result.totals.margin)}`;
      byId("operationalCost").textContent = currency(result.totals.operationalCost);
      byId("additionalCharges").textContent = currency(result.totals.additionalCharges);
      byId("margin").textContent = currency(result.totals.margin);
      byId("rawPrice").textContent = currency(result.totals.rawPrice);
      byId("roundingDelta").textContent = currency(result.totals.roundingDelta);
      byId("packagingCost").textContent = currency(result.totals.packaging);
      byId("storageCost").textContent = currency(result.totals.storage);
      byId("insuranceCost").textContent = currency(result.totals.insurance);
      byId("accessFees").textContent = currency(result.totals.accessFees);
      byId("optionFees").textContent = currency(result.totals.optionFees);
      byId("effectiveVolume").textContent = `${result.totals.effectiveVolume.toFixed(1)} cu ft`;
      byId("totalVolume").textContent = `${result.totals.totalVolume.toFixed(1)} cu ft`;
      byId("totalWeight").textContent = `${result.totals.totalWeight.toFixed(0)} lb`;
      byId("warningList").innerHTML = result.warnings.length
        ? result.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")
        : "<li>No item warnings</li>";
      byId("payloadPreview").textContent = JSON.stringify(sheet.buildPayload(quote, result), null, 2);
    }

    function buildEstimateSnapshot() {
      const createdAt = new Date();
      const validUntil = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
      return {
        snapshotVersion: 1,
        createdAt: createdAt.toISOString(),
        validUntil: validUntil.toISOString(),
        estimateId: quote.estimateId || "EST-291",
        status: "generated",
        quote: JSON.parse(JSON.stringify(quote)),
        result: JSON.parse(JSON.stringify(result)),
      };
    }

    function refreshItemComputed() {
      result.items.forEach((item) => {
        const itemRows = Array.from(byId("itemsBody").querySelectorAll(`[data-item-id="${item.id}"]`));
        if (!itemRows.length) return;
        const effectiveVolume = itemRows.map((row) => row.querySelector('[data-computed="effectiveVolume"]')).find(Boolean);
        const totalWeight = itemRows.map((row) => row.querySelector('[data-computed="totalWeight"]')).find(Boolean);
        const warning = itemRows.map((row) => row.querySelector('[data-computed="warning"]')).find(Boolean);
        if (effectiveVolume) effectiveVolume.textContent = item.effectiveVolume || 0;
        if (totalWeight) totalWeight.textContent = item.totalWeight || 0;
        if (!warning) return;
        warning.textContent = item.warning || "OK";
        warning.className = item.warning && item.warning !== "OK" ? "text-amber-700" : "text-green-700";
      });
    }

    function recalculate(options = {}) {
      readQuote();
      result = calculateQuote(quote);
      if (options.renderItems) {
        renderItems();
      } else {
        refreshItemComputed();
      }
      updateSummary();
      if (window.lucide) lucide.createIcons();
    }

    function updateItemFromControl(control) {
      const row = control.closest("[data-item-id]");
      if (!row) return;
      const item = quote.items.find((entry) => entry.id === row.dataset.itemId);
      if (!item) return;
      const field = control.dataset.field;
      if (control.type === "checkbox") {
        item[field] = control.checked;
      } else if (["length", "width", "height", "weight", "qty", "declaredValue", "storageDays"].includes(field)) {
        item[field] = number(control.value);
      } else {
        item[field] = control.value;
      }
    }

    function addItem() {
      quote.items.push(createEmptyItem());
      recalculate({ renderItems: true });
    }

    function createEmptyItem(id = createId()) {
      return {
        id,
        name: "",
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
        qty: 1,
        packaging: "None",
        insurance: "Basic Liability",
        declaredValue: 0,
        storageDays: 0,
        fragile: false,
        nonStackable: false,
        crated: false,
        comment: "",
      };
    }

    function bindEvents() {
      document.querySelectorAll("[data-recalculate]").forEach((element) => {
        element.addEventListener("input", recalculate);
        element.addEventListener("change", recalculate);
      });
      byId("itemsBody").addEventListener("input", (event) => {
        updateItemFromControl(event.target);
        recalculate();
      });
      byId("itemsBody").addEventListener("change", (event) => {
        updateItemFromControl(event.target);
        recalculate();
      });
      byId("itemsBody").addEventListener("click", (event) => {
        if (!event.target.dataset.action) return;
        const row = event.target.closest("[data-item-id]");
        if (!row) return;
        const item = quote.items.find((entry) => entry.id === row.dataset.itemId);
        if (event.target.dataset.action === "duplicate-item" && item) {
          quote.items.splice(quote.items.indexOf(item) + 1, 0, { ...item, id: createId(), name: item.name ? `${item.name} copy` : "" });
        } else if (event.target.dataset.action === "clear-item") {
          quote.items = quote.items.map((entry) => entry.id === row.dataset.itemId ? createEmptyItem(row.dataset.itemId) : entry);
        } else if (event.target.dataset.action === "delete-item" && quote.items.length === 1) {
          quote.items = [createEmptyItem(row.dataset.itemId)];
        } else if (event.target.dataset.action === "delete-item") {
          quote.items = quote.items.filter((item) => item.id !== row.dataset.itemId);
        }
        recalculate({ renderItems: true });
      });
      byId("addItem").addEventListener("click", addItem);
      byId("saveDraft").addEventListener("click", () => {
        readQuote();
        storage.save(quote);
        byId("saveState").textContent = "Saved locally";
      });
      byId("loadDraft").addEventListener("click", () => {
        const draft = storage.load();
        if (!draft) {
          byId("saveState").textContent = "No local draft";
          return;
        }
        quote = draft;
        setFieldValues();
        recalculate({ renderItems: true });
        byId("saveState").textContent = "Loaded local draft";
      });
      byId("clearDraft").addEventListener("click", () => {
        storage.clear();
        quote = JSON.parse(JSON.stringify(blankQuote));
        setFieldValues();
        recalculate({ renderItems: true });
        byId("saveState").textContent = "New blank calculation";
      });
      byId("sendToSheet").addEventListener("click", async () => {
        const payload = sheet.buildPayload(quote, result);
        const response = await sheet.sendCalculation(payload);
        byId("saveState").textContent = response.success
          ? `Saved to Google Sheets: ${response.remote_id || "ok"}`
          : response.message || response.error || "Google Sheet response received";
      });
      document.querySelectorAll("[data-generate-estimate]").forEach((link) => {
        link.addEventListener("click", () => {
          readQuote();
          result = calculateQuote(quote);
          storage.saveEstimateSnapshot(buildEstimateSnapshot());
        });
      });
    }

    function init() {
      cacheFields();
      const params = new URLSearchParams(window.location.search);
      if (params.get("loadDraft") === "1") {
        quote = storage.load() || quote;
      }
      setFieldValues();
      result = calculateQuote(quote);
      renderItems();
      updateSummary();
      bindEvents();
      if (window.lucide) lucide.createIcons();
    }

    return { init };
  }

  window.CalculatorUI = {
    createApp,
  };
})();
