# SmartQuote Project Context

## Product

SmartQuote is a Zaberman LLC broker calculator for quick quotes, full customer estimates, quote breakdowns, drafts, and estimate documents.

## Primary User

Sales broker / admin user who needs fast, explainable, and reasonably accurate interstate delivery pricing.

## Current Business Focus

- Improve speed and clarity of broker-side price calculation.
- Keep calculations aligned with the original spreadsheet where business logic is confirmed.
- Prioritize practical usability over architectural expansion.
- Avoid unnecessary security hardening during test mode unless explicitly requested.
- Prepare the calculator for business handoff: stable broker flow, explainable pricing, recoverable saved records, and controlled admin calibration.

## Key Pricing Notes

- `CA South -> CA North` with `85 x 63 x 47`, `qty 1`, volume-dominant weight such as `80-150 lb`, crew `2/1/2` is expected around `$850`.
- Long interstate route examples such as `NY Area -> CA North` may be around `$1360` for the same item.
- `Zaberman_Calculator_UAT.xlsx` is the current UAT workbook for calculation acceptance checks.
- Compact UAT index is documented in `docs/uat-test-cases.md`.
- Primary calculation flow is accepted by manual UAT: 8 / 8 cases pass when SmartQuote uses the same assumptions as Spreadsheet/Zion.
- Treat `js/calculator.js` as fixed for now; do not change pricing logic while building screen links or operational workflow screens.
- `Eff. volume` is rounded up to a whole cubic foot in the calculation model.
- Empty items and name-only items must not create a non-zero quote.
- Quick Quote defaults to 2-person crew assumption.
- Quick Quote item selection is sourced from References Item Catalog through `js/itemCatalog.js`.
- Quick Quote -> Full Quote transfer preserves catalog dimensions when volume has not been manually overridden; otherwise it falls back to approximate volume-based dimensions.

## Current Architecture

- Static frontend deployed through Cloudflare Pages.
- Pricing logic is local JavaScript in `js/calculator.js`.
- Runtime pricing constants are defined in `js/variables.js`.
- `js/pricingConfig.js` applies future saved admin overrides on top of default runtime constants and exposes `variablesSnapshot`.
- UI for Full Quote is in `index.html` and `js/ui.js`.
- Quick Quote logic is in `quick-quote.html` and `js/quickQuote.js`.
- Local/browser storage is used for multiple drafts and generated estimate snapshots; Google Sheets integration exists through Apps Script endpoint.
- Stage 6 adds a local JSON backup/export-import MVP for drafts, estimates, runtime pricing buckets, and current selection keys.
- Generated estimate snapshots include `formulaVersion` and `variablesSnapshot`.
- `variables.html` and `references.html` are intentionally read-only until interactive Pricing Engine governance is finished.
- `formulas.html` is documentation only, not an executable pricing engine.

## Current Implementation Status

- Primary calculation flow is accepted for current business assumptions.
- `js/calculator.js` is treated as UAT-approved baseline and should not be changed during workflow or admin-screen work.
- New broker adjustments should use `Special Labor Adjustment`: people x hours x hourly rate. Legacy `manualAdjustment` is preserved only for older draft/snapshot compatibility.
- Quote Draft does not expose the special labor hourly rate; it remains an internal/CFO-approved value.
- `Item Ref. Price` is a read-only allocation metric, not a pricing input and not an additional cost component.
- Primary item allocation formula: `itemReferencePrice = totalQuoteAmount x (itemTotalWeight / orderTotalWeight)`.
- If total order weight is `0`, fallback formula: `itemReferencePrice = totalQuoteAmount x (itemEffectiveVolume / orderEffectiveVolume)`.
- If both total weight and effective volume are `0`, item reference price is `0`.
- `Item Ref. Price` must not be reused as customer/legal Declared Value.
- Broker-facing Insurance language is now Protection Plan. `RV` maps to legacy Basic Liability behavior, `FVP` maps to legacy Full Coverage behavior, and `DV` is future-ready data capture only.
- DV must not use `Item Ref. Price` as Declared Value; new protection pricing logic is deferred.
- Quote Draft does not show a separate Crate checkbox; custom crate handling should be captured through Packaging = Custom Crate while legacy `crated` data remains compatible.
- Estimate Document is customer-facing and must stay free of margin, operational cost, fuel internals, vehicle cost internals, and management/dispatch details.
- My Estimates should expose only supported actions: Preview HTML/PDF, Breakdown, Reopen Draft, status tracking, and Delete. Invoice, Order, and eBOL remain future workflows until handoff rules and shared storage are defined.
- My Drafts should expose only supported actions: Continue Quote, Review Cost, Delete, and local search/filter/sort. Draft status is derived from route/items completeness.
- Direct Pickup / Direct Delivery are manual capture fields for the current MVP and do not affect price.
- `250+ cu ft` may trigger a Direct review recommendation only; it must not auto-enable Direct.
- Quote Draft must remain compact for broker input; pickup / interstate / delivery stage visibility belongs in Cost Breakdown.
- Cost Breakdown stage visibility exposes existing pickup / interstate / delivery costs and component buckets from the calculator result; it must not introduce new pricing formulas.
- Floor and elevator availability are captured for future labor/access pricing, but no floor/elevator pricing formula is active yet.
- Future floor fee formula under discussion: `6.5 x max(floor - 3, 0) x people x item_count`.
- Broker-facing packaging hides Bubble Protection; TV box rates and Custom Crate pricing require approved References/rates before activation.
- `My Drafts`, `My Estimates`, `Cost Breakdown`, and `Estimate Document` are linked to local snapshots.
- `My Drafts` and `My Estimates` include compact Storage / Backup controls and local storage health warnings.
- Quote Draft warning presentation is normalized through `js/warningPresentation.js`.
- Quote readiness is presentation-only until blocking/approval governance is approved.
- Vehicle Fit / Capacity TO-BE outputs are defined in `docs/vehicle-fit-capacity-output-contract.md`; the frontend must not infer missing density or dimensional-fit values.

## Next Business Handoff Priorities

1. CEO approval of P0 TO-BE formula decisions.
2. Warning UI Contract and Quote Readiness states.
3. Vehicle Fit / Capacity output contract and broker summary.
4. Capacity Analysis and Formula Trace in Cost Breakdown after output approval.
5. Governed Variables/References with benchmark preview before activation.
6. ZIP/service-area management only after reference cleanup and ownership approval.

The implementation order from the June 19 Calculator meeting is documented in:

- `docs/calculator-meeting-ui-sprint-plan.md`.
- `docs/formula-spec/CEO_DECISION_REGISTER.xlsx`.

## Work Style

- Make minimal targeted changes.
- Preserve confirmed calculations unless a business bug is explicitly identified.
- Add or update smoke tests when calculation behavior changes.
- Push to `main` after verified changes when implementation is requested.

## Documentation Map

- `docs/current-handoff.md` is the compact current implementation handoff for future sessions.
- `docs/implementation-plan.md` defines the phased delivery path.
- `docs/broker-product-pipeline.md` defines near-term business priorities.
- `docs/pricing-engine-flow.md` documents calculation flow and variable ownership.
