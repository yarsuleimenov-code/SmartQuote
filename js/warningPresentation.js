(function () {
  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function warning(record) {
    return {
      approvalRole: "",
      blocksEstimate: false,
      ...record,
    };
  }

  function build({ quote, result, useStoredCoverage = false }) {
    const warnings = [];
    const pickupZip = String(quote?.route?.pickupZip || "").trim();
    const deliveryZip = String(quote?.route?.deliveryZip || "").trim();
    const hasBothZips = Boolean(pickupZip && deliveryZip);

    if (!hasBothZips) {
      warnings.push(warning({
        id: "WARN-UI-ROUTE-MISSING",
        severity: "warning",
        scope: "route",
        target: !pickupZip ? "pickupZip" : "deliveryZip",
        title: "Route is incomplete",
        message: "Enter both pickup and delivery ZIP codes.",
        actionLabel: "Complete route",
      }));
    } else if (!result?.routeSupported) {
      warnings.push(warning({
        id: "WARN-UI-ROUTE-UNSUPPORTED",
        severity: "blocking",
        scope: "route",
        target: "pickupZip",
        title: "Unsupported route",
        message: "The entered ZIP combination is not available in the current route reference.",
        actionLabel: "Review ZIP codes",
        approvalRole: "Operations",
        blocksEstimate: true,
      }));
    }

    [
      { label: "Pickup", zip: pickupZip, target: "pickupZip", storedCoverage: quote?.route?.pickupCoverage },
      { label: "Delivery", zip: deliveryZip, target: "deliveryZip", storedCoverage: quote?.route?.deliveryCoverage },
    ].forEach((point) => {
      if (!point.zip) return;
      const coverage = useStoredCoverage && point.storedCoverage
        ? point.storedCoverage
        : window.ZipCoverage?.get(point.zip);
      if (!coverage) return;
      if (!coverage.inCoverageDataset) return;

      if (coverage.coverageStatus === "disabled") {
        warnings.push(warning({
          id: `WARN-UI-ZIP-EXCLUDED-${point.zip}`,
          severity: "warning",
          scope: "route",
          target: point.target,
          title: `${point.label} ZIP is excluded`,
          message: `ZIP ${point.zip} is marked Excluded from standard coverage. Review before sending the estimate.`,
          actionLabel: "Review ZIP",
          approvalRole: "Operations",
        }));
      } else if (coverage.coverageStatus === "approval_required") {
        warnings.push(warning({
          id: `WARN-UI-ZIP-REVIEW-${point.zip}`,
          severity: "approval",
          scope: "route",
          target: point.target,
          title: `${point.label} ZIP requires review`,
          message: `ZIP ${point.zip} is a remote or uncommon service area and requires business review.`,
          actionLabel: "Review ZIP",
          approvalRole: "Admin / Head of Sales",
        }));
      }
    });

    const calculatedItems = Array.isArray(result?.items) ? result.items : [];
    if (!calculatedItems.length) {
      warnings.push(warning({
        id: "WARN-UI-ITEM-MISSING",
        severity: "warning",
        scope: "quote",
        target: "items",
        title: "No complete items",
        message: "Add at least one item with dimensions or weight to calculate a quote.",
        actionLabel: "Complete item",
      }));
    }

    calculatedItems.forEach((item) => {
      const itemName = item.name || "Item";
      const itemTarget = `item:${item.id}`;
      const itemWarning = String(item.warning || "");
      if (itemWarning === "Fill up the weight") {
        warnings.push(warning({
          id: `WARN-UI-ITEM-WEIGHT-${item.id}`,
          severity: "warning",
          scope: "item",
          target: `${itemTarget}:weight`,
          title: `${itemName}: weight is missing`,
          message: "Volume is present, but item weight is 0.",
          actionLabel: "Enter weight",
        }));
      } else if (itemWarning === "Extremely heavy") {
        warnings.push(warning({
          id: `WARN-UI-ITEM-EXTREME-${item.id}`,
          severity: "approval",
          scope: "item",
          target: itemTarget,
          title: `${itemName}: extremely heavy`,
          message: "Review crew, equipment, vehicle fit, and handling before sending the estimate.",
          actionLabel: "Review handling",
          approvalRole: "Operations",
        }));
      } else if (itemWarning && itemWarning !== "OK") {
        warnings.push(warning({
          id: `WARN-UI-ITEM-REVIEW-${item.id}`,
          severity: "approval",
          scope: "item",
          target: itemTarget,
          title: `${itemName}: handling review`,
          message: itemWarning,
          actionLabel: "Review item",
          approvalRole: "Operations",
        }));
      }

      const protectionPlan = item.protectionPlan || (item.insurance === "Full Coverage" ? "FVP" : "RV");
      if (protectionPlan === "FVP" && number(item.declaredValue) <= 0) {
        warnings.push(warning({
          id: `WARN-UI-FVP-VALUE-${item.id}`,
          severity: "blocking",
          scope: "protection",
          target: `${itemTarget}:declaredValue`,
          title: `${itemName}: Declared Value required`,
          message: "FVP requires an explicit Declared Value.",
          actionLabel: "Enter Declared Value",
          blocksEstimate: true,
        }));
      }
      if (protectionPlan === "DV") {
        warnings.push(warning({
          id: `WARN-UI-DV-${item.id}`,
          severity: "approval",
          scope: "protection",
          target: itemTarget,
          title: `${itemName}: DV confirmation required`,
          message: "DV is prepared for future pricing and must be confirmed separately.",
          actionLabel: "Review protection",
          approvalRole: "Manager / Legal",
        }));
      }
    });

    if (number(result?.totals?.effectiveVolume) >= 250) {
      warnings.push(warning({
        id: "WARN-UI-BULKY-ORDER",
        severity: "approval",
        scope: "capacity",
        target: "quoteOptions",
        title: "Large shipment review",
        message: "250+ cu ft detected. Review Direct service and capacity requirements.",
        actionLabel: "Review options",
        approvalRole: "Operations",
      }));
    }

    const hasBlocking = warnings.some((entry) => entry.severity === "blocking");
    const readiness = hasBlocking
      ? { id: "blocked", label: "Blocked" }
      : warnings.length
        ? { id: "review", label: "Review Required" }
        : { id: "ready", label: "Ready" };

    return {
      readiness,
      warnings,
      blocksEstimate: hasBlocking,
      enforcementEnabled: false,
    };
  }

  window.WarningPresentation = { build };
})();
