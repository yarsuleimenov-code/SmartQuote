# Calculator Meeting UI Sprint Plan

## Source

- Meeting: `Calculator meeting`
- Date: June 19, 2026
- Participants: Alexander Sidorov, Yaroslav Suleimenov
- Fireflies transcript: https://app.fireflies.ai/view/01KV7TJK079PV1HKMJYQPBDXXG

## Goal

Improve broker confidence and admin explainability without exposing formula complexity or implementing unapproved TO-BE pricing rules.

The UI must:

- prevent unrealistic or incomplete quotes;
- explain why a quote requires review;
- show the limiting vehicle/capacity factor;
- keep Formula, Variable, Reference, Input, and Output concepts visually distinct;
- preserve the current UAT-approved calculation baseline until Formula Sprint approval.

## Scope Boundary

This plan covers UI and presentation contracts only.

It does not authorize:

- changes to `js/calculator.js`;
- capacity/density formula implementation;
- new labor coefficients;
- ZIP pricing;
- manager approval backend/permissions;
- active Save Variables;
- TO-BE Formula Sprint implementation.

## Sprint Order

### UI-01: Warning Contract

**Priority:** P0

**Status:** Implemented as a frontend presentation contract.

Define a shared warning model before changing screens:

- warning ID;
- severity: `Info`, `Warning`, `Approval Required`, `Blocking`;
- affected field/item/stage;
- actual value;
- allowed value or threshold;
- broker message;
- recommended action;
- approval role;
- whether estimate generation is blocked.

**Definition of done:**

- warning contract is documented;
- current warnings can map to the contract without changing pricing formulas;
- blocking behavior is not enabled until approval policy is confirmed.

### UI-02: Quote Readiness and Warning Center

**Priority:** P0

**Status:** Implemented for current AS-IS warnings. Blocking enforcement remains disabled.

Add a compact readiness state to Quote Draft:

- `Ready`;
- `Review Required`;
- `Blocked`.

Show warning cards with:

- severity;
- reason;
- affected item or route;
- recommended action.

Use field-level highlighting for invalid dimensions, unsupported ZIP, missing declared value, or vehicle-fit problems.

**Broker actions:**

- Correct Input;
- Change Vehicle when supported;
- Request Manager Approval when the approval workflow exists.

**Definition of done:**

- broker can identify the problem without opening Cost Breakdown;
- customer estimate generation can later be blocked by the same warning contract;
- no formula change is introduced.

### UI-03: Vehicle Fit and Capacity Summary

**Priority:** P0

**Status:** Output contract documented. UI implementation waits for approved Formula Sprint outputs.

Do not give the broker a manual `Weight / Volume` pricing selector.

Show a read-only summary:

```text
Vehicle Fit: Ready / Review Required / Blocked
Volume Utilization: %
Payload Utilization: %
Limiting Factor: Volume / Weight
Recommended Vehicle: name
```

Detailed fit dimensions:

- cargo interior fit;
- door opening fit;
- volume fit;
- payload fit;
- equipment fit.

**Definition of done:**

- UI consumes a defined output contract;
- missing TO-BE outputs display `Not available` rather than inferred values;
- the current calculation remains unchanged.

### UI-04: Capacity Analysis in Cost Breakdown

**Priority:** P1

Add an admin-facing explanation block:

- shipment density;
- vehicle density threshold;
- volume utilization;
- payload utilization;
- limiting factor;
- selected cost basis;
- selected/recommended vehicle;
- warning status.

Formula details remain read-only.

**Dependency:** approved capacity output and trace contracts.

### UI-05: Formula Trace Visualization

**Priority:** P1

Display Formula Sprint trace rows using:

- Formula ID;
- calculation block;
- input;
- input source;
- variable/reference used;
- readable formula;
- result;
- next destination;
- approval/readiness status.

Visual roles:

- manual input: neutral/white;
- variable: blue;
- reference: green;
- calculated output: gray;
- missing approval: amber;
- blocker: red.

**Dependency:** Formula ID registry and trace output.

## Nearest Implementation Plan: Cost Breakdown

### Goal

Turn Cost Breakdown into a read-only admin explanation and validation screen while keeping Quote Draft compact and preserving the UAT-approved pricing baseline.

### Scope

#### CB-01: Existing Output Audit

**Priority:** P0

**Status:** Completed. See `docs/cost-breakdown-output-audit.md`.

- inventory the fields already available in saved drafts, estimate snapshots, and calculator results;
- verify that pickup, interstate, and delivery stage totals reconcile with Route Cost, then reconcile Route Cost plus non-route operational components with Operational Cost;
- identify unavailable capacity, vehicle-fit, warning, and formula-trace fields;
- do not derive missing TO-BE values in the frontend.

**Definition of done:**

- available and missing fields are documented;
- existing stage totals are checked against current output;
- no pricing formula is changed.

#### CB-02: Capacity Analysis Shell

**Priority:** P1

**Status:** Implemented with the selected AS-IS vehicle and explicit `Not available` states for missing Formula Sprint outputs.

Add an admin-facing block for:

- shipment density;
- vehicle density threshold;
- volume utilization;
- payload utilization;
- limiting factor;
- selected cost basis;
- selected and recommended vehicle;
- vehicle-fit and warning status.

Use reliable existing outputs where available. Display `Not available` for values that require Formula Sprint outputs.

**Definition of done:**

- the block is read-only;
- unavailable data is explicit;
- no manual Weight / Volume selector exists;
- the block does not affect quote totals.

#### CB-03: Warning and Readiness Details

**Priority:** P1

**Status:** Implemented using the shared Warning Presentation contract. Approval and blocking enforcement remain disabled.

Show normalized admin warning details:

- severity;
- affected item, address, or route stage;
- actual value;
- threshold or allowed value;
- recommended action;
- approval owner and status when available.

**Definition of done:**

- warnings reuse the shared warning contract;
- no unsupported blocking or approval workflow is introduced;
- warning details remain separate from customer-facing estimate content.

#### CB-04: Vehicle Fit Details

**Priority:** P1

**Status:** Read-only shell implemented. Detailed fit values remain `Not available` until vehicle body references and approved outputs exist.

Show:

- cargo interior fit;
- door opening fit;
- volume fit;
- payload fit;
- equipment fit.

**Definition of done:**

- the UI consumes approved output fields only;
- missing body/reference data displays `Not available`;
- the frontend does not infer dimensional fit.

#### CB-05: Formula Trace

**Priority:** P1, blocked until Formula Sprint trace output is approved.

**Status:** Existing AS-IS stage/final outputs are traced read-only. Capacity and fit trace rows remain visibly blocked rather than inferred.

Display:

- Formula ID;
- calculation block;
- input and source;
- variable or reference;
- readable formula;
- result;
- next destination;
- approval/readiness status.

Use the defined visual roles for inputs, variables, references, outputs, approvals, and blockers.

**Definition of done:**

- trace is read-only;
- every displayed result has an explicit source;
- Formula Trace is not implemented from guessed or duplicated frontend formulas.

### Implementation Order

1. Complete CB-01 and document available output fields.
2. Implement CB-02 with existing values and explicit `Not available` states.
3. Connect CB-03 to the current warning presentation contract.
4. Implement CB-04 after vehicle body and fit outputs are approved.
5. Implement CB-05 only after the Formula ID registry and trace contract are available.
6. Run stage-total reconciliation, snapshot recovery, and visual admin QA.

### Out of Scope

- changes to `js/calculator.js` or pricing formulas;
- manual selection of Weight / Volume pricing basis;
- formula editing;
- manager approval backend or permissions;
- ZIP coefficient pricing;
- Save Variables or direct reference activation;
- customer-facing exposure of margin, operational cost, or formula internals.

### Risks and Safeguards

- Capacity and fit values may be unavailable before Formula Sprint; show `Not available`.
- Stage components must not be presented as independent pricing formulas if they are only explanatory allocations.
- Frozen estimates must use snapshot values and must not recalculate against current variables.
- Each implementation slice must pass current calculator/workflow smoke tests and `git diff --check`.

### UI-06: Governed Variables

**Priority:** P1

**Status:** Runtime-driven single-value screen retained. Proposed-value comparison was rejected as unnecessary complexity.

Keep the current Variables screen read-only until governance exists.

Future flow:

```text
Edit
-> Preview Impact
-> Request Approval
-> Activate Version
```

Show:

- current value;
- proposed value;
- owner;
- version/effective date;
- benchmark price delta;
- approval status.

Do not enable direct Save Variables.

Current MVP rule:

- show one active runtime value for each variable used by calculation;
- do not duplicate Current / Proposed values on the operational Variables screen;
- keep non-calculation constants and reference entities outside this screen;
- keep Save Variables disabled until controlled editing/version activation is approved;
- if price analytics is needed later, implement it as a separate analytical screen rather than making it a second source of truth.

### UI-07: Governed References

**Priority:** P1

Prepare structured admin views for:

- Vehicles and body specifications;
- ZIP Dictionary;
- Service Areas;
- Labor Rates;
- Packaging / Crate Materials;
- Protection Plans;
- Warning Rules.

Vehicle fields should eventually include interior dimensions, door opening, payload, capacity, equipment, and active status.

### UI-08: ZIP and Service Area Management

**Priority:** P2

**Status:** Active test coverage directory implemented. Shared governance and pricing impact remain deferred.

After ZIP data cleanup and ownership approval, add:

- ZIP search;
- service area;
- zone class;
- active/inactive state;
- manual override;
- audit note.

Map editing and bulk geographic tooling remain separate from the broker calculator.

Current read-only slice:

- loads the approved `zone_zip_map` coverage dataset from `coverage_zip_route_zone_map.xlsx`;
- supports ZIP prefix search and zone filtering;
- shows region, assigned zone, ZIP coefficient, and coverage status;
- coverage status can be set to Covered, Excluded, or Review and is saved locally;
- all ZIP coefficients default to `1.00`; local capture supports `0.50-2.00`;
- the workbook's 2,607 ZIPs are the active test coverage map;
- Excluded and Review statuses create non-blocking broker warnings;
- ZIP coefficients do not change current pricing formulas.

### UI-09: Benchmark Impact Preview

**Priority:** P2

Before governed variable/reference activation, show:

- benchmark case;
- current price;
- proposed price;
- absolute delta;
- percentage delta;
- pass/review/block status.

## Dependencies and Blockers

| UI block | Required dependency |
| --- | --- |
| Warning Center | Warning severity and approval policy |
| Vehicle Fit Summary | Vehicle-fit output contract and body references |
| Capacity Analysis | Approved capacity/density outputs |
| Formula Trace | Formula ID registry and trace contract |
| Manager Approval | Shared storage, roles, audit events |
| Variables Editing | Preview/versioning/approval governance |
| ZIP Management | Clean ZIP source of truth and data owner |

## Recommended First Implementation Slice

1. Document Warning UI Contract.
2. Document Vehicle Fit / Capacity Output Contract.
3. Map current AS-IS warnings to the new UI contract.
4. Add presentation-only readiness states using existing outputs where reliable.
5. Do not infer or calculate missing TO-BE values in the frontend.

## Acceptance Criteria

- Quote Draft remains compact and broker-focused.
- Broker sees the reason and next action for every surfaced warning.
- Weight/volume basis is system-selected, never broker-selected.
- Cost Breakdown carries technical detail.
- Variables and References remain governed admin surfaces.
- No unapproved TO-BE value is presented as an active price component.
- `js/calculator.js` and pricing formulas remain unchanged until Formula Sprint approval.
