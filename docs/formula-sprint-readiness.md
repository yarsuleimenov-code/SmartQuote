# Formula Sprint Readiness Checklist

## Purpose

Prepare one controlled price-impact change without changing unrelated UAT-approved baseline behavior.

## Recommended First Block

**Formula ID:** `TBE-FEE-002`  
**Block:** Protection Plan - FVP order-level pricing  
**Decision:** Implement FVP fixed fee once per order, not once per FVP item.
**Implementation status:** Implemented for test mode as `formula-sprint-fvp-v1`.

### Why this block first

- It uses fields already captured in Quote Draft: `protectionPlan` and `declaredValue`.
- It uses existing runtime values: `protectionPlans["Full Coverage"].rate` and `fixedFee`.
- It does not require ZIP pricing, labor time metrics, vehicle body dimensions, or new admin workflows.
- Its price impact is limited to the protection component and is easy to reconcile in Cost Breakdown.
- It corrects a clear AS-IS versus TO-BE difference: AS-IS applies the FVP fixed fee per item; TO-BE applies it once per order.

## Formula Contract

```text
FVP declared value = SUM(declaredValue for items where protectionPlan = FVP)
FVP cost = FVP declared value x fvpRate + fvpFixedFee, if at least one FVP item exists
RV cost = included
DV cost = future/confirmation; no new DV price logic in this block
```

Rules:

- `Item Ref. Price` must never be used as Declared Value.
- FVP requires an explicit non-negative `declaredValue`.
- FVP fixed fee applies once per order, even when multiple items use FVP.
- RV keeps current included protection behavior.
- DV remains data-capture only and keeps current legacy-compatible pricing behavior.
- Existing estimate snapshots stay frozen; they must not recalculate after the formula version changes.

## AS-IS / TO-BE Delta

| Case | AS-IS | TO-BE |
| --- | --- | --- |
| One FVP item | Declared value x rate + fixed fee | Same result |
| Two or more FVP items | Fixed fee charged per FVP item | Declared values summed; one fixed fee charged per order |
| RV only | Included protection | No change |
| DV | Legacy-compatible data capture | No new price logic |

Example with active test assumptions: rate `2.5%`, fixed fee `$15`.

```text
Item A FVP declared value: $1,000
Item B FVP declared value: $500

AS-IS protection cost = ($1,000 x 2.5% + $15) + ($500 x 2.5% + $15) = $67.50
TO-BE protection cost = ($1,500 x 2.5%) + $15 = $52.50
```

The final customer price delta must be verified through the full engine because protection is included in the current operational cost and margin path.

## Inputs, Variables, References, Outputs

| Type | Contract |
| --- | --- |
| Input | `items[].protectionPlan`, `items[].declaredValue` |
| Compatibility input | Legacy `items[].insurance`: `Basic Liability` maps to RV; `Full Coverage` maps to FVP |
| Runtime variables | `protectionPlans["Full Coverage"].rate`, `protectionPlans["Full Coverage"].fixedFee` |
| Reference | Protection Plan configuration already exposed by the runtime variables layer |
| Output | `totals.insurance`, `totals.operationalCost`, `totals.rawPrice`, `totals.finalPrice` |
| Trace | `TBE-FEE-002` with selected plan, summed FVP declared value, rate, fixed fee, and final protection cost |
| Snapshot | `formulaVersion`, `variablesSnapshot`, item protection plans/declared values, frozen result |

## UAT Cases

| UAT ID | Scenario | Expected Result | Blocking |
| --- | --- | --- | --- |
| FVP-001 | Blank quote | Final price remains `$0` | Yes |
| FVP-002 | RV-only order | Protection cost remains `$0` | Yes |
| FVP-003 | One FVP item, declared value `$1,000` | Protection cost = `$40` with current test assumptions | Yes |
| FVP-004 | Two FVP items, declared values `$1,000` and `$500` | Protection cost = `$52.50`; fixed fee appears once | Yes |
| FVP-005 | FVP plus RV items | Only FVP declared value contributes to protection cost | Yes |
| FVP-006 | DV item with Item Ref. Price populated | Item Ref. Price does not affect protection cost | Yes |
| FVP-007 | Reopen estimate generated before Formula Sprint | Frozen snapshot preserves original protection value and formula version | Yes |
| FVP-008 | Load legacy `Full Coverage` draft | It maps to FVP without data loss | Yes |

## Implementation Boundaries

Allowed in the implementation step:

- Targeted change in `js/calculator.js` to aggregate FVP fixed fee at order level.
- Targeted compatibility mapping for legacy protection values.
- Add `TBE-FEE-002` to calculation contract trace and estimate snapshots.
- Add dedicated smoke coverage for the eight UAT cases.

Do not include:

- New DV pricing.
- ZIP coefficient, Direct, floor, labor-time, crate, discount, or capacity price formulas.
- Save Variables or governed variable editing.
- Changes to existing frozen estimate values.
- Rewriting the calculator or refactoring unrelated stage formulas.

## Readiness Gate

| Requirement | Status | Evidence |
| --- | --- | --- |
| Formula approved for Formula Sprint | Ready | `tobe_formula_master.csv`, `TBE-FEE-002` |
| Required broker inputs exist | Ready | Protection Plan quick options and Declared Value field |
| Runtime rate and fixed fee exist | Ready for test mode | `js/variables.js` protection plans |
| Legacy draft compatibility defined | Ready | Basic Liability -> RV; Full Coverage -> FVP |
| UAT examples defined | Ready | FVP-001 through FVP-008 above |
| Snapshot behavior defined | Ready | Existing frozen estimate contract |
| Production finance/legal values | Deferred | Current values remain test assumptions until governed approval |

## Rollback Rule

Do not replace or mutate existing estimates. If any blocking UAT case fails, revert only the `TBE-FEE-002` implementation commit and retain the current UAT-approved calculation baseline. New Formula Sprint estimates must carry a new `formulaVersion` and the runtime variable snapshot used for the calculation.

## Go / No-Go

**Go for controlled implementation:** completed in test mode.  
**Go for production pricing:** no, until finance/legal confirms the FVP rate, fixed fee, and customer wording.
