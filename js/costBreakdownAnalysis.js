(function () {
  const notAvailable = "Not available";

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function contract(result) {
    return result?.calculationContract || null;
  }

  function percent(value) {
    if (!Number.isFinite(Number(value))) return notAvailable;
    return `${Math.round(Number(value) * 100)}%`;
  }

  function decimal(value, digits = 2) {
    if (!Number.isFinite(Number(value))) return notAvailable;
    return Number(value).toFixed(digits);
  }

  function label(value) {
    if (value === true) return "Pass";
    if (value === false) return "Fail";
    if (value === "not_available" || value === null || value === undefined || value === "") return notAvailable;
    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  function traceBlock(formulaId) {
    if (String(formulaId).startsWith("TBE-RTE") || String(formulaId).startsWith("WARN-005") || String(formulaId).startsWith("WARN-006")) return "Route Contract";
    if (String(formulaId).startsWith("TBE-HND") || String(formulaId).startsWith("TBE-WARN")) return "Item Handling";
    if (String(formulaId).startsWith("TBE-CAP")) return "Capacity Analysis";
    if (String(formulaId).startsWith("FIT") || String(formulaId).startsWith("WARN-003")) return "Vehicle Fit";
    if (String(formulaId).startsWith("TBE-VEH")) return "Vehicle Reference";
    if (String(formulaId).startsWith("FINAL")) return "Final Total";
    if (String(formulaId).startsWith("PICK")) return "Pickup Stage";
    if (String(formulaId).startsWith("INT")) return "Interstate Stage";
    if (String(formulaId).startsWith("DEL")) return "Delivery Stage";
    return "Calculation Contract";
  }

  function stageReconciliation(result) {
    const stages = result?.stageBreakdown || {};
    const pickup = number(stages.pickup?.total);
    const interstate = number(stages.interstate?.total);
    const delivery = number(stages.delivery?.total);
    const stageTotal = pickup + interstate + delivery;
    const routeCost = number(result?.totals?.routeCost);
    const operationalCost = number(result?.totals?.operationalCost);
    const nonRouteOperationalCost = operationalCost - routeCost;
    const operationalStageTotal = stageTotal + nonRouteOperationalCost;
    const routeDelta = Math.round((stageTotal - routeCost) * 100) / 100;
    const operationalDelta = Math.round((operationalStageTotal - operationalCost) * 100) / 100;
    return {
      pickup,
      interstate,
      delivery,
      stageTotal,
      routeCost,
      operationalCost,
      nonRouteOperationalCost,
      operationalStageTotal,
      routeDelta,
      operationalDelta,
      routeReconciled: Math.abs(routeDelta) <= 1,
      operationalReconciled: Math.abs(operationalDelta) <= 1,
      reconciled: Math.abs(routeDelta) <= 1 && Math.abs(operationalDelta) <= 1,
    };
  }

  function warningPresentation(quote, result, useStoredCoverage) {
    if (!window.WarningPresentation?.build) {
      return {
        readiness: { id: result?.routeSupported ? "ready" : "review", label: result?.routeSupported ? "Ready" : "Review Required" },
        warnings: [],
        blocksEstimate: false,
        enforcementEnabled: false,
      };
    }
    return window.WarningPresentation.build({ quote, result, useStoredCoverage });
  }

  function capacityAnalysis(result, presentation) {
    const fit = contract(result)?.capacityVehicleFit;
    if (fit) {
      return {
        shipmentDensity: `${decimal(fit.utilization?.shipmentDensityLbPerCuFt)} lb/cu ft`,
        vehicleDensityThreshold: `${decimal(fit.utilization?.vehicleDensityCapacityLbPerCuFt)} lb/cu ft`,
        volumeUtilization: percent(fit.utilization?.vehicleUtilization),
        payloadUtilization: percent(fit.utilization?.payloadUtilization),
        limitingFactor: percent(fit.utilization?.limitingCapacityFactor),
        selectedCostBasis: label(fit.utilization?.capacityConstraintType),
        selectedVehicle: fit.selectedVehicle?.name || result?.vehicle?.name || notAvailable,
        recommendedVehicle: fit.recommendedVehicle?.name || notAvailable,
        warningStatus: "No price impact",
      };
    }

    return {
      shipmentDensity: notAvailable,
      vehicleDensityThreshold: notAvailable,
      volumeUtilization: notAvailable,
      payloadUtilization: notAvailable,
      limitingFactor: notAvailable,
      selectedCostBasis: notAvailable,
      selectedVehicle: result?.vehicle?.name || result?.vehicle?.vehicleName || notAvailable,
      recommendedVehicle: notAvailable,
      warningStatus: presentation?.readiness?.label || notAvailable,
    };
  }

  function vehicleFit(result) {
    const fit = contract(result)?.capacityVehicleFit;
    if (fit) {
      return {
        status: fit.fit?.capacityOverflowFlag ? "Review Required" : "Capacity fit",
        selectedVehicle: fit.selectedVehicle?.name || result?.vehicle?.name || notAvailable,
        recommendedVehicle: fit.recommendedVehicle?.name || notAvailable,
        dimensionalFit: fit.fit?.dimensionalFit,
        doorOpeningFit: fit.fit?.doorOpeningFit,
        volumeFit: fit.fit?.volumeFit,
        payloadFit: fit.fit?.weightFit,
        equipmentFit: fit.fit?.equipmentFit,
      };
    }

    return {
      status: notAvailable,
      selectedVehicle: result?.vehicle?.name || result?.vehicle?.vehicleName || notAvailable,
      recommendedVehicle: notAvailable,
      dimensionalFit: null,
      doorOpeningFit: null,
      volumeFit: null,
      payloadFit: null,
      equipmentFit: null,
    };
  }

  function formulaTrace(result, snapshotMeta = {}) {
    const contractRows = contract(result)?.trace;
    if (Array.isArray(contractRows) && contractRows.length) {
      return contractRows.map((row) => ({
        formulaId: row.formulaId,
        block: traceBlock(row.formulaId),
        input: row.outputPath,
        source: row.status?.startsWith("Implemented") ? "calculator result" : "calculationContract",
        formula: row.status?.startsWith("Implemented") ? "Baseline calculator output" : "Contract-only output; no price impact",
        result: row.value,
        unit: "",
        goesTo: row.outputPath,
        status: row.status,
      }));
    }

    const stages = result?.stageBreakdown || {};
    const totals = result?.totals || {};
    const reconciliation = stageReconciliation(result);
    const baseline = "AS-IS Baseline";
    const traceRows = [
      {
        formulaId: "PICK-007",
        block: "Pickup Stage",
        input: "Pickup labor + mileage + handling + management / dispatch",
        source: "stageBreakdown.pickup.components",
        formula: "Pickup stage component sum",
        result: stages.pickup?.total,
        unit: "USD",
        goesTo: "FINAL-009 Route Cost",
        status: baseline,
      },
      {
        formulaId: "INT-004",
        block: "Interstate Stage",
        input: "Fuel + vehicle cost + driver",
        source: "stageBreakdown.interstate.components",
        formula: "Interstate stage component sum",
        result: stages.interstate?.total,
        unit: "USD",
        goesTo: "FINAL-009 Route Cost",
        status: baseline,
      },
      {
        formulaId: "DEL-007",
        block: "Delivery Stage",
        input: "Delivery labor + mileage + handling + management / dispatch",
        source: "stageBreakdown.delivery.components",
        formula: "Delivery stage component sum",
        result: stages.delivery?.total,
        unit: "USD",
        goesTo: "FINAL-009 Route Cost",
        status: baseline,
      },
      {
        formulaId: "FINAL-009",
        block: "Final Total",
        input: `${reconciliation.pickup} + ${reconciliation.interstate} + ${reconciliation.delivery}`,
        source: "stageBreakdown stage totals",
        formula: "Pickup + Interstate + Delivery",
        result: totals.routeCost,
        unit: "USD",
        goesTo: "Operational Cost / Raw Price",
        status: reconciliation.routeReconciled ? baseline : "Review mismatch",
      },
      {
        formulaId: "FINAL-012",
        block: "Final Total",
        input: "Brokered price + additional charges + quote adjustment",
        source: "calculator result totals",
        formula: "Raw price before rounding",
        result: totals.rawPrice,
        unit: "USD",
        goesTo: "FINAL-014 Final Customer Price",
        status: baseline,
      },
      {
        formulaId: "FINAL-014",
        block: "Final Total",
        input: `${number(totals.rawPrice)}; rounding ${number(snapshotMeta.rounding || 10)}`,
        source: "totals.rawPrice + variablesSnapshot.settings.rounding",
        formula: "CEILING(Raw Price, Rounding Increment)",
        result: totals.finalPrice,
        unit: "USD",
        goesTo: "Estimate Snapshot",
        status: baseline,
      },
      {
        formulaId: "INT-CAP-*",
        block: "Capacity / Density",
        input: notAvailable,
        source: "Formula Sprint output required",
        formula: "Density, utilization, limiting factor, selected cost basis",
        result: null,
        unit: "",
        goesTo: "Capacity Analysis",
        status: "Blocked - output approval required",
      },
      {
        formulaId: "FIT-*",
        block: "Vehicle Fit",
        input: notAvailable,
        source: "Vehicle body specifications and fit output required",
        formula: "Dimensional, door, volume, payload, equipment fit",
        result: null,
        unit: "",
        goesTo: "Vehicle Fit / Warning Center",
        status: "Blocked - reference data required",
      },
    ];

    return traceRows;
  }

  window.CostBreakdownAnalysis = {
    notAvailable,
    stageReconciliation,
    warningPresentation,
    capacityAnalysis,
    vehicleFit,
    formulaTrace,
  };
})();
