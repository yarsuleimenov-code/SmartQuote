(function () {
  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function dateText(value) {
    return String(value || "").trim();
  }

  function warning(record) {
    return {
      approvalRole: "",
      blocksEstimate: false,
      businessImpact: "Review before sending estimate.",
      ...record,
    };
  }

  function addDirectWarnings(warnings, quote) {
    [
      {
        label: "Pickup",
        flag: Boolean(quote?.options?.pickupDirect),
        date: dateText(quote?.options?.pickupDirectDate),
        flagTarget: "pickupDirect",
        dateTarget: "pickupDirectDate",
      },
      {
        label: "Delivery",
        flag: Boolean(quote?.options?.deliveryDirect),
        date: dateText(quote?.options?.deliveryDirectDate),
        flagTarget: "deliveryDirect",
        dateTarget: "deliveryDirectDate",
      },
    ].forEach((point) => {
      if (point.flag && !point.date) {
        warnings.push(warning({
          id: `WARN-UI-DIRECT-DATE-${point.label.toUpperCase()}`,
          severity: "approval",
          scope: "route",
          target: point.dateTarget,
          title: `${point.label} Direct date is required`,
          message: "Direct service is selected manually and needs a specific service date for operations review.",
          actionLabel: "Add date",
          approvalRole: "Operations",
          businessImpact: "Direct service may change dispatch planning and route availability.",
        }));
      } else if (!point.flag && point.date) {
        warnings.push(warning({
          id: `WARN-UI-DIRECT-FLAG-${point.label.toUpperCase()}`,
          severity: "warning",
          scope: "route",
          target: point.flagTarget,
          title: `${point.label} date entered without Direct flag`,
          message: "A specific date does not automatically mean Direct service. Select Direct only when the route cannot be combined normally.",
          actionLabel: "Review Direct",
          approvalRole: "Broker",
          businessImpact: "Prevents accidental Direct service assumptions.",
        }));
      }
    });
  }

  function addAccessWarnings(warnings, quote) {
    [
      { label: "Pickup", point: quote?.access?.pickup, target: "pickupFloor" },
      { label: "Delivery", point: quote?.access?.delivery, target: "deliveryFloor" },
    ].forEach((entry) => {
      const access = entry.point || {};
      const floor = number(access.floor);
      const elevatorAvailable = access.elevatorAvailable !== undefined
        ? Boolean(access.elevatorAvailable)
        : !Boolean(access.elevatorUnavailable);
      if (floor > 3 && !elevatorAvailable) {
        warnings.push(warning({
          id: `WARN-UI-FLOOR-${entry.label.toUpperCase()}`,
          severity: "approval",
          scope: "access",
          target: entry.target,
          title: `${entry.label}: stairs / floor review`,
          message: `Floor ${floor} without elevator is captured for future floor-fee logic. Review labor and helper need before sending.`,
          actionLabel: "Review access",
          approvalRole: "Operations",
          businessImpact: "May require additional labor time or helper planning.",
        }));
      } else if (access.stairs && floor > 1) {
        warnings.push(warning({
          id: `WARN-UI-STAIRS-${entry.label.toUpperCase()}`,
          severity: "warning",
          scope: "access",
          target: entry.target,
          title: `${entry.label}: stairs selected`,
          message: "Stairs are noted for operations review. Current AS-IS pricing is unchanged.",
          actionLabel: "Review access",
          approvalRole: "Operations",
          businessImpact: "May affect handling plan and future labor pricing.",
        }));
      }
    });
  }

  function addSpecialLaborWarnings(warnings, quote) {
    const people = number(quote?.options?.extraLaborPeople);
    const hours = number(quote?.options?.extraLaborHours);
    if ((people > 0 && hours <= 0) || (hours > 0 && people <= 0)) {
      warnings.push(warning({
        id: "WARN-UI-SPECIAL-LABOR-INCOMPLETE",
        severity: "warning",
        scope: "quote",
        target: "quoteOptions",
        title: "Special Labor is incomplete",
        message: "Enter both Extra Labor People and Extra Labor Hours, or leave both as 0.",
        actionLabel: "Review labor",
        approvalRole: "Broker",
        businessImpact: "Avoids accidentally missing special handling cost.",
      }));
    } else if (people > 0 && hours > 0) {
      warnings.push(warning({
        id: "WARN-UI-SPECIAL-LABOR-CAPTURED",
        severity: "info",
        scope: "quote",
        target: "quoteOptions",
        title: "Special Labor captured",
        message: `${people} ${people === 1 ? "person" : "people"} x ${hours} ${hours === 1 ? "hour" : "hours"} is included as special handling time.`,
        actionLabel: "Review labor",
        approvalRole: "Broker",
        businessImpact: "Explains extra handling time included in the quote.",
      }));
    }
  }

  function addPackagingAndFlagWarnings(warnings, item, itemName, itemTarget) {
    if (item.fragile) {
      warnings.push(warning({
        id: `WARN-UI-FRAGILE-${item.id}`,
        severity: "warning",
        scope: "item",
        target: itemTarget,
        title: `${itemName}: fragile handling`,
        message: "Fragile item flag is captured. Confirm packaging and customer expectations before sending.",
        actionLabel: "Review item",
        approvalRole: "Broker",
        businessImpact: "Reduces mismatch between quote assumptions and handling risk.",
      }));
    }
    if (item.nonStackable) {
      warnings.push(warning({
        id: `WARN-UI-NONSTACK-${item.id}`,
        severity: "approval",
        scope: "item",
        target: itemTarget,
        title: `${itemName}: non-stackable item`,
        message: "Non-stackable item affects capacity planning. Current AS-IS price is unchanged unless effective volume already captures it.",
        actionLabel: "Review item",
        approvalRole: "Operations",
        businessImpact: "May reduce route consolidation capacity.",
      }));
    }
    if (item.packaging === "Custom Crate") {
      warnings.push(warning({
        id: `WARN-UI-CRATE-${item.id}`,
        severity: "approval",
        scope: "item",
        target: itemTarget,
        title: `${itemName}: custom crate requested`,
        message: "Custom crate is captured for review. Crate pricing formula is not active until approved.",
        actionLabel: "Review crate",
        approvalRole: "Operations",
        businessImpact: "Requires material and labor confirmation before future formula activation.",
      }));
    }
  }

  function severityRank(severity) {
    return { blocking: 0, approval: 1, warning: 2, info: 3 }[severity] ?? 4;
  }

  function build({ quote, result, useStoredCoverage = false }) {
    const warnings = [];
    const pickupZip = String(quote?.route?.pickupZip || "").trim();
    const deliveryZip = String(quote?.route?.deliveryZip || "").trim();
    const hasBothZips = Boolean(pickupZip && deliveryZip);

    addDirectWarnings(warnings, quote);
    addAccessWarnings(warnings, quote);
    addSpecialLaborWarnings(warnings, quote);

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
      addPackagingAndFlagWarnings(warnings, item, itemName, itemTarget);
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
    warnings.sort((a, b) => severityRank(a.severity) - severityRank(b.severity) || String(a.title).localeCompare(String(b.title)));
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
