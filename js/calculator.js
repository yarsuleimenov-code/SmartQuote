(function () {
  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function money(value) {
    return Math.round(number(value) * 100) / 100;
  }

  function roundUp(value, increment) {
    if (!increment) return Math.ceil(value);
    return Math.ceil(value / increment) * increment;
  }

  function getCanonicalZone(zip) {
    const rawZone = window.CalculatorZoneZipMap?.[String(zip || "").trim()];
    return window.CalculatorVariables.normalizeZoneName(rawZone);
  }

  function getDistance(pickupZone, deliveryZone) {
    return window.CalculatorVariables.distanceMatrix[pickupZone]?.[deliveryZone] || null;
  }

  function itemVolume(item) {
    return (number(item.length) / 12) * (number(item.width) / 12) * (number(item.height) / 12) * number(item.qty, 1);
  }

  function hasBillableItemShape(item) {
    return number(item.qty, 1) > 0 && (itemVolume(item) > 0 || number(item.weight) * number(item.qty, 1) > 0);
  }

  function itemEffectiveVolume(item, baseVolume) {
    let multiplier = 1;
    if (item.fragile) multiplier += 0.1;
    if (item.nonStackable) multiplier += 0.25;
    if (item.crated) multiplier += 0.15;
    return Math.ceil(baseVolume * multiplier);
  }

  function getVehicle(effectiveVolume, totalWeight) {
    const vehicles = window.PricingConfig?.getActiveVehicles?.() || window.CalculatorVariables.vehicleTypes.filter((vehicle) => vehicle.active !== false);
    return vehicles.find((vehicle) => effectiveVolume <= vehicle.volume && totalWeight <= vehicle.payload) || vehicles[vehicles.length - 1];
  }

  function getVehicleByName(name, fallback) {
    const vehicles = window.PricingConfig?.getActiveVehicles?.() || window.CalculatorVariables.vehicleTypes.filter((vehicle) => vehicle.active !== false);
    return vehicles.find((vehicle) => vehicle.name === name || vehicle.vehicleName === name) || fallback;
  }

  function readFuelPrices() {
    const fallback = window.CalculatorVariables.fuelPrices || [];
    return window.PricingConfig?.readStorageBucket?.("fuelPrices", fallback) || fallback;
  }

  function getFuelPrice(vehicle) {
    const fuelType = vehicle.fuelType || "Diesel";
    return readFuelPrices().find((fuel) => fuel.fuelType === fuelType) || null;
  }

  function internalFuelPrice(vehicle) {
    const fuel = getFuelPrice(vehicle);
    if (!fuel) return null;
    const currentAvg = number(fuel.currentAvg);
    const fuelSurchargePct = number(fuel.fuelSurchargePct);
    return currentAvg * (1 + fuelSurchargePct / 100);
  }

  function fuelCostPerMile(vehicle) {
    const calculatedInternalFuelPrice = internalFuelPrice(vehicle);
    const mpg = number(vehicle.calculationMpg || vehicle.mpg);
    if (calculatedInternalFuelPrice && mpg > 0) return calculatedInternalFuelPrice / mpg;
    return number(vehicle.fuelPerMile);
  }

  function fuelCostPerUnitMile(vehicle, isVolume) {
    const denominator = isVolume ? number(vehicle.volume) : number(vehicle.payload);
    if (denominator > 0) return fuelCostPerMile(vehicle) / denominator;
    return number(isVolume ? vehicle.fuelPerMilePerCuFt : vehicle.fuelPerMilePerLb);
  }

  function itemWarning(item, volume, totalWeight) {
    const rules = window.CalculatorVariables.warningRules;
    const dimensionSumFt = (number(item.length) + number(item.width) + number(item.height)) / 12;
    if (volume > 0 && totalWeight === 0) return "Fill up the weight";
    if (number(item.weight) >= rules.unacceptableWeightLb) return "Extremely heavy";
    if (number(item.weight) >= rules.onePersonMaxWeightLb) return "Heavy. 2 people needed";
    if (dimensionSumFt >= rules.onePersonMaxDimensionSumFt) return "Bulky. 2 people needed";
    return "OK";
  }

  function legacyInsuranceType(item) {
    if (item.insurance === "Basic Liability" || item.insurance === "Full Coverage") return item.insurance;
    if (item.protectionPlan === "FVP") return "Full Coverage";
    return "Basic Liability";
  }

  function calculateItem(item) {
    const settings = window.CalculatorVariables.settings;
    const packagingRates = window.CalculatorVariables.packagingRates;
    const protectionPlans = window.CalculatorVariables.protectionPlans;
    const volume = itemVolume(item);
    const effectiveVolume = itemEffectiveVolume(item, volume);
    const totalWeight = number(item.weight) * number(item.qty, 1);
    const legacyInsurance = legacyInsuranceType(item);
    const protection = protectionPlans[legacyInsurance] || protectionPlans["Basic Liability"];
    const packaging = (packagingRates[item.packaging] || 0) * number(item.qty, 1);
    const insurance = protection.rate > 0 ? number(item.declaredValue) * protection.rate + protection.fixedFee : 0;
    const storage = effectiveVolume * number(item.storageDays) * settings.storagePerCuFtPerDay;
    const warning = itemWarning(item, volume, totalWeight);
    const crewNeed = warning.includes("2 people") || warning.toLowerCase().includes("heavy") ? 2 : 1;

    return {
      ...item,
      insurance: legacyInsurance,
      protectionPlan: item.protectionPlan || (legacyInsurance === "Full Coverage" ? "FVP" : "RV"),
      protectionLegacyType: legacyInsurance,
      volume: money(volume),
      effectiveVolume: money(effectiveVolume),
      totalWeight: money(totalWeight),
      packagingCost: money(packaging),
      insuranceCost: money(insurance),
      storageCost: money(storage),
      warning,
      crewNeed,
    };
  }

  function accessCost(access) {
    const settings = window.CalculatorVariables.settings;
    const points = [access.pickup, access.delivery];
    return points.reduce((total, point) => {
      let cost = 0;
      if (point.coi) cost += settings.coiFee;
      if (point.stairs) cost += settings.stairsFeePerFloor * Math.max(number(point.floor), 1);
      if (point.narrowAccess || point.elevatorUnavailable) cost += settings.narrowAccessFee;
      cost += Math.ceil(number(point.longCarryFt) / 50) * settings.longCarryFeePer50Ft;
      return total + cost;
    }, 0);
  }

  function crewOverride(value) {
    const crew = number(value);
    return crew > 0 ? crew : null;
  }

  function specialLaborAdjustment(options = {}) {
    const extraLaborPeople = Math.max(0, number(options.extraLaborPeople));
    const extraLaborHours = Math.max(0, number(options.extraLaborHours));
    const extraLaborRate = Math.max(0, options.extraLaborRate === undefined || options.extraLaborRate === "" ? 50 : number(options.extraLaborRate));
    const extraLaborCost = extraLaborPeople > 0 && extraLaborHours > 0
      ? extraLaborPeople * extraLaborHours * extraLaborRate
      : 0;
    return {
      extraLaborPeople,
      extraLaborHours,
      extraLaborRate,
      extraLaborCost,
      legacyManualAdjustment: Math.max(0, number(options.manualAdjustment)),
    };
  }

  function pickupLoadingMinutes(volume) {
    const settings = window.CalculatorVariables.settings;
    if (volume < settings.loadingVolumeThresholdCuFt) {
      return (settings.loadingFormulaA * volume) / (settings.loadingFormulaB + volume);
    }
    return settings.loadingThresholdMinutes + 0.5 * (volume - settings.loadingVolumeThresholdCuFt);
  }

  function calculateExcelStageCosts({ measure, amount, pickupDistance, deliveryDistance, interstateDistance, pickupVehicle, deliveryVehicle, interstateVehicle, pickupTeam, deliveryTeam, interstateTeam, insurance }) {
    const settings = window.CalculatorVariables.settings;
    const isVolume = measure === "volume";
    const pickupLoadMinutes = isVolume ? pickupLoadingMinutes(amount) : amount * settings.packagingLoadingUnloadingPerLbMinute;
    const deliveryUnloadMinutes = isVolume ? amount * settings.unloadingPerCuFtMinute : amount * settings.packagingLoadingUnloadingPerLbMinute;
    const pickupWarehouse = amount * (isVolume ? settings.warehouseHandlingPerCuFtMinute : settings.warehouseHandlingPerLbMinute);
    const pickupTruck = amount * (isVolume ? settings.truckLoadingPerCuFtMinute : settings.truckLoadingPerLbMinute);
    const deliveryWarehouse = pickupWarehouse;
    const deliveryTruck = amount * (isVolume ? settings.truckLoadingPerCuFtMinute / 2 : settings.truckLoadingPerLbMinute / 2);
    const interstateMaintenance = amount * interstateDistance * (isVolume ? interstateVehicle.maintenancePerMilePerCuFt : interstateVehicle.maintenancePerMilePerLb);
    const interstateFuel = amount * interstateDistance * fuelCostPerUnitMile(interstateVehicle, isVolume);
    const interstateDriverDenominator = isVolume ? interstateVehicle.volume : interstateVehicle.payload;
    const interstateDriver = (settings.interstateDriverCostPerMile / interstateDriverDenominator) * interstateDistance * amount * interstateTeam;
    const damageSurcharge = amount * (isVolume ? settings.repairCostPerCuFt : settings.repairCostPerLb);

    const pickupCost =
      pickupDistance * pickupVehicle.maintenancePerMile +
      pickupDistance * fuelCostPerMile(pickupVehicle) +
      Math.max(pickupLoadMinutes, settings.minLoadingMinutes) * settings.wagePerMinute * pickupTeam +
      settings.pickupWagePerMile * pickupDistance * pickupTeam +
      settings.dispatchFee +
      settings.managementFee +
      pickupWarehouse +
      pickupTruck +
      settings.packagingPerShipment;

    const deliveryCost =
      deliveryDistance * deliveryVehicle.maintenancePerMile +
      deliveryDistance * fuelCostPerMile(deliveryVehicle) +
      Math.max(deliveryUnloadMinutes, settings.minLoadingMinutes - 10) * settings.wagePerMinute * deliveryTeam +
      settings.pickupWagePerMile * deliveryDistance * deliveryTeam +
      settings.dispatchFee +
      settings.managementFee +
      deliveryWarehouse +
      deliveryTruck;

    const interstateCost = interstateMaintenance + interstateFuel + interstateDriver;
    const serviceCost = pickupCost + deliveryCost + interstateCost + damageSurcharge + insurance;
    const stageMargin = (pickupCost + deliveryCost + interstateCost) * settings.marginRate;
    const priceExcludingBrokerFee = serviceCost + stageMargin;
    const pickupLabor =
      Math.max(pickupLoadMinutes, settings.minLoadingMinutes) * settings.wagePerMinute * pickupTeam +
      settings.pickupWagePerMile * pickupDistance * pickupTeam;
    const deliveryLabor =
      Math.max(deliveryUnloadMinutes, settings.minLoadingMinutes - 10) * settings.wagePerMinute * deliveryTeam +
      settings.pickupWagePerMile * deliveryDistance * deliveryTeam;

    return {
      pickupCost,
      deliveryCost,
      interstateCost,
      stageBreakdown: {
        pickup: {
          total: money(pickupCost),
          components: {
            labor: money(pickupLabor),
            mileage: money(pickupDistance * pickupVehicle.maintenancePerMile + pickupDistance * fuelCostPerMile(pickupVehicle)),
            handling: money(pickupWarehouse + pickupTruck + settings.packagingPerShipment),
            managementDispatch: money(settings.managementFee + settings.dispatchFee),
          },
        },
        interstate: {
          total: money(interstateCost),
          components: {
            fuel: money(interstateFuel),
            vehicleCost: money(interstateMaintenance),
            driver: money(interstateDriver),
            routeShare: 0,
          },
        },
        delivery: {
          total: money(deliveryCost),
          components: {
            labor: money(deliveryLabor),
            mileage: money(deliveryDistance * deliveryVehicle.maintenancePerMile + deliveryDistance * fuelCostPerMile(deliveryVehicle)),
            handling: money(deliveryWarehouse + deliveryTruck),
            managementDispatch: money(settings.managementFee + settings.dispatchFee),
          },
        },
      },
      damageSurcharge,
      serviceCost,
      stageMargin,
      priceExcludingBrokerFee,
    };
  }

  function calculateQuote(quote) {
    const settings = window.CalculatorVariables.settings;
    const pickupZone = getCanonicalZone(quote.route.pickupZip);
    const deliveryZone = getCanonicalZone(quote.route.deliveryZip);
    const distance = getDistance(pickupZone, deliveryZone);
    const calculatedItems = quote.items.filter((item) => item.name && hasBillableItemShape(item)).map(calculateItem);
    const hasBillableItems = calculatedItems.length > 0;

    const totalVolume = calculatedItems.reduce((sum, item) => sum + item.volume, 0);
    const effectiveVolume = calculatedItems.reduce((sum, item) => sum + item.effectiveVolume, 0);
    const totalWeight = calculatedItems.reduce((sum, item) => sum + item.totalWeight, 0);
    const packaging = calculatedItems.reduce((sum, item) => sum + item.packagingCost, 0) + (calculatedItems.length ? settings.packagingPerShipment : 0);
    const insurance = calculatedItems.reduce((sum, item) => sum + item.insuranceCost, 0);
    const storage = calculatedItems.reduce((sum, item) => sum + item.storageCost, 0);
    const vehicle = getVehicle(effectiveVolume, totalWeight);
    const interstateVehicle = getVehicleByName(settings.interstateVehicleName, vehicle);
    const itemRequiredCrew = hasBillableItems ? Math.max(1, ...calculatedItems.map((item) => item.crewNeed)) : 0;
    const pickupTeam = hasBillableItems ? crewOverride(quote.access?.pickup?.crew) || itemRequiredCrew : 0;
    const deliveryTeam = hasBillableItems ? crewOverride(quote.access?.delivery?.crew) || itemRequiredCrew : 0;
    const requiredCrew = hasBillableItems ? Math.max(pickupTeam, deliveryTeam, itemRequiredCrew) : 0;

    const pickupDistance = distance ? window.CalculatorVariables.distanceMatrix[pickupZone]?.[pickupZone] || 0 : 0;
    const deliveryDistance = distance ? window.CalculatorVariables.distanceMatrix[deliveryZone]?.[deliveryZone] || 0 : 0;
    const volumeCosts = hasBillableItems && distance
      ? calculateExcelStageCosts({
          measure: "volume",
          amount: effectiveVolume,
          pickupDistance,
          deliveryDistance,
          interstateDistance: distance,
          pickupVehicle: vehicle,
          deliveryVehicle: vehicle,
          interstateVehicle,
          pickupTeam,
          deliveryTeam,
          interstateTeam: 1,
          insurance,
        })
      : null;
    const weightCosts = hasBillableItems && distance
      ? calculateExcelStageCosts({
          measure: "weight",
          amount: totalWeight,
          pickupDistance,
          deliveryDistance,
          interstateDistance: distance,
          pickupVehicle: vehicle,
          deliveryVehicle: vehicle,
          interstateVehicle,
          pickupTeam,
          deliveryTeam,
          interstateTeam: 1,
          insurance,
        })
      : null;
    const selectedCosts = [volumeCosts, weightCosts].filter(Boolean).sort((a, b) => b.priceExcludingBrokerFee - a.priceExcludingBrokerFee)[0];
    const routeCost = selectedCosts ? selectedCosts.pickupCost + selectedCosts.deliveryCost + selectedCosts.interstateCost : 0;
    const laborCost = selectedCosts ? selectedCosts.pickupCost + selectedCosts.deliveryCost : 0;
    const accessFees = hasBillableItems ? accessCost(quote.access) : 0;
    const optionFees = hasBillableItems && quote.options.priorityDate ? settings.priorityDateFee : 0;
    const excelServiceCost = selectedCosts ? selectedCosts.serviceCost : 0;
    const brokeredPrice = selectedCosts ? selectedCosts.priceExcludingBrokerFee / (1 - settings.brokerFeeRate) : 0;
    const operationalCost = quote.options.exclusiveDelivery ? excelServiceCost * settings.exclusiveDeliveryMultiplier : excelServiceCost;
    const additionalCharges = storage + accessFees + optionFees;
    const specialLabor = specialLaborAdjustment(quote.options);
    const appliedExtraLaborCost = hasBillableItems ? specialLabor.extraLaborCost : 0;
    const appliedLegacyManualAdjustment = hasBillableItems ? specialLabor.legacyManualAdjustment : 0;
    const quoteAdjustment = appliedExtraLaborCost + appliedLegacyManualAdjustment;
    const rawPrice = hasBillableItems ? brokeredPrice + additionalCharges + quoteAdjustment : 0;
    const margin = Math.max(0, rawPrice - operationalCost - additionalCharges - quoteAdjustment);
    const finalPrice = hasBillableItems ? roundUp(rawPrice, settings.rounding) : 0;
    const roundingDelta = finalPrice - rawPrice;
    const effectiveCostPerCuFt = hasBillableItems && totalVolume > 0 ? finalPrice / totalVolume : 0;
    const itemReferenceAllocationMethod = totalWeight > 0 ? "weight" : effectiveVolume > 0 ? "effectiveVolume" : "none";
    const pricedItems = calculatedItems.map((item) => ({
      ...item,
      itemReferencePrice: money(itemReferenceAllocationMethod === "weight"
        ? finalPrice * (item.totalWeight / totalWeight)
        : itemReferenceAllocationMethod === "effectiveVolume"
          ? finalPrice * (item.effectiveVolume / effectiveVolume)
          : 0),
      itemReferenceAllocationMethod,
    }));

    return {
      pickupZone,
      deliveryZone,
      routeSupported: Boolean(distance),
      distance: distance || 0,
      items: pricedItems,
      vehicle,
      requiredCrew,
      crew: {
        pickup: pickupTeam,
        delivery: deliveryTeam,
        itemRequired: itemRequiredCrew,
      },
      totals: {
        totalVolume: money(totalVolume),
        effectiveVolume: money(effectiveVolume),
        totalWeight: money(totalWeight),
        operationalCost: money(operationalCost),
        routeCost: money(routeCost),
        laborCost: money(laborCost),
        additionalCharges: money(additionalCharges),
        packaging: money(packaging),
        insurance: money(insurance),
        storage: money(storage),
        accessFees: money(accessFees),
        optionFees: money(optionFees),
        margin: money(margin),
        manualAdjustment: money(appliedLegacyManualAdjustment),
        legacyManualAdjustment: money(appliedLegacyManualAdjustment),
        extraLaborPeople: specialLabor.extraLaborPeople,
        extraLaborHours: money(specialLabor.extraLaborHours),
        extraLaborRate: money(specialLabor.extraLaborRate),
        extraLaborCost: money(appliedExtraLaborCost),
        effectiveCostPerCuFt: money(effectiveCostPerCuFt),
        itemReferenceAllocationMethod,
        rawPrice: money(rawPrice),
        roundingDelta: money(roundingDelta),
        finalPrice: money(finalPrice),
      },
      warnings: calculatedItems.filter((item) => item.warning !== "OK").map((item) => `${item.name}: ${item.warning}`),
      stageBreakdown: selectedCosts?.stageBreakdown || null,
    };
  }

  window.PricingCalculator = {
    calculateQuote,
  };
})();
