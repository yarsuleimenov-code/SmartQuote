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

### UI-06: Governed Variables

**Priority:** P1

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

After ZIP data cleanup and ownership approval, add:

- ZIP search;
- service area;
- zone class;
- active/inactive state;
- manual override;
- audit note.

Map editing and bulk geographic tooling remain separate from the broker calculator.

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
