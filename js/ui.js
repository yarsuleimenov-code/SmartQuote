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
    const addressTypes = ["Warehouse", "Auction", "Business", "Apartments", "House"];

    const fields = {};

    function byId(id) {
      return document.getElementById(id);
    }

    function cacheFields() {
      [
        "leadName", "customerName", "customerPhone", "customerEmail",
        "pickupZip", "deliveryZip", "pickupAddress", "deliveryAddress",
        "pickupAddressType", "deliveryAddressType", "pickupFloor", "deliveryFloor",
        "pickupCrew", "deliveryCrew", "pickupDirectDate", "deliveryDirectDate",
        "helperRequirement", "deliveryType", "requestedDate", "extraLaborPeople", "extraLaborHours", "notes",
      ].forEach((id) => {
        fields[id] = byId(id);
      });
    }

    function normalizeAddressType(value) {
      if (addressTypes.includes(value)) return value;
      if (["Modern Apartment", "Old Apartment"].includes(value)) return "Apartments";
      if (["Office", "Retail"].includes(value)) return "Business";
      if (value === "Storage") return "Warehouse";
      return "House";
    }

    function setSelectValue(select, value, fallback = "House") {
      select.value = value;
      if (select.value !== value) select.value = fallback;
    }

    function accessElevatorAvailable(point) {
      if (point.elevatorAvailable !== undefined) return Boolean(point.elevatorAvailable);
      return !Boolean(point.elevatorUnavailable);
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
      setSelectValue(fields.pickupAddressType, normalizeAddressType(quote.access.pickup.addressType), "House");
      setSelectValue(fields.deliveryAddressType, normalizeAddressType(quote.access.delivery.addressType), "House");
      fields.pickupFloor.value = quote.access.pickup.floor || 1;
      fields.deliveryFloor.value = quote.access.delivery.floor || 1;
      fields.pickupCrew.value = quote.access.pickup.crew || "";
      fields.deliveryCrew.value = quote.access.delivery.crew || "";
      fields.pickupDirectDate.value = quote.options.pickupDirectDate || "";
      fields.deliveryDirectDate.value = quote.options.deliveryDirectDate || "";
      fields.helperRequirement.value = quote.options.helperRequirement || "Auto";
      fields.deliveryType.value = quote.options.deliveryType || "Consolidated Route";
      fields.requestedDate.value = quote.options.requestedDate || "";
      fields.extraLaborPeople.value = quote.options.extraLaborPeople || 0;
      fields.extraLaborHours.value = quote.options.extraLaborHours || 0;
      fields.notes.value = quote.options.notes || "";
      const legacyNote = byId("legacyManualAdjustmentNote");
      const legacyManualAdjustment = number(quote.options.manualAdjustment);
      if (legacyNote) {
        legacyNote.classList.toggle("hidden", legacyManualAdjustment <= 0);
        legacyNote.textContent = legacyManualAdjustment > 0
          ? `Legacy manual adjustment ${currency(legacyManualAdjustment)} is preserved from an older draft. New adjustments should use special labor fields.`
          : "";
      }

      ["pickupCoi", "pickupStairs"].forEach((id) => {
        byId(id).checked = Boolean(quote.access.pickup[id.replace("pickup", "").charAt(0).toLowerCase() + id.replace("pickup", "").slice(1)]);
      });
      ["deliveryCoi", "deliveryStairs"].forEach((id) => {
        byId(id).checked = Boolean(quote.access.delivery[id.replace("delivery", "").charAt(0).toLowerCase() + id.replace("delivery", "").slice(1)]);
      });
      byId("pickupElevatorAvailable").checked = accessElevatorAvailable(quote.access.pickup);
      byId("deliveryElevatorAvailable").checked = accessElevatorAvailable(quote.access.delivery);
      byId("pickupDirect").checked = Boolean(quote.options.pickupDirect);
      byId("deliveryDirect").checked = Boolean(quote.options.deliveryDirect);
      byId("exclusiveDelivery").checked = false;
      byId("priorityDate").checked = false;
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
        pickupCoverage: window.ZipCoverage?.get(fields.pickupZip.value.trim()) || null,
        deliveryCoverage: window.ZipCoverage?.get(fields.deliveryZip.value.trim()) || null,
      };
      quote.access = {
        pickup: {
          addressType: fields.pickupAddressType.value,
          coi: byId("pickupCoi").checked,
          stairs: byId("pickupStairs").checked,
          elevatorAvailable: byId("pickupElevatorAvailable").checked,
          elevatorUnavailable: false,
          narrowAccess: false,
          floor: number(fields.pickupFloor.value),
          longCarryFt: 0,
          crew: number(fields.pickupCrew.value),
        },
        delivery: {
          addressType: fields.deliveryAddressType.value,
          coi: byId("deliveryCoi").checked,
          stairs: byId("deliveryStairs").checked,
          elevatorAvailable: byId("deliveryElevatorAvailable").checked,
          elevatorUnavailable: false,
          narrowAccess: false,
          floor: number(fields.deliveryFloor.value),
          longCarryFt: 0,
          crew: number(fields.deliveryCrew.value),
        },
      };
      const legacyManualAdjustment = number(quote.options?.manualAdjustment);
      quote.options = {
        exclusiveDelivery: false,
        priorityDate: false,
        pickupDirect: byId("pickupDirect").checked,
        pickupDirectDate: fields.pickupDirectDate.value,
        deliveryDirect: byId("deliveryDirect").checked,
        deliveryDirectDate: fields.deliveryDirectDate.value,
        helperRequirement: fields.helperRequirement.value,
        deliveryType: fields.deliveryType.value,
        requestedDate: fields.requestedDate.value,
        extraLaborPeople: number(fields.extraLaborPeople.value),
        extraLaborHours: number(fields.extraLaborHours.value),
        extraLaborRate: quote.options?.extraLaborRate === undefined ? 50 : number(quote.options.extraLaborRate),
        manualAdjustment: legacyManualAdjustment,
        notes: fields.notes.value.trim(),
      };
    }

    function itemSelect(value, options) {
      return options.map((option) => `<option${option === value ? " selected" : ""}>${option}</option>`).join("");
    }

    function brokerPackagingOptions() {
      return Object.keys(window.CalculatorVariables.packagingRates).filter((option) => option !== "Bubble Protection");
    }

    function itemUnitMode(item) {
      return item.unitMode === "ft" ? "ft" : "in";
    }

    function displayDimension(value, mode) {
      return mode === "ft" ? number(value) / 12 : number(value);
    }

    function normalizedDimension(value, mode) {
      return mode === "ft" ? number(value) * 12 : number(value);
    }

    function protectionPlanFromItem(item) {
      if (["RV", "FVP", "DV"].includes(item.protectionPlan)) return item.protectionPlan;
      if (item.insurance === "Full Coverage") return "FVP";
      return "RV";
    }

    function legacyInsuranceFromProtection(plan) {
      if (plan === "FVP") return "Full Coverage";
      return "Basic Liability";
    }

    function protectionButton(plan, selected, label) {
      return `<button type="button" data-action="set-protection" data-protection="${plan}" class="rounded-md border px-3 py-2 text-xs font-semibold ${selected === plan ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}">${label}</button>`;
    }

    function protectionHelpText(protectionPlan) {
      if (protectionPlan === "FVP") return "Requires declared value.";
      if (protectionPlan === "DV") return "Future pricing; confirm value separately.";
      return "";
    }

    function warningStyle(severity) {
      if (severity === "blocking") {
        return {
          card: "border-red-200 bg-red-50",
          badge: "bg-red-100 text-red-700",
          label: "Blocking",
        };
      }
      if (severity === "approval") {
        return {
          card: "border-amber-200 bg-amber-50",
          badge: "bg-amber-100 text-amber-800",
          label: "Approval Required",
        };
      }
      if (severity === "info") {
        return {
          card: "border-blue-200 bg-blue-50",
          badge: "bg-blue-100 text-blue-700",
          label: "Info",
        };
      }
      return {
        card: "border-slate-200 bg-slate-50",
        badge: "bg-slate-200 text-slate-700",
        label: "Review",
      };
    }

    function readinessStyle(readiness) {
      if (readiness === "blocked") return "bg-red-100 text-red-700";
      if (readiness === "review") return "bg-amber-100 text-amber-800";
      return "bg-green-100 text-green-700";
    }

    function warningFocusTarget(target) {
      if (target === "items") return byId("itemsBody")?.querySelector("input");
      if (target === "quoteOptions") return byId("extraLaborPeople");
      if (target?.startsWith("item:")) {
        const [, itemId, field] = target.split(":");
        const itemRows = byId("itemsBody")?.querySelectorAll(`[data-item-id="${itemId}"]`);
        if (!itemRows?.length) return null;
        if (field) {
          for (const row of itemRows) {
            const control = row.querySelector(`[data-field="${field}"]`);
            if (control) return control;
          }
        }
        return itemRows[0].querySelector("input");
      }
      return byId(target);
    }

    function clearWarningHighlights() {
      ["pickupZip", "deliveryZip"].forEach((id) => {
        byId(id)?.classList.remove("border-red-400", "bg-red-50", "ring-1", "ring-red-200");
      });
      byId("itemsBody")?.querySelectorAll("[data-warning-highlight]").forEach((element) => {
        element.removeAttribute("data-warning-highlight");
        element.classList.remove("ring-2", "ring-amber-200", "bg-amber-50/40");
      });
    }

    function highlightWarningTarget(entry) {
      const target = warningFocusTarget(entry.target);
      if (!target) return;
      if (entry.scope === "route") {
        target.classList.add("border-red-400", "bg-red-50", "ring-1", "ring-red-200");
        return;
      }
      const row = target.closest("[data-item-id]");
      if (row) {
        row.setAttribute("data-warning-highlight", "true");
        row.classList.add("ring-2", "ring-amber-200", "bg-amber-50/40");
      }
    }

    function renderWarningCenter() {
      const presentation = window.WarningPresentation?.build({ quote, result }) || {
        readiness: { id: result.routeSupported ? "ready" : "review", label: result.routeSupported ? "Ready" : "Review Required" },
        warnings: [],
        blocksEstimate: false,
        enforcementEnabled: false,
      };
      const readiness = byId("quoteReadiness");
      readiness.textContent = presentation.readiness.label;
      readiness.className = `px-3 py-1 rounded-full text-xs font-semibold ${readinessStyle(presentation.readiness.id)}`;

      clearWarningHighlights();
      presentation.warnings.forEach(highlightWarningTarget);

      byId("warningCenter").innerHTML = presentation.warnings.length
        ? presentation.warnings.map((entry) => {
          const style = warningStyle(entry.severity);
          const approval = entry.approvalRole
            ? `<span class="text-[11px] text-slate-500">Owner: ${escapeHtml(entry.approvalRole)}</span>`
            : "";
          const impact = entry.businessImpact
            ? `<p class="mt-1 text-[11px] leading-4 text-slate-500">Impact: ${escapeHtml(entry.businessImpact)}</p>`
            : "";
          return `
            <article class="rounded-lg border p-3 ${style.card}">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.badge}">${style.label}</span>
                    <p class="font-semibold text-slate-800">${escapeHtml(entry.title)}</p>
                  </div>
                  <p class="mt-1 text-xs leading-5 text-slate-600">${escapeHtml(entry.message)}</p>
                  ${impact}
                  ${approval}
                </div>
                <button type="button" data-warning-focus="${escapeHtml(entry.target)}" class="shrink-0 text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline">${escapeHtml(entry.actionLabel)}</button>
              </div>
            </article>
          `;
        }).join("")
        : `
          <div class="rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-800">
            No current input or review warnings.
          </div>
        `;

      const enforcementNote = byId("warningEnforcementNote");
      enforcementNote.classList.toggle("hidden", !presentation.blocksEstimate || presentation.enforcementEnabled);
    }

    function renderItems() {
      const tbody = byId("itemsBody");
      tbody.innerHTML = quote.items.map((item, index) => {
        const computed = result.items.find((entry) => entry.id === item.id) || {};
        const unitMode = itemUnitMode(item);
        const protectionPlan = protectionPlanFromItem(item);
        const protectionHelp = protectionHelpText(protectionPlan);
        const packagingOptions = brokerPackagingOptions();
        const groupBg = index % 2 === 0 ? "bg-white" : "bg-slate-50/70";
        const detailBg = index % 2 === 0 ? "bg-slate-50/70" : "bg-slate-100/70";
        return `
          <tr data-item-id="${item.id}" class="border-t-8 border-t-slate-100 ${groupBg}">
            <td class="px-3 pt-3">
              <label class="block">
                <span class="text-xs text-slate-400">Item</span>
                <span class="mt-1 flex items-center gap-2">
                  <span class="inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-slate-100 px-2 text-xs font-semibold text-slate-500">${String(index + 1).padStart(2, "0")}</span>
                  <input data-field="name" placeholder="Item name" class="w-56 border rounded-lg px-2 py-2" value="${escapeHtml(item.name)}" />
                </span>
              </label>
              <div class="mt-2 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
                <button type="button" data-action="set-unit" data-unit="in" class="rounded-md px-2 py-1 ${unitMode === "in" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}">In</button>
                <button type="button" data-action="set-unit" data-unit="ft" class="rounded-md px-2 py-1 ${unitMode === "ft" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}">Ft</button>
              </div>
            </td>
            <td class="px-3 pt-3">
              <label class="block">
                <span class="text-xs text-slate-400">Length</span>
                <input data-field="length" data-dimension="true" type="number" placeholder="L" class="mt-1 w-20 border rounded-lg px-2 py-2" value="${displayDimension(item.length, unitMode)}" />
              </label>
            </td>
            <td class="px-3 pt-3">
              <label class="block">
                <span class="text-xs text-slate-400">Width</span>
                <input data-field="width" data-dimension="true" type="number" placeholder="W" class="mt-1 w-20 border rounded-lg px-2 py-2" value="${displayDimension(item.width, unitMode)}" />
              </label>
            </td>
            <td class="px-3 pt-3">
              <label class="block">
                <span class="text-xs text-slate-400">Height</span>
                <input data-field="height" data-dimension="true" type="number" placeholder="H" class="mt-1 w-20 border rounded-lg px-2 py-2" value="${displayDimension(item.height, unitMode)}" />
              </label>
            </td>
            <td class="px-3 pt-3">
              <label class="block">
                <span class="text-xs text-slate-400">Item weight</span>
                <input data-field="weight" type="number" placeholder="lb" class="mt-1 w-20 border rounded-lg px-2 py-2" value="${item.weight || 0}" />
              </label>
            </td>
            <td class="px-3 pt-3">
              <label class="block">
                <span class="text-xs text-slate-400">Qty</span>
                <input data-field="qty" type="number" min="1" placeholder="Qty" class="mt-1 w-16 border rounded-lg px-2 py-2" value="${item.qty || 1}" />
              </label>
            </td>
            <td class="px-3 pt-3">
              <label class="block">
                <span class="text-xs text-slate-400">Packaging</span>
                <select data-field="packaging" class="mt-1 w-40 border rounded-lg px-2 py-2">${itemSelect(item.packaging, packagingOptions)}</select>
              </label>
            </td>
            <td class="px-3 pt-3">
              <span class="block text-xs text-slate-400">Eff. volume</span>
              <span class="mt-1 block px-2 py-2 font-semibold text-slate-800" data-computed="effectiveVolume">${computed.effectiveVolume || 0}</span>
            </td>
            <td class="px-3 pt-3">
              <span class="block text-xs text-slate-400">Total weight</span>
              <span class="mt-1 block px-2 py-2 text-slate-800" data-computed="totalWeight">${computed.totalWeight || 0}</span>
            </td>
          </tr>
          <tr data-item-id="${item.id}" class="${detailBg}">
            <td colspan="9" class="px-3 pb-2">
              <div class="grid grid-cols-12 gap-3 items-end text-sm rounded-lg border border-slate-200/80 bg-white/70 p-2">
                <div class="col-span-2">
                  <span class="text-xs text-slate-400">Protection Plan</span>
                  <div class="mt-1 flex gap-2">
                    ${protectionButton("RV", protectionPlan, "RV")}
                    ${protectionButton("FVP", protectionPlan, "FVP")}
                    ${protectionButton("DV", protectionPlan, "DV")}
                  </div>
                  ${protectionHelp ? `<p class="mt-1 text-[11px] text-slate-400">${protectionHelp}</p>` : ""}
                </div>
                <label class="col-span-1">
                  <span class="text-xs text-slate-400">${protectionPlan === "FVP" ? "Declared Value *" : "Declared Value"}</span>
                  <input data-field="declaredValue" type="number" min="0" class="mt-1 w-full border rounded-lg px-2 py-2 ${protectionPlan === "FVP" && !number(item.declaredValue) ? "border-amber-300 bg-amber-50" : ""}" value="${item.declaredValue || 0}" />
                </label>
                <label class="col-span-1">
                  <span class="text-xs text-slate-400">Storage</span>
                  <input data-field="storageDays" type="number" class="mt-1 w-full border rounded-lg px-2 py-2" value="${item.storageDays || 0}" />
                </label>
                <label class="col-span-1 flex min-w-[96px] items-center gap-2 whitespace-nowrap bg-white border border-slate-200 rounded-lg px-3 py-2"><input data-field="fragile" type="checkbox" class="accent-teal-500"${item.fragile ? " checked" : ""} />Fragile</label>
                <label class="col-span-1 flex min-w-[96px] items-center gap-2 whitespace-nowrap bg-white border border-slate-200 rounded-lg px-3 py-2"><input data-field="nonStackable" type="checkbox" class="accent-teal-500"${item.nonStackable ? " checked" : ""} />N-stack</label>
                <label class="col-span-3">
                  <span class="text-xs text-slate-400">Comment</span>
                  <input data-field="comment" class="mt-1 w-full border rounded-lg px-2 py-2 bg-white" value="${escapeHtml(item.comment)}" />
                </label>
                <label class="col-span-2">
                  <span class="text-xs text-slate-400">Item Ref. Price</span>
                  <span data-computed="itemReferencePrice" class="mt-1 flex h-[38px] items-center rounded-lg border border-slate-200 bg-slate-50 px-2 font-semibold text-slate-700">${currency(computed.itemReferencePrice || 0)}</span>
                </label>
              </div>
            </td>
          </tr>
          <tr data-item-id="${item.id}" class="border-b-2 border-b-slate-200 ${detailBg}">
            <td colspan="9" class="px-3 pb-3">
              <div class="flex items-center justify-between gap-4 rounded-lg bg-white/60 px-3 py-2 text-xs">
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
      byId("summaryFinalPrice").textContent = currency(result.totals.finalPrice);
      byId("summaryTotalVolume").textContent = `${result.totals.totalVolume.toFixed(1)} cu ft`;
      byId("summaryTotalWeight").textContent = `${result.totals.totalWeight.toFixed(0)} lb`;
      byId("effectiveCostSummary").textContent = `Effective $/cu ft ${currency(result.totals.effectiveCostPerCuFt)}`;
      byId("effectiveCostPerCuFt").textContent = result.totals.totalVolume > 0 ? currency(result.totals.effectiveCostPerCuFt) : "N/A";
      byId("summaryExtraLaborHours").textContent = `${result.totals.extraLaborHours || 0}`;
      byId("summaryExtraLaborCost").textContent = currency(result.totals.extraLaborCost);
      byId("extraLaborCostPreview").textContent = currency(result.totals.extraLaborCost);
      byId("summaryRoute").textContent = `${result.pickupZone} -> ${result.deliveryZone}`;
      byId("summaryVehicle").textContent = result.vehicle.name;
      byId("summaryCrew").textContent = result.requiredCrew
        ? `P ${result.crew.pickup} / D ${result.crew.delivery}`
        : "0";
      byId("summarySpecialHandling").textContent = currency(result.totals.extraLaborCost);
      byId("effectiveVolume").textContent = `${Math.ceil(result.totals.effectiveVolume || 0)} cu ft`;
      byId("totalVolume").textContent = `${result.totals.totalVolume.toFixed(1)} cu ft`;
      byId("totalWeight").textContent = `${result.totals.totalWeight.toFixed(0)} lb`;
      renderWarningCenter();
      byId("payloadPreview").textContent = JSON.stringify(sheet.buildPayload(quote, result), null, 2);
      const directRecommendation = byId("directRecommendation");
      if (directRecommendation) {
        const shouldReviewDirect = (result.totals.effectiveVolume || 0) >= 250;
        directRecommendation.classList.toggle("hidden", !shouldReviewDirect);
      }
    }

    function buildEstimateSnapshot() {
      const createdAt = new Date();
      const validUntil = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
      return {
        snapshotVersion: 2,
        formulaVersion: window.CalculatorVariables?.formulaVersion || "unknown",
        variablesSnapshot: window.PricingConfig?.snapshot?.() || null,
        calculationContract: result.calculationContract || null,
        createdAt: createdAt.toISOString(),
        validUntil: validUntil.toISOString(),
        estimateId: quote.estimateId || "EST-291",
        status: "generated",
        extraLaborPeople: result.totals.extraLaborPeople,
        extraLaborHours: result.totals.extraLaborHours,
        extraLaborRate: result.totals.extraLaborRate,
        extraLaborCost: result.totals.extraLaborCost,
        effectiveCostPerCuFt: result.totals.effectiveCostPerCuFt,
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
        const itemReferencePrice = itemRows.map((row) => row.querySelector('[data-computed="itemReferencePrice"]')).find(Boolean);
        if (effectiveVolume) effectiveVolume.textContent = item.effectiveVolume || 0;
        if (totalWeight) totalWeight.textContent = item.totalWeight || 0;
        if (itemReferencePrice) itemReferencePrice.textContent = currency(item.itemReferencePrice || 0);
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
      } else if (control.dataset.dimension === "true") {
        item[field] = normalizedDimension(control.value, itemUnitMode(item));
      } else if (["weight", "qty", "declaredValue", "storageDays"].includes(field)) {
        item[field] = number(control.value);
      } else {
        item[field] = control.value;
        if (field === "insurance") {
          item.protectionPlan = protectionPlanFromItem(item);
          item.protectionLegacyType = item.insurance;
        }
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
        unitMode: "in",
        weight: 0,
        qty: 1,
        packaging: "None",
        insurance: "Basic Liability",
        declaredValue: 0,
        storageDays: 0,
        fragile: false,
        nonStackable: false,
        crated: false,
        protectionPlan: "RV",
        protectionLegacyType: "Basic Liability",
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
        } else if (event.target.dataset.action === "set-unit" && item) {
          item.unitMode = event.target.dataset.unit === "ft" ? "ft" : "in";
        } else if (event.target.dataset.action === "set-protection" && item) {
          item.protectionPlan = event.target.dataset.protection;
          item.insurance = legacyInsuranceFromProtection(item.protectionPlan);
          item.protectionLegacyType = item.insurance;
        }
        recalculate({ renderItems: true });
      });
      byId("warningCenter").addEventListener("click", (event) => {
        const button = event.target.closest("[data-warning-focus]");
        if (!button) return;
        const target = warningFocusTarget(button.dataset.warningFocus);
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => target.focus(), 250);
      });
      byId("addItem").addEventListener("click", addItem);
      byId("addItemBottom").addEventListener("click", addItem);
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
        quote = storage.selectDraft(params.get("draftId")) || storage.load() || quote;
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
