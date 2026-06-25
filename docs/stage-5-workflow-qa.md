# Stage 5 Workflow QA

## Goal

Stabilize the main broker workflow without adding new pricing features:

Quick Quote -> New Calculation -> Generate Estimate -> Estimate Document -> Cost Breakdown / My Estimates.

## Scope Rules

- Do not change pricing formulas.
- Do not enable Save Variables.
- Do not add Preview Before Save.
- Do not add new editable internal constants.
- Do not refactor backend/security.
- Fix only blocker, critical workflow, or small high-impact QA issues.

## QA Matrix

| Area | Scenario | Expected Result | Status | Notes |
|---|---|---|---|---|
| Quick Quote | Opens and calculates a quote | Quote total updates; blank item stays $0 | Passed | Covered by `smoke_test_calculator.js` and workflow smoke blank check |
| Quick Quote | Conservative default crew | Quick Quote uses 2-person assumption | Passed | Covered by `smoke_test_calculator.js` |
| New Calculation | Opens and calculates accepted baseline quote | Demo final price remains accepted baseline | Passed | `smoke_test_calculator.js`: final price 1460 |
| New Calculation | Empty item quote | Empty and name-only items stay $0 | Passed | `smoke_test_calculator.js` |
| Items | Add/edit/remove item workflow | Item mutation does not break calculation | Passed | Existing UI logic reviewed; calculator smoke covers item calculation behavior |
| Fuel Prices | Fuel values affect calculation | Diesel and Regular fuel changes increase quote | Passed | `smoke_test_fuel_pricing.js` |
| Vehicles | References vehicles affect fit/fuel logic | Runtime vehicles seed and active filtering work | Passed | `smoke_test_vehicles_references.js` |
| Generate Estimate | Estimate snapshot is saved | Snapshot can be saved and read back | Passed | `smoke_test_workflow.js` |
| Estimate Snapshot | Audit metadata is present | Snapshot contains formulaVersion, variablesVersion, variablesSnapshot, calculationTimestamp, sourceDraftId, fuelPricesUsed, vehicleUsed, totalPrice | Fixed / Passed | Added centralized snapshot enrichment in `js/storage.js` |
| Estimate Document | Opens from generated snapshot | Snapshot read path is available | Passed | Storage readback covered by workflow smoke; document renderer reviewed |
| My Estimates | Generated estimate is listed | Saved snapshot appears in estimate list storage | Passed | `smoke_test_workflow.js` confirms list contains generated snapshot |
| Cost Breakdown | Opens for selected draft/estimate | Draft/estimate selection and payload render paths exist | Passed | `breakdown.js` reviewed; smoke validates snapshot/draft storage |
| Navigation | Core workflow pages exist | Required pages and local href/src references resolve | Passed | `smoke_test_workflow.js` checks 8 workflow pages and local assets across 14 HTML files |
| Local Storage | Empty or stale storage does not break smoke flow | Invalid draft/estimate JSON falls back safely | Passed | `smoke_test_workflow.js` seeds invalid draft/estimate storage |
| Pricing Admin Storage | Remote disabled/enabled behavior | Empty endpoint skips remote; mocked endpoint saves remote | Passed | `smoke_test_pricing_admin_storage.js` |

## Bugs Found

| Severity | Bug | Status | Notes |
|---|---|---|---|
| P1 | Estimate snapshots lacked explicit top-level workflow audit fields: variablesVersion, calculationTimestamp, sourceDraftId, fuelPricesUsed, vehicleUsed, totalPrice | Fixed | Centralized in `CalculatorStorage.saveEstimateSnapshot`; pricing formulas unchanged |
| P2 | Workflow smoke initially treated site-root favicon paths as missing local files | Fixed in test | Product assets existed; smoke test now resolves `/...` from project root |

## Open Items / Backlog

| Severity | Item | Status | Notes |
|---|---|---|---|
| P2 | Stage 5 browser visual QA was initially limited | Closed for current broker flow | Subsequent manual/in-app visual reviews covered Quote Draft, Quick Quote, Drafts, Estimates, Estimate Document, Cost Breakdown, References, and ZIP Coverage |
| P2 | Drafts/Estimates notes still contain Russian text | Open | Not mojibake and not blocker; do not change without UX copy decision |
| P2 | Existing localStorage key model has both Pricing Admin buckets and legacy Zaberman draft/estimate keys | Open | Current migrations/fallbacks work; key consolidation can wait until storage reliability stage |

## Smoke Tests

Run:

```bash
node tools/smoke_test_calculator.js
node tools/smoke_test_pricing_baseline.js
node tools/smoke_test_pricing_admin_storage.js
node tools/smoke_test_fuel_pricing.js
node tools/smoke_test_vehicles_references.js
node tools/smoke_test_workflow.js
```

Use the bundled Codex Node runtime on this workstation if system `node` is blocked.
