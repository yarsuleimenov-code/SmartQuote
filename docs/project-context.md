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

## Current Architecture

- Static frontend deployed through Cloudflare Pages.
- Pricing logic is local JavaScript in `js/calculator.js`.
- Runtime pricing constants are defined in `js/variables.js`.
- `js/pricingConfig.js` applies future saved admin overrides on top of default runtime constants and exposes `variablesSnapshot`.
- UI for Full Quote is in `index.html` and `js/ui.js`.
- Quick Quote logic is in `quick-quote.html` and `js/quickQuote.js`.
- Local/browser storage is used for multiple drafts and generated estimate snapshots; Google Sheets integration exists through Apps Script endpoint.
- Generated estimate snapshots include `formulaVersion` and `variablesSnapshot`.
- `variables.html` and `references.html` are intentionally read-only until interactive Pricing Engine governance is finished.
- `formulas.html` is documentation only, not an executable pricing engine.

## Current Implementation Status

- Primary calculation flow is accepted for current business assumptions.
- `js/calculator.js` is treated as UAT-approved baseline and should not be changed during workflow or admin-screen work.
- New broker adjustments should use `Special Labor Adjustment`: people x hours x hourly rate. Legacy `manualAdjustment` is preserved only for older draft/snapshot compatibility.
- Quote Draft does not expose the special labor hourly rate; it remains an internal/CFO-approved value. `Item Ref. Price` is calculated read-only from the final quote amount split across billable item rows.
- `My Drafts`, `My Estimates`, `Cost Breakdown`, and `Estimate Document` are linked to local snapshots.

## Next Business Handoff Priorities

1. Interactive Variables MVP with a limited safe variable set.
2. Variables impact preview against accepted benchmark cases before saving.
3. Export/import local backup for drafts and estimates.
4. Final broker flow QA from Quick Quote to Estimate Document.
5. Google Sheets backup/audit stabilization.

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
