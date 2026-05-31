# Logistics Pricing Calculator Implementation Plan

## Current Project Shape

The repository is currently a static HTML/Tailwind wireframe. The first working MVP should use `index.html` as the primary full quote calculator because it already contains:

- route ZIP inputs;
- customer/contact fields;
- editable item rows;
- access and order-level options;
- estimate summary;
- broker notes section.

`quick-quote.html` should remain the fast entry point, but it should be wired after the full calculator logic is stable. `breakdown.html`, `estimate-document.html`, `ebol.html`, `variables.html`, `formulas.html`, `references.html`, and lifecycle/history pages should remain available as reference and workflow screens.

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

Zone distance matrix includes `CA North`, `CA South`, `DC Area`, `NY Area`, `Boston`, and `TX`. The external `zone_zip_map.csv` has 3,172 ZIP rows with columns `Region`, `ZoneName`, `ZIP`. First MVP should use it only for ZIP validation and zone lookup; addresses outside the map should be rejected or marked unsupported.

## Implementation Phases

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

