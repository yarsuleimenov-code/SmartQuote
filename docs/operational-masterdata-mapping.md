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

## Data Readiness

`Ready` means a current data source exists in the MVP. `Test Assumption` means the formula is approved for test-mode work but still requires governed operational data before production pricing activation.
