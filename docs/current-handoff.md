# SmartQuote Current Handoff

## Status

SmartQuote is a working business MVP prototype for Zaberman LLC broker pricing. It is suitable for test-mode business workflow review, not production operations.

Current stable checkpoint:

- `main` remote hash: `058c6cf8d1b8bbda2480fb7391b84918f4b89295`.
- Stage 5 workflow QA and handoff stabilization completed.

Implemented:

- Quick Quote with conservative 2-person default.
- Full Quote with accepted local pricing calculation.
- Multiple local drafts.
- Generated estimate snapshots.
- Estimate status tracking in My Estimates.
- Cost Breakdown for selected draft or estimate.
- Estimate Document from saved snapshot.
- Cloudflare Pages deployment.
- Admin-only navigation sections.
- Google Sheets quote/draft/estimate proxy for test-mode backup/audit.
- Separate Google Sheets Pricing Admin storage layer for pricing admin audit/backup.
- Runtime pricing config layer with `variablesSnapshot`.
- Fuel Prices affect calculation through Internal Fuel Price.
- Vehicles are managed in References.
- References Vehicles use business-facing fields while preserving compatibility fields.
- Item Catalog seed data and References encoding were cleaned up.
- Stage 5 workflow smoke test covers storage/snapshot/navigation basics.

## Calculation Rule

`js/calculator.js` is the current UAT-approved calculation baseline.

Do not change it unless:

- a business calculation bug is explicitly confirmed;
- benchmark cases are updated;
- smoke tests are adjusted intentionally.

Current accepted checks:

- `tools/smoke_test_calculator.js`
- `tools/smoke_test_pricing_baseline.js`
- `tools/smoke_test_fuel_pricing.js`
- `tools/smoke_test_workflow.js`
- `docs/uat-test-cases.md`

## Pricing Config

Runtime variable flow:

```text
js/variables.js defaults
->
js/pricingConfig.js saved admin/runtime overrides
->
window.CalculatorVariables
->
PricingCalculator.calculateQuote()
```

`variables.html` is runtime-driven but Save Variables is disabled intentionally.

Fuel Prices affect calculation, but editing governance is not enabled yet.

`references.html` manages runtime Vehicles. References and Variables are not fully governed admin-save screens yet.

`formulas.html` is documentation only.

## Vehicle Compatibility

`References` is the canonical business screen for vehicles. It displays business-facing `mpg`, `fuelType`, capacity, payload, passenger capacity, and active status.

`calculationMpg` is a temporary compatibility field used by `js/calculator.js` when calculating fuel cost:

```text
fuelCostPerMile = internalFuelPrice / (calculationMpg || mpg)
```

It exists to keep the UAT-approved pricing baseline stable while References exposes business MPG values. In the future, business and calculation MPG should be reconciled into a single agreed value per vehicle, then `calculationMpg` can be removed.

## Snapshot Rule

Generated estimates are frozen and store:

- `formulaVersion`;
- `variablesVersion`;
- `variablesSnapshot`;
- `calculationTimestamp`;
- `sourceDraftId`;
- `fuelPricesUsed`;
- `vehicleUsed`;
- `totalPrice`;
- frozen `quote`;
- frozen `result`.

Drafts are live and may recalculate against current variables.

Estimates are frozen and should display saved results.

## Storage Notes

Pricing Admin buckets:

- `currentVariables`
- `variablesVersions`
- `vehicles`
- `fuelPrices`
- `drafts`
- `estimates`
- `calculationLogs`

Calculator workflow keys:

- `zaberman-calculator-draft`
- `zaberman-calculator-drafts`
- `zaberman-current-draft-id`
- `zaberman-estimate-snapshot`
- `zaberman-estimate-snapshots`
- `zaberman-current-estimate-id`

The mixed key model is intentional for the current MVP. Existing fallback/migration paths keep empty or stale storage from breaking the UI. Consolidation can wait until the storage reliability stage.

## Intentional Limits

- Save Variables is disabled intentionally.
- Preview Before Save is not implemented.
- Fuel Prices affect calculation, but governed editing/version preview is not enabled.
- Vehicles are editable in References, but full reference governance is not implemented.
- Google Sheets Pricing Admin layer exists as audit/backup, not as a required runtime dependency.
- Security/config endpoint handling is intentionally simple for test MVP.
- Browser visual QA may require manual review if Codex in-app browser runtime is unavailable.

## Known Risks

- Browser localStorage can still be cleared by the user; export/import or remote backup should be prioritized before production use.
- Existing localStorage keys are split between calculator workflow and pricing admin buckets.
- `calculationMpg` must be reconciled with business MPG before production governance.
- Drafts are live recalculations, so old drafts can change if variables are changed later.
- Estimate snapshots are frozen and should be used for customer-facing documents.

## Next Recommended Stage

Recommended next stage: Storage Reliability and Backup UX.

Business reason:

- The calculator is now calculation-stable and workflow-smoke-stable.
- The next risk is accidental local data loss, not pricing logic.

Recommended scope:

1. Export all drafts/estimates/pricing admin buckets to a JSON backup.
2. Import backup with validation and clear user warnings.
3. Add visible storage health/status on My Drafts and My Estimates.
4. Keep pricing formulas unchanged.
5. Do not enable Save Variables until preview/versioning governance is ready.

## Project Pause / Business Testing Handoff

Pause date: June 2, 2026.

Current remote `main` hash:

- `058c6cf8d1b8bbda2480fb7391b84918f4b89295`

Reason for pause:

- The project is being handed to brokers / business users for primary business testing.

Expected return to development:

- In 5-6 calendar days.

Ready now:

- Broker flow has been checked.
- Variables UI is runtime-driven.
- Fuel Prices participate in calculation.
- Vehicles are managed in References.
- Estimate snapshot contains audit fields.
- Stage 5 workflow smoke test has been added.

Intentionally not enabled:

- Save Variables.
- Preview Before Save.
- Full storage reliability / export-import.
- Security/config refactor.
- Backend migration.

Known risks:

- Browser visual QA was manual / limited.
- localStorage remains the primary working storage.
- `calculationMpg` temporarily preserves the UAT baseline.
- Business feedback may change priorities.

How to resume work:

1. Collect feedback from brokers.
2. Classify feedback as P0/P1/P2/P3.
3. Fix broker flow blockers first.
4. Do not enable new pricing features before feedback triage.
5. Then move to Storage Reliability and Backup UX if feedback does not reveal more critical issues.
