# Logistics Pricing Calculator Implementation Plan

## Formula Sprint Readiness Update

Masterdata normalization is complete:

- 225 Formula IDs retained;
- 116 canonical variables;
- 40 canonical references;
- formula dependency map and explicit test assumptions generated.

Formula Sprint Foundation is implemented: input normalization, version metadata, and Formula ID trace are added without changing current quote prices.

The first approved TO-BE contract slice is implemented:

- Normalized Order Inputs are captured in `calculationContract.normalizedOrderInputs`.
- Route Classification is captured in `calculationContract.routeClassification`.
- Direct/specific-date flags, ZIP coverage readiness, distance source, and ZIP coefficients are audit outputs only.
- No price impact is enabled.

The second approved TO-BE contract slice is implemented:

- Item Handling / Crew Feasibility is captured in `calculationContract.itemHandlingFeasibility`.
- Max single item weight, weight class, item handling factors, one-person eligibility, required crew from current item rules, hard access constraints, and crew review readiness are audit outputs only.
- No price impact is enabled.

The third approved TO-BE contract slice is implemented:

- Capacity / Vehicle Fit is captured in `calculationContract.capacityVehicleFit`.
- Selected vehicle snapshot, recommended vehicle by current volume/payload capacity, utilization, density, limiting capacity factor, volume fit, payload fit, and capacity warnings are audit outputs only.
- Dimensional fit, door opening fit, and equipment fit are explicitly `not_available` until governed vehicle body specs exist.
- No price impact is enabled.

The first controlled price-impact Formula Sprint block is implemented in test mode:

- `TBE-FEE-002` aggregates FVP declared values at the order level.
- The FVP fixed fee is applied once per order, not once per protected item.
- The active formula version is `formula-sprint-fvp-v1`.
- RV remains included and DV remains future-ready without new pricing logic.
- Frozen estimate snapshots preserve their saved result and variables snapshot.

The next planned sprint is operational masterdata coverage. It does not activate another price formula: it maps all approved variables and references into concise Variables and References screens before `TBE-FEE-001` Custom Crate pricing is considered.

## Current Project Shape

The repository is a working static-frontend SmartQuote MVP with local JavaScript calculation, localStorage workflow persistence, frozen estimate snapshots, and test-mode Cloudflare/Google Sheets integrations.

`index.html` is the primary Full Quote calculator and contains:

- route ZIP inputs;
- customer/contact fields;
- editable item rows;
- access and order-level options;
- estimate summary;
- broker notes section.

`quick-quote.html` is the fast entry point and feeds saved drafts/estimate snapshots. `breakdown.html`, `estimate-document.html`, `drafts.html`, and `estimates.html` consume local saved records. `variables.html`, `formulas.html`, `references.html`, and lifecycle/history pages are admin/reference screens.

Current implementation notes:

- Runtime defaults live in `js/variables.js`.
- `js/pricingConfig.js` applies saved admin overrides on top of defaults and provides `variablesSnapshot`.
- `variables.html` is read-only to prevent uncontrolled pricing changes.
- `references.html` supports local vehicle administration; broader reference governance remains deferred.
- Generated estimate snapshots include `formulaVersion` and `variablesSnapshot`.
- `js/calculator.js` is treated as UAT-approved baseline.

## Excel Findings

Source workbook: `Loads calculator 4.5 (Suleimanov).xlsx`.

Sheets found:

- `Техзадание` - business notes and constraints.
- `Calculator` - main user-facing calculation sheet.
- `Checking` - validation and warning aggregation.
- `History` - historical rows.
- `Calculations` - derived cost model.
- `Settings` - rates, margins, insurance, storage, broker fees.
- `Labor` - labor time and wage assumptions.
- `Vehicles` - vehicle capacity, payload, MPG, fuel, maintenance rates.
- `Warnings` - warning thresholds and messages.
- `Zones` - zone distance matrix.

Key formulas identified:

- Item total weight: `qty * item_weight`.
- Item volume: `(length / 12) * (width / 12) * (height / 12) * qty`.
- Volume weight: `total_weight / volume`.
- Insurance premium: `declared_value * insurance_rate + fixed_fee` when rate is selected.
- Storage: `volume * storage_days * storage_rate`.
- Final price in workbook: gated by `Checking`, rounded up from `Calculations!BH4` plus storage.
- Price per cubic foot: `(final_price - storage) / total_volume`.

Key current rates and assumptions extracted:

- Insurance rate: `2.5%`.
- Insurance fixed fee: `$15`.
- Margin rate: `30%`.
- Storage rate: `$0.03333333333` per cubic foot per day.
- Packaging per shipment: `$6.32`.
- Wage per minute: `$0.4777088333`.
- Pickup wage per mile: `$0.6369451111`.
- Interstate driver cost per mile: `$0.56825`.
- Warning thresholds: acceptable weight `40 lb`, one-person max `100 lb`, unacceptable weight `200 lb`, one-person dimension sum `11 ft`.

Vehicle reference rows include:

- `Sprinter 488 cu ft`, capacity `488.1 cu ft`, payload `3704 lb`.
- `Box truck 16 ft`, capacity `800 cu ft`, payload `4300 lb`.
- `Box truck 20 ft`, capacity `1200 cu ft`, payload `10000 lb`.
- `Enterprise 26 ft`, capacity `1650 cu ft`, payload `8800 lb`.
- `Penske 26 ft`, capacity `1650 cu ft`, payload `8800 lb`.

Zone distance matrix includes `CA North`, `CA South`, `DC Area`, `NY Area`, `Boston`, and `TX`.

The active test coverage source is the generated 2,607-ZIP dataset in `js/coverageZipData.js`, derived from `coverage_zip_route_zone_map.xlsx`. ZIP Coverage supports search, zone/status filters, local coverage status, and local coefficient capture. Excluded and Review ZIPs produce non-blocking warnings. ZIP coefficients do not affect pricing.

## Implementation Phases

### Current Stabilization Baseline

Files:

- `js/calculator.js`
- `js/variables.js`
- `js/pricingConfig.js`
- `js/storage.js`
- `js/ui.js`
- `js/quickQuote.js`
- `js/googleSheet.js`

Result:

- Local calculator works against accepted benchmark assumptions.
- Drafts and estimates can be stored locally.
- Estimate snapshots contain formula and variables metadata.
- Special Labor Adjustment replaces direct broker dollar adjustment: people x hours x internal hourly rate. Quote Draft exposes only people/hours; the rate is internal/CFO-approved. Legacy `manualAdjustment` is preserved only for older draft/snapshot compatibility.

Verification:

- `node tools/smoke_test_calculator.js`.
- Manual broker flow: Quick Quote -> Full Quote -> Generate Estimate -> Estimate Document -> My Estimates -> Cost Breakdown.

If limits end:

- Do not modify `js/calculator.js`.
- Continue by improving workflow screens and persistence around the accepted calculation engine.

### Phase 1 - Project Cleanup / Layout Stabilization

Files:

- `index.html`
- `sidebar.js` only if navigation needs adjustment.

Result:

- Main calculator screen has stable IDs/data attributes for JavaScript.
- Existing reference pages remain reachable.

Verification:

- Local HTML links resolve.
- No direct legacy brand strings return in search.

If limits end:

- Keep existing static UI working and add TODO notes for unbound controls.

### Phase 2 - Extract Excel Logic

Files:

- `docs/implementation-plan.md`
- `docs/workbook-logic.json`
- `tools/extract_workbook_logic.py`

Result:

- Workbook structure, formulas, variables, and assumptions are documented.

Verification:

- Re-run extraction script against the workbook.

If limits end:

- Continue with formula parity before adding more UI behavior.

### Phase 3 - Local Interactive Calculator

Files:

- `js/variables.js`
- `js/calculator.js`
- `js/mockData.js`
- `js/ui.js`
- `js/app.js`
- `index.html`

Result:

- Editing route, items, packaging, insurance, storage, and access options recalculates totals locally.

Verification:

- Change quantity/dimensions/weight and confirm volume, weight, storage, insurance, operational cost, margin, and final price update.

If limits end:

- Leave Google Sheet integration disabled and preserve local calculation.

### Phase 4 - Save Draft / localStorage

Files:

- `js/storage.js`
- `index.html`

Result:

- Draft can be saved, loaded, and cleared locally.

Verification:

- Save draft, reload page, load draft.

If limits end:

- Keep only localStorage; do not start Google Sheet connection.

### Phase 5 - Google Sheet Integration

Files:

- `js/googleSheet.js`
- `google-apps-script.gs`

Result:

- Frontend can build the expected payload.
- Sending remains disabled until an Apps Script Web App endpoint is configured.
- Test-mode Cloudflare proxy can forward payloads when `APPS_SCRIPT_ENDPOINT` and `SHEETS_AUTH_TOKEN` are configured.
- Payload includes `formula_version`, `variables_snapshot`, `manual_adjustment`, displayed `additional_charges`, and calculated base additional charges.

Verification:

- Payload contains timestamp, estimate ID, customer, route, items JSON, totals, status, protection plan, adjustments, and notes.

If limits end:

- Leave endpoint empty and return a clear UI message.

### Phase 6 - Estimate Document Generation

Files:

- `estimate-document.html`
- future shared snapshot module.

Result:

- Estimate document consumes an immutable snapshot rather than editable live UI state.

Verification:

- Generated document matches saved quote totals.

If limits end:

- Continue from snapshot schema.

### Phase 7 - QA And Regression Checks

Checks:

- `rg` for legacy brand/contact strings.
- static link target check.
- browser smoke test where runtime is available.
- syntax check for JS modules.

### Phase 8 - Operational Variables And References

Files:

- `variables.html`
- `js/variablesAdmin.js`
- `js/pricingConfig.js`
- `js/variables.js`
- `tools/smoke_test_calculator.js`

Variables is a concise operational control screen. Each row contains only:

```text
Variable ID | Name | Active Value | Unit
```

Variables is grouped into Pricing and Margin, Labor and Time, Access and Service, Item Handling, Capacity and Vehicle Economics, Protection/Storage/Packaging, and Warnings/Approval.

References is grouped into Route and Coverage, Vehicles, Items and Handling, Services, and People and Operations. Reference tables expose only operational columns needed to inspect and maintain the relevant entity.

The screens must not show formula dependency payloads, Current/Proposed comparisons, or a separate System Registry. Formula architecture stays in `formulas.html`, Cost Breakdown, documentation, and tests.

Do not enable broad editing until controlled versioning and benchmark preview are approved. Existing supported reference editing remains unchanged.

Result:

- All approved variables and references have an operational screen/section assignment.
- Active values, test assumptions, missing data, and legacy compatibility are explicit in the masterdata mapping.
- New datasets required by a later Formula Sprint block can be introduced read-only before pricing activation.
- Existing estimate snapshots stay frozen.

Verification:

- Before/after preview shows expected deltas.
- Existing smoke test still passes for baseline after reset.
- Saved estimate includes new `variablesSnapshot`.
