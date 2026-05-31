(function () {
  const vehicleTypes = [
    {
      name: "Sprinter 488 cu ft",
      volume: 488.1,
      payload: 3704,
      fuelPerMile: 0.3345833333,
      maintenancePerMile: 0.26725568,
      fuelPerMilePerCuFt: 0.0006854811173,
      fuelPerMilePerLb: 0.00009033027358,
      maintenancePerMilePerCuFt: 0.0005475428806,
      maintenancePerMilePerLb: 0.00007215326134,
    },
    {
      name: "Box truck 16 ft",
      volume: 800,
      payload: 4300,
      fuelPerMile: 0.3406857143,
      maintenancePerMile: 1.106,
      fuelPerMilePerCuFt: 0.0004258571429,
      fuelPerMilePerLb: 0.00007922923588,
      maintenancePerMilePerCuFt: 0.0013825,
      maintenancePerMilePerLb: 0.0002572093023,
    },
    {
      name: "Box truck 20 ft",
      volume: 1200,
      payload: 10000,
      fuelPerMile: 0.4632692308,
      maintenancePerMile: 1.284571429,
      fuelPerMilePerCuFt: 0.0003860576923,
      fuelPerMilePerLb: 0.00004632692308,
      maintenancePerMilePerCuFt: 0.00107047619,
      maintenancePerMilePerLb: 0.0001284571429,
    },
    {
      name: "Penske 26 ft",
      volume: 1650,
      payload: 8800,
      fuelPerMile: 0.6359556494,
      maintenancePerMile: 0.5386438596,
      fuelPerMilePerCuFt: 0.0003854276663,
      fuelPerMilePerLb: 0.00007226768743,
      maintenancePerMilePerCuFt: 0.000326450824,
      maintenancePerMilePerLb: 0.00006120952951,
    },
  ];

  window.CalculatorVariables = {
    formulaVersion: "excel-derived-v0.1",
    settings: {
      insuranceRate: 0.025,
      insuranceFixedFee: 15,
      repairCostPerCuFt: 0.1832,
      repairCostPerLb: 0.043,
      marginRate: 0.3,
      brokerFeeRate: 0.04,
      storagePerCuFtPerDay: 0.03333333333,
      packagingPerShipment: 6.32,
      unloadingPerCuFtMinute: 0.5,
      packagingLoadingUnloadingPerLbMinute: 0.2,
      minLoadingMinutes: 40,
      loadingFormulaA: 205.57,
      loadingFormulaB: 144.87,
      loadingVolumeThresholdCuFt: 80,
      loadingThresholdMinutes: 73.13,
      warehouseHandlingPerCuFtMinute: 0.28,
      warehouseHandlingPerLbMinute: 0.1,
      truckLoadingPerCuFtMinute: 0.6,
      truckLoadingPerLbMinute: 0.1125,
      wagePerMinute: 0.4777088333,
      pickupWagePerMile: 0.6369451111,
      interstateDriverCostPerMile: 0.56825,
      managementFee: 15,
      dispatchFee: 3.5,
      coiFee: 25,
      stairsFeePerFloor: 18,
      narrowAccessFee: 20,
      longCarryFeePer50Ft: 12,
      exclusiveDeliveryMultiplier: 1.35,
      priorityDateFee: 75,
      rounding: 10,
      interstateVehicleName: "Penske 26 ft",
    },
    warningRules: {
      acceptableWeightLb: 40,
      onePersonMaxWeightLb: 100,
      unacceptableWeightLb: 200,
      onePersonMaxDimensionSumFt: 11,
    },
    packagingRates: {
      None: 0,
      "Blanket Wrap": 8,
      "Bubble Protection": 18,
      "TV / Monitor Box": 35,
      "Custom Crate": 95,
    },
    protectionPlans: {
      "Basic Liability": { rate: 0, fixedFee: 0 },
      "Full Coverage": { rate: 0.025, fixedFee: 15 },
    },
    vehicleTypes,
    distanceMatrix: {
      "CA North": { "CA North": 31.09, "CA South": 400, "DC Area": 2800, "NY Area": 2800, Boston: 2800, TX: 1450 },
      "CA South": { "CA North": 400, "CA South": 31.09, "DC Area": 2800, "NY Area": 2800, Boston: 2800, TX: 1450 },
      "DC Area": { "CA North": 2800, "CA South": 2800, "DC Area": 34.83, "NY Area": 250, Boston: 450, TX: 1550 },
      "NY Area": { "CA North": 2800, "CA South": 2800, "DC Area": 250, "NY Area": 34.83, Boston: 250, TX: 1550 },
      Boston: { "CA North": 2800, "CA South": 2800, "DC Area": 450, "NY Area": 250, Boston: 34.83, TX: 1550 },
      TX: { "CA North": 1450, "CA South": 1450, "DC Area": 1550, "NY Area": 1550, Boston: 1550, TX: 40 },
    },
    normalizeZoneName(zoneName) {
      const value = String(zoneName || "").trim();
      if (value === "CA (SF)" || value === "CA (A)" || value === "CA (C)") return "CA North";
      if (value === "CA (LA)" || value === "CA (D)") return "CA South";
      if (value === "NY (DC)") return "DC Area";
      if (value === "NYC" || value === "NY (NORTH)" || value === "NY (SOUTH)" || value === "NY (LI)") return "NY Area";
      if (value === "Boston") return "Boston";
      if (value === "TX") return "TX";
      return value || "Unsupported";
    },
  };
})();
