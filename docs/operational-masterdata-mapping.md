# Operational Masterdata Mapping

## Purpose

Map every normalized Formula Sprint variable and reference to a concise operational screen without creating a second pricing source of truth.

## Screen Rules

- **Variables:** `Variable ID | Name | Active Value | Unit`; active values render as gray, blue-text read-only cells.
- **References:** compact business lookup tables on one open screen; operational values render as gray, blue-text read-only cells.
- Formula dependencies, raw payloads, Current/Proposed comparisons, and technical audit details stay outside these operational screens.
- Existing estimates remain governed by frozen snapshots; this mapping does not activate or change pricing.

## Coverage

| Registry | Count | Operational Screen |
| --- | ---: | --- |
| Canonical Variables | 116 | Variables |
| Canonical References | 40 | References |

The machine-readable mapping is generated in `docs/operational-masterdata-mapping.csv` from the normalized registries. Regenerate both the mapping and `js/operationalMasterdata.js` with:

```powershell
node tools/build_operational_masterdata.js
```

## Variables Sections

1. Pricing and Margin
2. Labor and Time
3. Access and Service
4. Item Handling
5. Capacity and Vehicle Economics
6. Protection, Storage and Packaging
7. Warnings and Approval

## Variables Screen Audit

The normalized registry retains all 116 variables for Formula Trace and Formula Sprint governance. The operational Variables screen shows 52 business-owned values:

- 27 active AS-IS calculation inputs;
- 3 active compatibility values: margin, broker fee, and management fee;
- 1 approved compensation value: broker commission.
- 22 primary labor, handling, access, and time inputs retained for business discussion and approval, including minutes per cubic foot, minutes per pound, pickup and delivery time coefficients, and free floor count.

The remaining 64 records are intentionally hidden from the operational screen because they are future Formula Sprint inputs, derived outputs, vehicle/reference-owned attributes, duplicate aliases, rule sets, or governance-only controls. This includes vehicle dimensions and door openings, which are maintained in References -> Vehicles. `Stairs Fee Per Billable Floor` is hidden because it duplicates the active `Stairs Fee Per Floor` input. Fuel prices are maintained in References -> Fuel Prices; `Dispatcher Payout Rate` is deferred because the current quote uses the active `Dispatch Fee` input instead.

Current approved values captured without changing formula logic: Direct Fixed Fee `$300`, Pickup Time Coefficient `1.0`, Delivery Time Coefficient `0.8`, Free Floor Count `3`, and COI Fee `$35`. Only COI is already used by the AS-IS calculator when the COI option is selected; the other new values remain capture/governance values until their Formula Sprint contracts are activated.

### Pickup Time Curve Contract

The operational screen does not expose technical `Loading Formula A` and `Loading Formula B`. It exposes the business control points of the current AS-IS pickup curve instead:

| Variable | Active Value |
| --- | ---: |
| Pickup Curve Anchor Volume | 35 cu ft |
| Pickup Curve Anchor Time | 40 min |
| Pickup Curve Transition Volume | 80 cu ft |
| Pickup Curve Transition Time | 73.13 min |
| Pickup Time After Transition | 0.5 min/cu ft |
| Minimum Pickup Loading Time | 40 min |

The calculator continues to use legacy A/B constants internally for UAT compatibility. Future governed editing of the business control points must translate them to the legacy curve constants, or migrate the Formula Sprint contract with benchmark validation.

`Repair Cost Per cu ft` and `Repair Cost Per lb` are not vehicle depreciation. They are the current AS-IS damage/repair surcharge rates. `FINAL-001` applies the selected volume or weight model amount to the matching rate; the result is included in service cost by `FINAL-002` and therefore affects the final quote.

## References Sections

1. Route and Coverage
2. Vehicles
3. Items and Handling
4. Services
5. People and Operations
6. Quality and Control

## Operational Visibility

The mapping retains all 40 normalized references for Formula Sprint traceability. The operational References screen intentionally hides system registries, formula audit data, aliases, and workflow schemas when they do not provide daily operational value.

Examples of hidden or merged system references:

- ZIP Dictionary, Zone Normalization, Route Engine, Manual ZIP Override Register;
- Quote Draft item row and Quick Quote transfer schemas;
- duplicate Items Catalog and Vehicles aliases;
- Packaging Time and Crate Labor standalone registries, which are merged into Packaging Rates and Crate Materials/Labor;
- Formula Constants Audit and Formula Version Registry.

Vehicle body specifications are merged into the Vehicles table. The current dimensions are test assumptions and must be validated against the actual fleet before dimensional fit affects pricing or approval.

Broker commission and dispatcher payout are maintained as Variables, not References: `4%` of order margin and `$4` per closed order. They remain outside active quote pricing.

## Data Readiness

`Ready` means a current data source exists in the MVP. `Test Assumption` means the formula is approved for test-mode work but still requires governed operational data before production pricing activation.
