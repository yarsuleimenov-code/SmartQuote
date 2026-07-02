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
- The temporary `Zaberman_Calculator_UAT.xlsx` workbook was intentionally removed after manual baseline validation.
- The retained UAT baseline is documented in `docs/uat-test-cases.md` and executable smoke tests.
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
- Active runtime values in `variables.html` remain read-only until interactive Pricing Engine governance is finished.
- Variables intentionally uses a single active-value model. Current / Proposed comparison is excluded from this operational screen; future analytics should be separate. Save Variables remains disabled.
- `references.html` allows local vehicle administration while broader reference governance and activation workflows remain incomplete.
- `formulas.html` is a generated read-only catalog of the unified 225-formula architecture from AS-IS and TO-BE masterdata, not an executable pricing engine.
- Normalized Formula Sprint registries are stored under `docs/formula-spec/normalized/`; the review workbook is `outputs/masterdata-normalization/SmartQuote_Masterdata_Normalization.xlsx`.
- `js/calculationContract.js` provides the versioned Formula Sprint input/output boundary and normalized Formula ID trace while preserving the UAT-approved calculation outputs.
- The next masterdata sprint keeps two operational screens: Variables for concise active parameter control and References for business lookup tables. A separate System Registry is not planned because it has no current broker or operations value.
- Operational masterdata mapping is generated from the normalized registries in `js/operationalMasterdata.js` and `docs/operational-masterdata-mapping.csv`. Variables exposes 52 business-owned values, including primary labor/time and access inputs, while retaining all 116 records for Formula Trace; References exposes all 40 records in six operational groups, including Fuel Prices.
- Cost Breakdown v2 is the current admin/CFO explanation screen. It uses a Price Storyline, visual price composition, reconciliation, collapsible route-stage details, operational analysis, human-readable Formula Trace, and hidden Developer Payload.
- Lifecycle Map is a modern architecture reference for Quote -> Estimate -> Invoice -> Order -> eBOL -> Completed.
- Vehicle depreciation / amortization is visible as audit/reference data only and does not affect AS-IS pricing.

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
- Formula Sprint `TBE-FEE-002` is active in test mode: FVP cost is `SUM(FVP declared value) x rate + fixed fee once per order`. The formula version is `formula-sprint-fvp-v1`; RV remains included and DV remains future-ready without new price logic.
- DV must not use `Item Ref. Price` as Declared Value; new protection pricing logic is deferred.
- Quote Draft does not show a separate Crate checkbox; custom crate handling should be captured through Packaging = Custom Crate while legacy `crated` data remains compatible.
- Estimate Document is customer-facing and must stay free of margin, operational cost, fuel internals, vehicle cost internals, and management/dispatch details.
- My Estimates should expose only supported actions: Preview HTML/PDF, Breakdown, Reopen Draft, status tracking, and Delete. Invoice, Order, and eBOL remain future workflows until handoff rules and shared storage are defined.
- My Drafts should expose only supported actions: Continue Quote, Review Cost, Delete, and local search/filter/sort. Draft status is derived from route/items completeness.
- Direct Pickup / Direct Delivery are manual capture fields for the current MVP and do not affect price.
- `250+ cu ft` may trigger a Direct review recommendation only; it must not auto-enable Direct.
- Quote Draft must remain compact for broker input; pickup / interstate / delivery stage visibility belongs in Cost Breakdown.
- Cost Breakdown stage visibility exposes existing pickup / interstate / delivery costs and component buckets from the calculator result; it must not introduce new pricing formulas.
- Cost Breakdown includes read-only Capacity Analysis, normalized warning details, Vehicle Fit placeholders, stage reconciliation, and an AS-IS Formula Trace. Missing Formula Sprint outputs remain `Not available` or blocked.
- Cost Breakdown Formula Trace is business-readable and should not expose JSON as the primary CFO/CEO review surface.
- Floor and elevator availability are captured for future labor/access pricing, but no floor/elevator pricing formula is active yet.
- Future floor fee formula under discussion: `6.5 x max(floor - 3, 0) x people x item_count`.
- Broker-facing packaging hides Bubble Protection; TV box rates and Custom Crate pricing require approved References/rates before activation.
- `My Drafts`, `My Estimates`, `Cost Breakdown`, and `Estimate Document` are linked to local snapshots.
- `My Drafts` and `My Estimates` include compact Storage / Backup controls and local storage health warnings.
- Quote Draft warning presentation is normalized through `js/warningPresentation.js`.
- Pickup Time Curve is a hybrid AS-IS contract: a smooth rational curve to `80 cu ft`, then `0.5 min/cu ft`. Variables presents business control points instead of technical A/B coefficients; legacy A/B remains internal until governed curve editing is approved.
- Quote readiness is presentation-only until blocking/approval governance is approved.
- Vehicle Fit / Capacity TO-BE outputs are defined in `docs/vehicle-fit-capacity-output-contract.md`; the frontend must not infer missing density or dimensional-fit values.
- Admin ZIP Coverage uses generated runtime data derived from the external `coverage_zip_route_zone_map.xlsx` source, with ZIP search, zone filtering, and locally saved coverage statuses.
- Coverage states are Covered, Excluded, and Review.
- Every ZIP currently has a read-only default price coefficient of `1.00`; coefficient pricing is not active.
- ZIP coefficients can be captured locally within `0.50-2.00`; they remain inactive in pricing.
- The generated 2,607-ZIP dataset in `js/coverageZipData.js` is the active test coverage source committed with the application.
- Excluded and Review ZIPs surface warnings in Quote Draft but do not block estimate generation.
- ZIP coverage status does not change pricing formulas.

## Next Business Handoff Priorities

1. Keep documentation synchronized to current HEAD `1e9ea9c Add vehicle depreciation audit and special warnings`.
2. QA Cost Breakdown v2 across desktop, tablet, and mobile widths before new UI work.
3. Audit Estimate Document as a customer-facing artifact and decide whether a v2 wireframe is needed.
4. If Formula Sprint starts, select exactly one Formula ID block, define UAT cases, bump formulaVersion for price-impact changes, and avoid unrelated UI changes.
5. Keep broad governed editing, benchmark preview, backend migration, ZIP price activation, and Save Variables deferred until separate approval.

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
