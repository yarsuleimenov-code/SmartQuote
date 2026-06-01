# SmartQuote Current Handoff

## Status

SmartQuote is a working business MVP prototype for Zaberman LLC broker pricing. It is not production-ready, but it has moved beyond static wireframes.

Implemented:

- Quick Quote with conservative 2-person default.
- Full Quote with accepted local pricing calculation.
- Multiple local drafts.
- Generated estimate snapshots.
- Estimate status tracking.
- Cost Breakdown for selected draft or estimate.
- Estimate Document from saved snapshot.
- Cloudflare Pages deployment.
- Admin-only page protection.
- Google Sheets proxy for test-mode backup/audit.
- Frontend pricing config layer and variables snapshot support.

## Calculation Rule

`js/calculator.js` is the current UAT-approved calculation baseline.

Do not change it unless:

- a business calculation bug is explicitly confirmed;
- benchmark cases are updated;
- smoke tests are adjusted intentionally.

Current accepted checks are in:

- `tools/smoke_test_calculator.js`
- `docs/uat-test-cases.md`
- `Zaberman_Calculator_UAT.xlsx`

## Pricing Config

Runtime variable flow:

```text
js/variables.js defaults
->
js/pricingConfig.js saved admin overrides
->
window.CalculatorVariables
->
PricingCalculator.calculateQuote()
```

`variables.html` and `references.html` are intentionally read-only until governed editing is implemented.

`formulas.html` is documentation only.

## Snapshot Rule

Generated estimates store:

- `formulaVersion`;
- `variablesSnapshot`;
- frozen `quote`;
- frozen `result`.

Drafts are live and may recalculate against current variables.

Estimates are frozen and should display saved results.

## Next Recommended Step

Build Interactive Variables MVP:

1. Expose only safe variables first.
2. Show benchmark impact preview before save.
3. Save admin overrides through `js/pricingConfig.js`.
4. Capture the updated `variablesSnapshot` on new estimates.
5. Keep existing estimates unchanged.

Initial safe variable set:

- margin rate;
- rounding increment;
- priority date fee;
- storage rate;
- access fees;
- packaging rates;
- protection plans.

Do not make vehicle parameters, route matrix, or effective-volume multipliers editable until benchmark preview is stable.
