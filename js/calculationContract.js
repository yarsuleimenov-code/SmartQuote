(function () {
  const contractVersion = "smartquote-calculation-v1";
  const traceVersion = "normalized-formula-trace-v1";

  function clone(value) {
    return JSON.parse(JSON.stringify(value ?? null));
  }

  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function normalizeItem(item, index) {
    const source = item || {};
    return {
      ...clone(source),
      id: source.id || `item-${index + 1}`,
      name: String(source.name || ""),
      length: number(source.length),
      width: number(source.width),
      height: number(source.height),
      weight: number(source.weight),
      qty: Math.max(number(source.qty, 1), 0),
      declaredValue: Math.max(number(source.declaredValue), 0),
      storageDays: Math.max(number(source.storageDays), 0),
      fragile: Boolean(source.fragile),
      nonStackable: Boolean(source.nonStackable),
      crated: Boolean(source.crated),
    };
  }

  function normalizeAccessSide(side) {
    const source = side || {};
    return {
      ...clone(source),
      addressType: String(source.addressType || "House"),
      floor: Math.max(number(source.floor, 1), 0),
      elevatorAvailable: Boolean(source.elevatorAvailable),
      stairs: Boolean(source.stairs),
      coi: Boolean(source.coi),
      direct: Boolean(source.direct),
      directDate: source.directDate || "",
    };
  }

  function normalizeInput(quote) {
    const source = quote || {};
    return {
      ...clone(source),
      route: {
        ...clone(source.route || {}),
        pickupZip: String(source.route?.pickupZip || "").trim(),
        deliveryZip: String(source.route?.deliveryZip || "").trim(),
      },
      items: (Array.isArray(source.items) ? source.items : []).map(normalizeItem),
      access: {
        ...clone(source.access || {}),
        pickup: normalizeAccessSide(source.access?.pickup),
        delivery: normalizeAccessSide(source.access?.delivery),
      },
      options: {
        ...clone(source.options || {}),
        deliveryType: source.options?.deliveryType || "Consolidated Route",
        requestedDate: source.options?.requestedDate || "",
        pickupDirect: Boolean(source.options?.pickupDirect),
        pickupDirectDate: source.options?.pickupDirectDate || "",
        deliveryDirect: Boolean(source.options?.deliveryDirect),
        deliveryDirectDate: source.options?.deliveryDirectDate || "",
        extraLaborPeople: Math.max(number(source.options?.extraLaborPeople), 0),
        extraLaborHours: Math.max(number(source.options?.extraLaborHours), 0),
        extraLaborRate: Math.max(number(source.options?.extraLaborRate, 50), 0),
      },
    };
  }

  function zipCoverage(zip, fallback) {
    const normalizedZip = String(zip || "").replace(/\D/g, "").slice(0, 5);
    if (window.ZipCoverage?.get) return window.ZipCoverage.get(normalizedZip);
    return {
      zip: normalizedZip,
      region: fallback?.region || "",
      zone: fallback?.zone || "",
      inCoverageDataset: Boolean(fallback?.inCoverageDataset),
      coverageStatus: fallback?.coverageStatus || "unknown",
      priceCoefficient: number(fallback?.priceCoefficient, 1),
    };
  }

  function coverageReadiness(coverage) {
    if (!coverage?.zip) return "missing_zip";
    if (!coverage.inCoverageDataset) return "out_of_coverage_dataset";
    if (coverage.coverageStatus === "disabled") return "excluded";
    if (coverage.coverageStatus === "approval_required") return "review_required";
    return "covered";
  }

  function routeType(input) {
    if (input.options.pickupDirect || input.options.deliveryDirect) return "direct";
    if (input.options.requestedDate || input.options.pickupDirectDate || input.options.deliveryDirectDate) {
      return "specific_date";
    }
    return "consolidated";
  }

  function normalizedOrderInputs(input) {
    const billableItems = input.items.filter((item) => item.name || item.length || item.width || item.height || item.weight);
    return {
      recordId: input.localId || input.estimateId || null,
      status: input.status || "draft",
      customer: {
        leadName: input.customer?.leadName || "",
        namePresent: Boolean(input.customer?.name),
      },
      route: {
        pickupZip: input.route.pickupZip,
        deliveryZip: input.route.deliveryZip,
        pickupAddressPresent: Boolean(input.route.pickupAddress),
        deliveryAddressPresent: Boolean(input.route.deliveryAddress),
      },
      service: {
        deliveryType: input.options.deliveryType,
        requestedDate: input.options.requestedDate,
        pickupDirect: input.options.pickupDirect,
        pickupDirectDate: input.options.pickupDirectDate,
        deliveryDirect: input.options.deliveryDirect,
        deliveryDirectDate: input.options.deliveryDirectDate,
      },
      access: {
        pickup: input.access.pickup,
        delivery: input.access.delivery,
      },
      items: {
        totalRows: input.items.length,
        billableRows: billableItems.length,
        rows: input.items.map((item) => ({
          id: item.id,
          namePresent: Boolean(item.name),
          length: item.length,
          width: item.width,
          height: item.height,
          weight: item.weight,
          qty: item.qty,
          packaging: item.packaging || "None",
          protectionPlan: item.protectionPlan || "RV",
          fragile: item.fragile,
          nonStackable: item.nonStackable,
        })),
      },
    };
  }

  function routeClassification(input, result) {
    const pickupCoverage = zipCoverage(input.route.pickupZip, input.route.pickupCoverage);
    const deliveryCoverage = zipCoverage(input.route.deliveryZip, input.route.deliveryCoverage);
    const pickupReadiness = coverageReadiness(pickupCoverage);
    const deliveryReadiness = coverageReadiness(deliveryCoverage);
    const directRequested = input.options.pickupDirect || input.options.deliveryDirect;
    const specificDateRequested = Boolean(
      input.options.requestedDate || input.options.pickupDirectDate || input.options.deliveryDirectDate,
    );

    return {
      routeType: routeType(input),
      routeSupported: Boolean(result?.routeSupported),
      pickup: {
        zip: input.route.pickupZip,
        zone: result?.pickupZone || "",
        coverage: pickupCoverage,
        readiness: pickupReadiness,
      },
      delivery: {
        zip: input.route.deliveryZip,
        zone: result?.deliveryZone || "",
        coverage: deliveryCoverage,
        readiness: deliveryReadiness,
      },
      distance: {
        interstateMiles: number(result?.distance),
        source: directRequested || specificDateRequested ? "approved_average_pending_direct_mileage" : "approved_average_matrix",
        priceImpactActive: false,
      },
      serviceFlags: {
        directRequested,
        specificDateRequested,
      },
      routeCoefficient: {
        pickup: pickupCoverage.priceCoefficient,
        delivery: deliveryCoverage.priceCoefficient,
        priceImpactActive: false,
      },
    };
  }

  function itemWeightClass(unitWeight) {
    if (unitWeight >= 200) return "two_person_required";
    if (unitWeight >= 100) return "heavy";
    if (unitWeight > 40) return "standard";
    return "light";
  }

  function handlingComplexity(item) {
    const factors = [];
    if (item.fragile) factors.push("fragile");
    if (item.nonStackable) factors.push("non_stackable");
    if (item.crated) factors.push("custom_crate");
    if (number(item.effectiveVolume) >= 80) factors.push("bulky_volume");
    if (number(item.weight) >= 100) factors.push("heavy_unit_weight");

    return {
      factors,
      score: factors.length,
      classification: factors.length >= 2 ? "complex" : factors.length === 1 ? "attention_required" : "standard",
    };
  }

  function accessConstraint(accessSide) {
    const side = accessSide || {};
    return Boolean(
      (side.stairs && number(side.floor, 1) > 1) ||
      (!side.elevatorAvailable && number(side.floor, 1) > 1) ||
      side.coi
    );
  }

  function itemHandlingFeasibility(input, result) {
    const resultItems = Array.isArray(result?.items) ? result.items : [];
    const sourceById = new Map(input.items.map((item) => [item.id, item]));
    const rows = resultItems.map((item, index) => {
      const source = sourceById.get(item.id) || input.items[index] || {};
      const unitWeight = number(source.weight);
      const qty = Math.max(number(source.qty, 1), 0);
      const complexity = handlingComplexity({ ...source, ...item });
      return {
        id: item.id || source.id || `item-${index + 1}`,
        name: item.name || source.name || "",
        unitWeight,
        quantity: qty,
        totalWeight: number(item.totalWeight, unitWeight * qty),
        physicalVolume: number(item.volume),
        effectiveVolume: number(item.effectiveVolume),
        weightClass: itemWeightClass(unitWeight),
        handlingComplexity: complexity,
        warning: item.warning || "OK",
        baselineCrewNeed: number(item.crewNeed, 0),
        onePersonEligibleByWeight: unitWeight > 0 && unitWeight <= 100,
      };
    });

    const maxSingleItemWeight = rows.reduce((max, item) => Math.max(max, item.unitWeight), 0);
    const totalPieces = rows.reduce((sum, item) => sum + item.quantity, 0);
    const heavyPieceCount = rows.reduce((sum, item) => sum + (item.unitWeight >= 100 ? item.quantity : 0), 0);
    const pickupHardAccess = accessConstraint(input.access?.pickup);
    const deliveryHardAccess = accessConstraint(input.access?.delivery);
    const requiredCrewFromItems = rows.length ? Math.max(...rows.map((item) => item.baselineCrewNeed || 1)) : 0;
    const hardAccessCrewReview = (pickupHardAccess || deliveryHardAccess) && maxSingleItemWeight >= 100;

    return {
      priceImpactActive: false,
      maxSingleItemWeight,
      heaviestItemWeightClass: itemWeightClass(maxSingleItemWeight),
      totalPieces,
      heavyPieceCount,
      onePersonEligible: rows.length > 0 && maxSingleItemWeight > 0 && maxSingleItemWeight <= 100 && !hardAccessCrewReview,
      requiredCrewFromItems,
      crewReviewRequired: requiredCrewFromItems > 2 || hardAccessCrewReview || maxSingleItemWeight >= 200,
      hardAccessConstraint: {
        pickup: pickupHardAccess,
        delivery: deliveryHardAccess,
        combined: pickupHardAccess || deliveryHardAccess,
      },
      rows,
    };
  }

  function referenceVersions(variablesSnapshot) {
    let vehicleSeedVersion = "runtime-unversioned";
    try {
      vehicleSeedVersion = window.localStorage?.getItem("vehiclesSeedVersion") || vehicleSeedVersion;
    } catch {
      // Storage is optional in isolated calculation tests.
    }

    const fuelVersion = variablesSnapshot?.fuelPrices?.find((entry) => entry?.variablesVersion)?.variablesVersion;
    return {
      vehicles: vehicleSeedVersion,
      fuelPrices: fuelVersion || variablesSnapshot?.variablesVersion || "runtime-unversioned",
      distanceMatrix: variablesSnapshot?.variablesVersion || "runtime-unversioned",
      zipCoverage: window.CoverageZipDataVersion || "runtime-unversioned",
    };
  }

  function traceRows(input, result, normalizedInputs, classification, handling) {
    const totals = result?.totals || {};
    const stages = result?.stageBreakdown || {};
    const baselineRows = [
      { formulaId: "RTE-001", outputPath: "pickupZone", value: result?.pickupZone },
      { formulaId: "RTE-002", outputPath: "deliveryZone", value: result?.deliveryZone },
      { formulaId: "RTE-003", outputPath: "distance", value: result?.distance },
      { formulaId: "PICK-007", outputPath: "stageBreakdown.pickup.total", value: stages.pickup?.total },
      { formulaId: "INT-004", outputPath: "stageBreakdown.interstate.total", value: stages.interstate?.total },
      { formulaId: "DEL-007", outputPath: "stageBreakdown.delivery.total", value: stages.delivery?.total },
      { formulaId: "FINAL-009", outputPath: "totals.routeCost", value: totals.routeCost },
      { formulaId: "FINAL-012", outputPath: "totals.rawPrice", value: totals.rawPrice },
      { formulaId: "FINAL-014", outputPath: "totals.finalPrice", value: totals.finalPrice },
    ].map((row) => ({
      ...row,
      status: "Implemented / Baseline",
      inputRecordId: input.localId || input.estimateId || null,
    }));

    const contractOnlyRows = [
      { formulaId: "TBE-RTE-001", outputPath: "calculationContract.routeClassification.routeType", value: classification.routeType },
      { formulaId: "TBE-RTE-002", outputPath: "calculationContract.routeClassification.pickup.coverage", value: classification.pickup.coverage },
      { formulaId: "TBE-RTE-002", outputPath: "calculationContract.routeClassification.delivery.coverage", value: classification.delivery.coverage },
      { formulaId: "TBE-RTE-003", outputPath: "calculationContract.routeClassification.distance.source", value: classification.distance.source },
      { formulaId: "WARN-005-OUT-OF-ZONE", outputPath: "calculationContract.routeClassification.pickup.readiness", value: classification.pickup.readiness },
      { formulaId: "WARN-005-OUT-OF-ZONE", outputPath: "calculationContract.routeClassification.delivery.readiness", value: classification.delivery.readiness },
      { formulaId: "WARN-006-DIRECT-SERVICE-REVIEW", outputPath: "calculationContract.routeClassification.serviceFlags", value: classification.serviceFlags },
      { formulaId: "SYS-001", outputPath: "calculationContract.normalizedOrderInputs", value: normalizedInputs },
      { formulaId: "TBE-HND-001", outputPath: "calculationContract.itemHandlingFeasibility.maxSingleItemWeight", value: handling.maxSingleItemWeight },
      { formulaId: "TBE-HND-002", outputPath: "calculationContract.itemHandlingFeasibility.heaviestItemWeightClass", value: handling.heaviestItemWeightClass },
      { formulaId: "TBE-HND-003", outputPath: "calculationContract.itemHandlingFeasibility.onePersonEligible", value: handling.onePersonEligible },
      { formulaId: "TBE-HND-006", outputPath: "calculationContract.itemHandlingFeasibility.rows", value: handling.rows },
      { formulaId: "TBE-HND-007", outputPath: "calculationContract.itemHandlingFeasibility.requiredCrewFromItems", value: handling.requiredCrewFromItems },
      { formulaId: "TBE-HND-017", outputPath: "calculationContract.itemHandlingFeasibility.hardAccessConstraint", value: handling.hardAccessConstraint },
      { formulaId: "TBE-WARN-003", outputPath: "calculationContract.itemHandlingFeasibility.crewReviewRequired", value: handling.crewReviewRequired },
    ].map((row) => ({
      ...row,
      status: "Contract only / No price impact",
      inputRecordId: input.localId || input.estimateId || null,
    }));

    return baselineRows.concat(contractOnlyRows);
  }

  function finalize(input, result) {
    const variablesSnapshot = window.PricingConfig?.snapshot?.() || null;
    const normalizedInputs = normalizedOrderInputs(input);
    const classification = routeClassification(input, result);
    const handling = itemHandlingFeasibility(input, result);
    return {
      ...result,
      calculationContract: {
        contractVersion,
        traceVersion,
        calculatedAt: new Date().toISOString(),
        formulaVersion: window.CalculatorVariables?.formulaVersion || "unknown",
        variablesVersion: variablesSnapshot?.variablesVersion || window.CalculatorVariables?.variablesVersion || "unknown",
        referenceVersions: referenceVersions(variablesSnapshot),
        normalizedInput: clone(input),
        normalizedOrderInputs: normalizedInputs,
        routeClassification: classification,
        itemHandlingFeasibility: handling,
        trace: traceRows(input, result, normalizedInputs, classification, handling),
      },
    };
  }

  const baselineCalculate = window.PricingCalculator?.calculateQuote;
  if (typeof baselineCalculate === "function") {
    window.PricingCalculator.calculateQuoteBaseline = baselineCalculate;
    window.PricingCalculator.calculateQuote = function calculateQuoteWithContract(quote) {
      const input = normalizeInput(quote);
      return finalize(input, baselineCalculate(input));
    };
  }

  window.CalculationContract = {
    contractVersion,
    traceVersion,
    normalizeInput,
    normalizedOrderInputs,
    routeClassification,
    itemHandlingFeasibility,
    referenceVersions,
    traceRows,
    finalize,
  };
})();
