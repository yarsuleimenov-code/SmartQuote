// Generated from normalized Formula Sprint registries. Do not edit manually.
(function () {
  window.OperationalMasterdata = {
  "variables": [
    {
      "id": "VAR-001",
      "name": "rounding",
      "section": "Pricing and Margin",
      "activeKey": "rounding",
      "exampleValue": "10",
      "unit": "USD",
      "readiness": "Ready"
    },
    {
      "id": "VAR-002",
      "name": "repairCostPerCuFt",
      "section": "Pricing and Margin",
      "activeKey": "repairCostPerCuFt",
      "exampleValue": "0.1832",
      "unit": "USD/cu ft",
      "readiness": "Ready"
    },
    {
      "id": "VAR-003",
      "name": "repairCostPerLb",
      "section": "Pricing and Margin",
      "activeKey": "repairCostPerLb",
      "exampleValue": "0.043",
      "unit": "USD/lb",
      "readiness": "Ready"
    },
    {
      "id": "VAR-TBE-002",
      "name": "marginRate",
      "section": "Pricing and Margin",
      "activeKey": "marginRate",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-003",
      "name": "brokerFeeRate",
      "section": "Pricing and Margin",
      "activeKey": "brokerFeeRate",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-006",
      "name": "storagePerCuFtPerDay",
      "section": "Protection, Storage and Packaging",
      "activeKey": "storagePerCuFtPerDay",
      "exampleValue": "0.03333333333",
      "unit": "USD/cu ft/day",
      "readiness": "Ready"
    },
    {
      "id": "VAR-007",
      "name": "packagingPerShipment",
      "section": "Protection, Storage and Packaging",
      "activeKey": "packagingPerShipment",
      "exampleValue": "6.32",
      "unit": "USD/order",
      "readiness": "Ready"
    },
    {
      "id": "VAR-008",
      "name": "loadingFormulaA",
      "section": "Labor and Time",
      "activeKey": "loadingFormulaA",
      "exampleValue": "205.57",
      "unit": "coefficient",
      "readiness": "Ready"
    },
    {
      "id": "VAR-009",
      "name": "loadingFormulaB",
      "section": "Labor and Time",
      "activeKey": "loadingFormulaB",
      "exampleValue": "144.87",
      "unit": "coefficient",
      "readiness": "Ready"
    },
    {
      "id": "VAR-010",
      "name": "loadingVolumeThresholdCuFt",
      "section": "Labor and Time",
      "activeKey": "loadingVolumeThresholdCuFt",
      "exampleValue": "80",
      "unit": "cu ft",
      "readiness": "Ready"
    },
    {
      "id": "VAR-011",
      "name": "loadingThresholdMinutes",
      "section": "Labor and Time",
      "activeKey": "loadingThresholdMinutes",
      "exampleValue": "73.13",
      "unit": "minutes",
      "readiness": "Ready"
    },
    {
      "id": "VAR-012",
      "name": "unloadingPerCuFtMinute",
      "section": "Labor and Time",
      "activeKey": "unloadingPerCuFtMinute",
      "exampleValue": "0.5",
      "unit": "min/cu ft",
      "readiness": "Ready"
    },
    {
      "id": "VAR-013",
      "name": "packagingLoadingUnloadingPerLbMinute",
      "section": "Protection, Storage and Packaging",
      "activeKey": "packagingLoadingUnloadingPerLbMinute",
      "exampleValue": "0.2",
      "unit": "min/lb",
      "readiness": "Ready"
    },
    {
      "id": "VAR-014",
      "name": "minLoadingMinutes",
      "section": "Labor and Time",
      "activeKey": "minLoadingMinutes",
      "exampleValue": "40",
      "unit": "minutes",
      "readiness": "Ready"
    },
    {
      "id": "VAR-015",
      "name": "wagePerMinute",
      "section": "Labor and Time",
      "activeKey": "wagePerMinute",
      "exampleValue": "0.4777088333",
      "unit": "USD/min/person",
      "readiness": "Ready"
    },
    {
      "id": "VAR-016",
      "name": "pickupWagePerMile",
      "section": "Labor and Time",
      "activeKey": "pickupWagePerMile",
      "exampleValue": "0.6369451111",
      "unit": "USD/mile/person",
      "readiness": "Ready"
    },
    {
      "id": "VAR-017",
      "name": "interstateDriverCostPerMile",
      "section": "Pricing and Margin",
      "activeKey": "interstateDriverCostPerMile",
      "exampleValue": "0.56825",
      "unit": "USD/mile",
      "readiness": "Ready"
    },
    {
      "id": "VAR-TBE-014",
      "name": "managementFee",
      "section": "Pricing and Margin",
      "activeKey": "managementFee",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-019",
      "name": "dispatchFee",
      "section": "Pricing and Margin",
      "activeKey": "dispatchFee",
      "exampleValue": "3.5",
      "unit": "USD/stage",
      "readiness": "Ready"
    },
    {
      "id": "VAR-020",
      "name": "coiFee",
      "section": "Access and Service",
      "activeKey": "coiFee",
      "exampleValue": "25",
      "unit": "USD/point",
      "readiness": "Ready"
    },
    {
      "id": "VAR-021",
      "name": "stairsFeePerFloor",
      "section": "Access and Service",
      "activeKey": "stairsFeePerFloor",
      "exampleValue": "18",
      "unit": "USD/floor",
      "readiness": "Ready"
    },
    {
      "id": "VAR-022",
      "name": "narrowAccessFee",
      "section": "Access and Service",
      "activeKey": "narrowAccessFee",
      "exampleValue": "20",
      "unit": "USD/point",
      "readiness": "Ready"
    },
    {
      "id": "VAR-023",
      "name": "longCarryFeePer50Ft",
      "section": "Access and Service",
      "activeKey": "longCarryFeePer50Ft",
      "exampleValue": "12",
      "unit": "USD/50 ft",
      "readiness": "Ready"
    },
    {
      "id": "VAR-024",
      "name": "priorityDateFee",
      "section": "Pricing and Margin",
      "activeKey": "priorityDateFee",
      "exampleValue": "75",
      "unit": "USD/order",
      "readiness": "Ready"
    },
    {
      "id": "VAR-025",
      "name": "exclusiveDeliveryMultiplier",
      "section": "Labor and Time",
      "activeKey": "exclusiveDeliveryMultiplier",
      "exampleValue": "1.35",
      "unit": "multiplier",
      "readiness": "Ready"
    },
    {
      "id": "VAR-026",
      "name": "extraLaborRate",
      "section": "Labor and Time",
      "activeKey": "extraLaborRate",
      "exampleValue": "50",
      "unit": "USD/hour/person",
      "readiness": "Ready"
    },
    {
      "id": "VAR-027",
      "name": "interstateVehicleName",
      "section": "Capacity and Vehicle Economics",
      "activeKey": "interstateVehicleName",
      "exampleValue": "Penske 26 ft",
      "unit": "vehicle name",
      "readiness": "Ready"
    },
    {
      "id": "VAR-028",
      "name": "fuel currentAvg / fuelSurchargePct",
      "section": "Pricing and Margin",
      "activeKey": "fuelPrices",
      "exampleValue": "Regular 4.555 / Diesel 5.652; surcharge 10%",
      "unit": "USD/gal, %",
      "readiness": "Ready"
    },
    {
      "id": "VAR-029",
      "name": "protectionPlans.Full Coverage",
      "section": "Protection, Storage and Packaging",
      "activeKey": "protectionPlans.Full Coverage",
      "exampleValue": "rate 0.025; fixedFee 15",
      "unit": "rate, USD",
      "readiness": "Ready"
    },
    {
      "id": "VAR-030",
      "name": "packagingRates",
      "section": "Protection, Storage and Packaging",
      "activeKey": "packagingRates",
      "exampleValue": "None 0; Blanket Wrap 8; Bubble 18; TV Box 35; Custom Crate 95",
      "unit": "USD/item",
      "readiness": "Ready"
    },
    {
      "id": "VAR-TBE-001",
      "name": "roundingIncrement",
      "section": "Pricing and Margin",
      "activeKey": "rounding",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-004",
      "name": "directFixedFee",
      "section": "Access and Service",
      "activeKey": "directFixedFee",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-005",
      "name": "directMileageFee",
      "section": "Access and Service",
      "activeKey": "directMileageFee",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-006",
      "name": "remoteZoneCoefficient",
      "section": "Pricing and Margin",
      "activeKey": "remoteZoneCoefficient",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-007",
      "name": "bulkyVolumeThreshold",
      "section": "Pricing and Margin",
      "activeKey": "bulkyVolumeThreshold",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-008",
      "name": "pickupTimeCoefficients",
      "section": "Labor and Time",
      "activeKey": "pickupTimeCoefficients",
      "exampleValue": "",
      "unit": "Variable set",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-009",
      "name": "deliveryTimeCoefficients",
      "section": "Labor and Time",
      "activeKey": "deliveryTimeCoefficients",
      "exampleValue": "",
      "unit": "Variable set",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-010",
      "name": "crateMaterialPrice",
      "section": "Protection, Storage and Packaging",
      "activeKey": "crateMaterialPrice",
      "exampleValue": "",
      "unit": "Reference",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-011",
      "name": "crateWasteCoefficient",
      "section": "Protection, Storage and Packaging",
      "activeKey": "crateWasteCoefficient",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-012",
      "name": "storageRate",
      "section": "Protection, Storage and Packaging",
      "activeKey": "storagePerCuFtPerDay",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-013",
      "name": "fvpRate / fvpFixedFee",
      "section": "Pricing and Margin",
      "activeKey": "protectionPlans.Full Coverage",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-015",
      "name": "hourlyWageByRole",
      "section": "Labor and Time",
      "activeKey": "hourlyWageByRole",
      "exampleValue": "",
      "unit": "Reference",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-016",
      "name": "overtimeMultiplier",
      "section": "Labor and Time",
      "activeKey": "overtimeMultiplier",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-017",
      "name": "payrollBurdenRate",
      "section": "Labor and Time",
      "activeKey": "payrollBurdenRate",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-018",
      "name": "brokerCommissionRate",
      "section": "Pricing and Margin",
      "activeKey": "brokerCommissionRate",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-019",
      "name": "dispatcherPayoutRate",
      "section": "Pricing and Margin",
      "activeKey": "dispatcherPayoutRate",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-020",
      "name": "minContributionMarginPct",
      "section": "Pricing and Margin",
      "activeKey": "minContributionMarginPct",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-021",
      "name": "overheadAllocationRate",
      "section": "Access and Service",
      "activeKey": "overheadAllocationRate",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-022",
      "name": "routeCapacityRate",
      "section": "Capacity and Vehicle Economics",
      "activeKey": "routeCapacityRate",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-023",
      "name": "bulkyPremiumMultiplier",
      "section": "Pricing and Margin",
      "activeKey": "bulkyPremiumMultiplier",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-024",
      "name": "locationTypeTimeMultiplier",
      "section": "Access and Service",
      "activeKey": "locationTypeTimeMultiplier",
      "exampleValue": "",
      "unit": "Variable / Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-025",
      "name": "locationTypeFixedMinutes",
      "section": "Access and Service",
      "activeKey": "locationTypeFixedMinutes",
      "exampleValue": "",
      "unit": "Variable / Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-026",
      "name": "locationTypeCrewImpact",
      "section": "Access and Service",
      "activeKey": "locationTypeCrewImpact",
      "exampleValue": "",
      "unit": "Variable / Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-027",
      "name": "parkingLoadingComplexityMinutes",
      "section": "Access and Service",
      "activeKey": "parkingLoadingComplexityMinutes",
      "exampleValue": "",
      "unit": "Variable / Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-028",
      "name": "warehouseEfficiencyFactor",
      "section": "Pricing and Margin",
      "activeKey": "warehouseEfficiencyFactor",
      "exampleValue": "",
      "unit": "Variable / Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TBE-029",
      "name": "auctionHandlingMinutes",
      "section": "Item Handling",
      "activeKey": "auctionHandlingMinutes",
      "exampleValue": "",
      "unit": "Variable / Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TIME-001",
      "name": "timeDataConfidenceScore",
      "section": "Labor and Time",
      "activeKey": "timeDataConfidenceScore",
      "exampleValue": "",
      "unit": "Variable / Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TIME-002",
      "name": "minimumTimeSampleSize",
      "section": "Labor and Time",
      "activeKey": "minimumTimeSampleSize",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TIME-003",
      "name": "timeEstimateBufferPct",
      "section": "Labor and Time",
      "activeKey": "timeEstimateBufferPct",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-HND-001",
      "name": "onePersonMaxItemWeightLb",
      "section": "Item Handling",
      "activeKey": "onePersonMaxItemWeightLb",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-HND-002",
      "name": "twoPersonItemWeightThresholdLb",
      "section": "Item Handling",
      "activeKey": "twoPersonItemWeightThresholdLb",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-HND-003",
      "name": "awkwardItemLengthThresholdIn",
      "section": "Item Handling",
      "activeKey": "awkwardItemLengthThresholdIn",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-HND-004",
      "name": "itemMinimumHandlingMinutes",
      "section": "Item Handling",
      "activeKey": "itemMinimumHandlingMinutes",
      "exampleValue": "",
      "unit": "Variable / Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-HND-005",
      "name": "largeLightItemVolumeThresholdCuFt",
      "section": "Item Handling",
      "activeKey": "largeLightItemVolumeThresholdCuFt",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-HND-006",
      "name": "itemHandlingScoreThreshold",
      "section": "Item Handling",
      "activeKey": "itemHandlingScoreThreshold",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-HND-007",
      "name": "heavyPieceWeightThresholdLb",
      "section": "Item Handling",
      "activeKey": "heavyPieceWeightThresholdLb",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-HND-008",
      "name": "onePersonPieceLimit",
      "section": "Item Handling",
      "activeKey": "onePersonPieceLimit",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-HND-009",
      "name": "minutesPerPieceByHandlingClass",
      "section": "Item Handling",
      "activeKey": "minutesPerPieceByHandlingClass",
      "exampleValue": "",
      "unit": "Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-HND-010",
      "name": "helperActiveMinutesPerHeavyPiece",
      "section": "Item Handling",
      "activeKey": "helperActiveMinutesPerHeavyPiece",
      "exampleValue": "",
      "unit": "Variable / Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-HND-011",
      "name": "partialHelperBillingPolicy",
      "section": "Item Handling",
      "activeKey": "partialHelperBillingPolicy",
      "exampleValue": "",
      "unit": "Governance variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-HND-012",
      "name": "hardAccessConstraintRule",
      "section": "Access and Service",
      "activeKey": "hardAccessConstraintRule",
      "exampleValue": "",
      "unit": "Rule set",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-HND-013",
      "name": "accessHeavyImpactMinutes",
      "section": "Access and Service",
      "activeKey": "accessHeavyImpactMinutes",
      "exampleValue": "",
      "unit": "Variable / Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-HND-014",
      "name": "physicalFeasibilityReviewThreshold",
      "section": "Pricing and Margin",
      "activeKey": "physicalFeasibilityReviewThreshold",
      "exampleValue": "",
      "unit": "Rule set",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-VEH-001",
      "name": "selectedVehicleCargoHeightIn",
      "section": "Capacity and Vehicle Economics",
      "activeKey": "selectedVehicleCargoHeightIn",
      "exampleValue": "",
      "unit": "Derived reference value",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-VEH-002",
      "name": "sideTransportAllowed",
      "section": "Pricing and Margin",
      "activeKey": "sideTransportAllowed",
      "exampleValue": "",
      "unit": "Item/reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-VEH-003",
      "name": "sideTransportApprovalRequired",
      "section": "Warnings and Approval",
      "activeKey": "sideTransportApprovalRequired",
      "exampleValue": "",
      "unit": "Governance variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-VEH-004",
      "name": "cargoInteriorLengthIn",
      "section": "Capacity and Vehicle Economics",
      "activeKey": "cargoInteriorLengthIn",
      "exampleValue": "",
      "unit": "Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-VEH-005",
      "name": "cargoInteriorWidthIn",
      "section": "Capacity and Vehicle Economics",
      "activeKey": "cargoInteriorWidthIn",
      "exampleValue": "",
      "unit": "Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-VEH-006",
      "name": "cargoInteriorHeightIn",
      "section": "Capacity and Vehicle Economics",
      "activeKey": "cargoInteriorHeightIn",
      "exampleValue": "",
      "unit": "Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-VEH-007",
      "name": "doorOpeningWidthIn",
      "section": "Pricing and Margin",
      "activeKey": "doorOpeningWidthIn",
      "exampleValue": "",
      "unit": "Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-VEH-008",
      "name": "doorOpeningHeightIn",
      "section": "Pricing and Margin",
      "activeKey": "doorOpeningHeightIn",
      "exampleValue": "",
      "unit": "Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-VEH-009",
      "name": "vehicleEquipmentFlags",
      "section": "Capacity and Vehicle Economics",
      "activeKey": "vehicleEquipmentFlags",
      "exampleValue": "",
      "unit": "Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-CAP-001",
      "name": "selectedVehicleCargoVolumeCuFt",
      "section": "Capacity and Vehicle Economics",
      "activeKey": "selectedVehicleCargoVolumeCuFt",
      "exampleValue": "",
      "unit": "Derived reference value",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-CAP-002",
      "name": "selectedVehiclePayloadLb",
      "section": "Capacity and Vehicle Economics",
      "activeKey": "selectedVehiclePayloadLb",
      "exampleValue": "",
      "unit": "Derived reference value",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-CAP-003",
      "name": "fullRouteCapacityCost",
      "section": "Capacity and Vehicle Economics",
      "activeKey": "fullRouteCapacityCost",
      "exampleValue": "",
      "unit": "Variable / Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-CAP-004",
      "name": "interstateCostPerCuFt",
      "section": "Capacity and Vehicle Economics",
      "activeKey": "interstateCostPerCuFt",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-CAP-005",
      "name": "interstateCostPerLb",
      "section": "Capacity and Vehicle Economics",
      "activeKey": "interstateCostPerLb",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-CAP-006",
      "name": "capacityPricingMethod",
      "section": "Capacity and Vehicle Economics",
      "activeKey": "capacityPricingMethod",
      "exampleValue": "",
      "unit": "Governance variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TIME-006",
      "name": "loadingCurveVolumeThresholdCuFt",
      "section": "Labor and Time",
      "activeKey": "loadingCurveVolumeThresholdCuFt",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TIME-007",
      "name": "loadingCurveNumerator",
      "section": "Labor and Time",
      "activeKey": "loadingCurveNumerator",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TIME-008",
      "name": "loadingCurveDenominatorOffset",
      "section": "Labor and Time",
      "activeKey": "loadingCurveDenominatorOffset",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TIME-009",
      "name": "loadingCurveBaseMinutes",
      "section": "Labor and Time",
      "activeKey": "loadingCurveBaseMinutes",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TIME-010",
      "name": "loadingPostThresholdMinutesPerCuFt",
      "section": "Labor and Time",
      "activeKey": "loadingPostThresholdMinutesPerCuFt",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-TIME-011",
      "name": "unloadingTimeCoefficient",
      "section": "Labor and Time",
      "activeKey": "unloadingTimeCoefficient",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-ACC-001",
      "name": "freeFloorCount",
      "section": "Access and Service",
      "activeKey": "freeFloorCount",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-ACC-002",
      "name": "stairsFeePerBillableFloor",
      "section": "Access and Service",
      "activeKey": "stairsFeePerBillableFloor",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-ACC-003",
      "name": "extraLaborMinimumHours",
      "section": "Labor and Time",
      "activeKey": "extraLaborMinimumHours",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-ACC-004",
      "name": "extraLaborHourlyRate",
      "section": "Labor and Time",
      "activeKey": "extraLaborHourlyRate",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-WARN-001",
      "name": "blockingWarningFlag",
      "section": "Warnings and Approval",
      "activeKey": "blockingWarningFlag",
      "exampleValue": "",
      "unit": "Rule set",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-MRG-001",
      "name": "minimumContributionMarginRate",
      "section": "Pricing and Margin",
      "activeKey": "minimumContributionMarginRate",
      "exampleValue": "",
      "unit": "Governance variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-MRG-002",
      "name": "discountApplicationOrder",
      "section": "Pricing and Margin",
      "activeKey": "discountApplicationOrder",
      "exampleValue": "",
      "unit": "Governance variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-MRG-004",
      "name": "dispatcherPayoutRule",
      "section": "Pricing and Margin",
      "activeKey": "dispatcherPayoutRule",
      "exampleValue": "",
      "unit": "Rule set",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-RTE-001",
      "name": "zoneMultiplier",
      "section": "Pricing and Margin",
      "activeKey": "zoneMultiplier",
      "exampleValue": "",
      "unit": "Variable / Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-LAB-001",
      "name": "minutesPerCuFt",
      "section": "Labor and Time",
      "activeKey": "minutesPerCuFt",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-LAB-002",
      "name": "minutesPerLb",
      "section": "Labor and Time",
      "activeKey": "minutesPerLb",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-LAB-003",
      "name": "pickupTimeMultiplier",
      "section": "Labor and Time",
      "activeKey": "pickupTimeMultiplier",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-LAB-004",
      "name": "deliveryTimeMultiplier",
      "section": "Labor and Time",
      "activeKey": "deliveryTimeMultiplier",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-LAB-005",
      "name": "minimumHandlingMinutes",
      "section": "Item Handling",
      "activeKey": "minimumHandlingMinutes",
      "exampleValue": "",
      "unit": "Variable",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-FIT-001",
      "name": "maxItemLength",
      "section": "Item Handling",
      "activeKey": "maxItemLength",
      "exampleValue": "",
      "unit": "Derived value",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-FIT-002",
      "name": "maxItemWidth",
      "section": "Item Handling",
      "activeKey": "maxItemWidth",
      "exampleValue": "",
      "unit": "Derived value",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-FIT-003",
      "name": "maxItemHeight",
      "section": "Item Handling",
      "activeKey": "maxItemHeight",
      "exampleValue": "",
      "unit": "Derived value",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-FIT-004",
      "name": "vehicleInteriorLength",
      "section": "Capacity and Vehicle Economics",
      "activeKey": "vehicleInteriorLength",
      "exampleValue": "",
      "unit": "Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-FIT-005",
      "name": "vehicleInteriorWidth",
      "section": "Capacity and Vehicle Economics",
      "activeKey": "vehicleInteriorWidth",
      "exampleValue": "",
      "unit": "Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-FIT-006",
      "name": "vehicleInteriorHeight",
      "section": "Capacity and Vehicle Economics",
      "activeKey": "vehicleInteriorHeight",
      "exampleValue": "",
      "unit": "Reference field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-WARN-002",
      "name": "warningSeverity",
      "section": "Warnings and Approval",
      "activeKey": "warningSeverity",
      "exampleValue": "",
      "unit": "Rule set field",
      "readiness": "Test Assumption"
    },
    {
      "id": "VAR-WARN-003",
      "name": "managerApprovalRequired",
      "section": "Warnings and Approval",
      "activeKey": "managerApprovalRequired",
      "exampleValue": "",
      "unit": "Derived value",
      "readiness": "Test Assumption"
    }
  ],
  "references": [
    {
      "id": "REF-001",
      "name": "Quote Draft item row",
      "section": "Items and Handling",
      "fields": "Item name, dimensions, weight, qty, packaging, protection, declared value, storage, flags",
      "readiness": "Ready"
    },
    {
      "id": "REF-002",
      "name": "Quick Quote catalog transfer",
      "section": "Items and Handling",
      "fields": "Catalog dimensions, weight, packaging defaults transferred to Full Quote",
      "readiness": "Ready"
    },
    {
      "id": "REF-003",
      "name": "Item Catalog",
      "section": "Items and Handling",
      "fields": "Default item templates",
      "readiness": "Ready"
    },
    {
      "id": "REF-TBE-001",
      "name": "ZIP Dictionary",
      "section": "Route and Coverage",
      "fields": "ZIP, serviceAreaId, branchId, zoneClass, activeFlag",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-005",
      "name": "Zone normalization",
      "section": "Route and Coverage",
      "fields": "Raw zone -> canonical zone",
      "readiness": "Ready"
    },
    {
      "id": "REF-006",
      "name": "Distance Matrix",
      "section": "Route and Coverage",
      "fields": "Canonical zone pair distances and same-zone local distances",
      "readiness": "Ready"
    },
    {
      "id": "REF-007",
      "name": "Vehicles Reference",
      "section": "Vehicles",
      "fields": "Capacity, payload, fuel type, MPG, calculation MPG, maintenance",
      "readiness": "Ready"
    },
    {
      "id": "REF-008",
      "name": "Fuel Prices Reference",
      "section": "Quality and Control",
      "fields": "Fuel type, currentAvg, fuelSurchargePct",
      "readiness": "Ready"
    },
    {
      "id": "REF-009",
      "name": "Packaging Rates",
      "section": "Services",
      "fields": "Packaging type -> rate",
      "readiness": "Ready"
    },
    {
      "id": "REF-TBE-008",
      "name": "Protection Plans",
      "section": "Services",
      "fields": "planCode, rate, fixedFee, included, requiresConfirmation",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-011",
      "name": "Access Conditions",
      "section": "Quality and Control",
      "fields": "COI, stairs, floor, narrow, elevator unavailable, long carry, crew",
      "readiness": "Ready"
    },
    {
      "id": "REF-012",
      "name": "Quote Options",
      "section": "Quality and Control",
      "fields": "Priority, exclusive delivery, special labor, manual adjustment, direct flags",
      "readiness": "Ready"
    },
    {
      "id": "REF-013",
      "name": "Estimate Snapshot",
      "section": "Quality and Control",
      "fields": "formulaVersion, variablesSnapshot, quote, result",
      "readiness": "Ready"
    },
    {
      "id": "REF-TBE-002",
      "name": "Service Areas",
      "section": "Route and Coverage",
      "fields": "serviceAreaId, warehousePoint, densityClass, corridorFlag",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TBE-003",
      "name": "Distance Matrix / Route Engine",
      "section": "Route and Coverage",
      "fields": "origin, destination, miles, method, version",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TBE-004",
      "name": "Vehicles",
      "section": "Vehicles",
      "fields": "vehicleType, vehicleName, capacityVolume, capacityWeight, MPG, costPerMile, cargoBodySpecId, activeFlag",
      "readiness": "Ready"
    },
    {
      "id": "REF-TBE-005",
      "name": "Labor",
      "section": "People and Operations",
      "fields": "role, stage, wage, minTime, coefficient",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TBE-006",
      "name": "Items Catalog",
      "section": "Items and Handling",
      "fields": "itemType, dimensions, weight, fragile, nonStackDefault",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TBE-007",
      "name": "Packaging / Crate Materials",
      "section": "Services",
      "fields": "materialType, unitCost, wasteCoeff, vendor",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TBE-009",
      "name": "Storage Rates",
      "section": "Services",
      "fields": "rate, unit, effectiveDate",
      "readiness": "Ready"
    },
    {
      "id": "REF-TBE-010",
      "name": "Benchmark Cases",
      "section": "Quality and Control",
      "fields": "caseId, inputs, expectedSubtotal, expectedTotal",
      "readiness": "Ready"
    },
    {
      "id": "REF-TBE-011",
      "name": "Payroll Roles / Wage Rates",
      "section": "People and Operations",
      "fields": "role, branch, hourlyWage, overtimePolicy, effectiveDate",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TBE-012",
      "name": "Broker Compensation Plans",
      "section": "People and Operations",
      "fields": "brokerId, channel, commissionRate, cap, floor, eligibilityEvent",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TBE-013",
      "name": "Dispatcher Compensation Plans",
      "section": "People and Operations",
      "fields": "dispatcherId, payoutType, rate, bonusRule, penaltyRule",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TBE-014",
      "name": "Overhead Allocation Rules",
      "section": "People and Operations",
      "fields": "overheadType, allocationMethod, rate, effectiveDate",
      "readiness": "Ready"
    },
    {
      "id": "REF-TBE-015",
      "name": "Capacity Economics",
      "section": "Quality and Control",
      "fields": "routeType, capacityUnitRate, utilizationThreshold, premiumMultiplier",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TBE-016",
      "name": "Location / Address Types",
      "section": "Quality and Control",
      "fields": "addressType, stage, baseTimeMultiplier, fixedLocationMinutes, accessComplexityMultiplier, crewImpact, loadingDockDefault, parkingComplexity, coiDefault, activeFlag",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TIME-001",
      "name": "Historical Time Metrics",
      "section": "Quality and Control",
      "fields": "orderId, stage, addressType, volume, weight, itemCount, crew, actualMinutes, dataQuality",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TIME-002",
      "name": "Access Time Reference",
      "section": "Quality and Control",
      "fields": "accessType, stage, fixedMinutes, multiplier, confidence",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TIME-003",
      "name": "Packaging Time Reference",
      "section": "Services",
      "fields": "packagingType, minutesPerItem, minimumMinutes, complexityClass",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TIME-004",
      "name": "Crate Labor Reference",
      "section": "Services",
      "fields": "crateType, surfaceAreaBand, minutesPerSqFt, minimumMinutes",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TIME-005",
      "name": "Time Data Quality Rules",
      "section": "Quality and Control",
      "fields": "dataQualityStatus, minimumSampleSize, confidenceScore, exclusionReason",
      "readiness": "Ready"
    },
    {
      "id": "REF-TBE-017",
      "name": "Item Handling / Crew Feasibility Rules",
      "section": "Items and Handling",
      "fields": "itemType, unitItemWeightBand, totalPieceBand, heavyPieceThreshold, itemLengthBand, awkwardnessClass, onePersonEligibleFlag, minCrew, minutesPerPiece, helperActiveMinutes, exceptionRule, activeFlag",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TBE-018",
      "name": "Physical Access Feasibility Rules",
      "section": "Items and Handling",
      "fields": "accessType, itemDimensionLimit, doorwayWidth, elevatorDepth, stairTurnLimit, crateFlag, reviewRule, extraMinutes, activeFlag",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TBE-019",
      "name": "Vehicle Dimensions / Cargo Body Specs",
      "section": "Vehicles",
      "fields": "cargoBodySpecId, vehicleType, cargoInteriorLengthIn, cargoInteriorWidthIn, cargoInteriorHeightIn, doorOpeningWidthIn, doorOpeningHeightIn, payloadLb, capacityCuFt, rampFlag, liftGateFlag, tieDownFlag, activeFlag",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TBE-020",
      "name": "Warning / Approval Rules",
      "section": "Quality and Control",
      "fields": "ruleId, triggerFormula, severity, messageRu, blocksQuote, approvalRole, activeFlag",
      "readiness": "Ready"
    },
    {
      "id": "REF-TBE-021",
      "name": "Formula Constants Audit",
      "section": "Quality and Control",
      "fields": "constantValue, variableId, formulaId, meaning, owner, status",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TBE-022",
      "name": "Route Capacity Cost Reference",
      "section": "Quality and Control",
      "fields": "routeId, vehicleType, fullRouteCapacityCost, costPerCuFt, costPerLb, effectiveDate",
      "readiness": "Test Assumption"
    },
    {
      "id": "REF-TBE-023",
      "name": "Formula Version Registry",
      "section": "Quality and Control",
      "fields": "formulaVersion, activeFrom, activeTo, approvedBy, changeReason",
      "readiness": "Ready"
    },
    {
      "id": "REF-TBE-024",
      "name": "Manual ZIP Override Register",
      "section": "Route and Coverage",
      "fields": "zip, overrideZone, reason, approvedBy, activeFrom, activeTo",
      "readiness": "Test Assumption"
    }
  ]
};
})();
