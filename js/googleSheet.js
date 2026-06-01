(function () {
  const config = {
    enabled: Boolean(window.ZabermanConfig?.googleSheets?.enabled),
    endpoint: window.ZabermanConfig?.googleSheets?.endpoint || "",
  };

  function buildPayload(quote, result) {
    const timestamp = new Date().toISOString();
    const quoteId = quote.quoteId || quote.estimateId || `QUOTE-${Date.now()}`;
    const estimateId = quote.estimateId || quoteId;
    const manualAdjustment = result.totals.manualAdjustment || 0;
    const displayedAdditionalCharges = (result.totals.additionalCharges || 0) + manualAdjustment;
    return {
      schema_version: 1,
      source: "zaberman-calculator-local",
      action: quote.status === "generated" ? "estimate_generated" : "quote_saved",
      timestamp,
      quote_id: quoteId,
      estimate_id: estimateId,
      status: quote.status || "draft",
      customer: {
        lead_name: quote.customer?.leadName || "",
        name: quote.customer?.name || "",
        phone: quote.customer?.phone || "",
        email: quote.customer?.email || "",
      },
      route: {
        pickup_zip: quote.route?.pickupZip || "",
        delivery_zip: quote.route?.deliveryZip || "",
        pickup_address: quote.route?.pickupAddress || "",
        delivery_address: quote.route?.deliveryAddress || "",
        pickup_zone: result.pickupZone,
        delivery_zone: result.deliveryZone,
        distance: result.distance || 0,
        route_supported: Boolean(result.routeSupported),
      },
      access: quote.access || {},
      options: quote.options || {},
      items: result.items,
      totals: {
        total_volume: result.totals.totalVolume,
        effective_volume: result.totals.effectiveVolume,
        total_weight: result.totals.totalWeight,
        operational_cost: result.totals.operationalCost,
        route_cost: result.totals.routeCost,
        labor_cost: result.totals.laborCost,
        additional_charges: displayedAdditionalCharges,
        calculated_additional_charges: result.totals.additionalCharges,
        packaging: result.totals.packaging,
        storage: result.totals.storage,
        insurance: result.totals.insurance,
        access_fees: result.totals.accessFees,
        option_fees: result.totals.optionFees,
        margin: result.totals.margin,
        raw_price: result.totals.rawPrice,
        rounding_delta: result.totals.roundingDelta,
        final_price: result.totals.finalPrice,
      },
      vehicle: result.vehicle || {},
      required_crew: result.requiredCrew || 0,
      warnings: result.warnings || [],
      protection_plan: result.totals.insurance > 0 ? "Full Coverage" : "Basic Liability",
      manual_adjustment: manualAdjustment,
      formula_version: window.CalculatorVariables?.formulaVersion || "unknown",
      variables_snapshot: window.PricingConfig?.snapshot?.() || null,
      notes: quote.options?.notes || "",
    };
  }

  async function sendCalculation(payload) {
    if (!config.enabled || !config.endpoint) {
      return {
        skipped: true,
        message: "Google Sheet integration is disabled until an Apps Script endpoint is configured.",
      };
    }

    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      return {
        success: false,
        error: data.error || `Google Sheets request failed with HTTP ${response.status}.`,
      };
    }
    return data;
  }

  window.GoogleSheetIntegration = {
    config,
    buildPayload,
    sendCalculation,
  };
})();
