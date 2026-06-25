# Masterdata Normalization

## Status

Masterdata normalization is complete for Formula Sprint planning.

P0 formulas are treated as approved for implementation. Missing production data does not block test implementation when an explicit test assumption is documented.

## Normalized Registries

| Registry | Result |
| --- | ---: |
| Formula Registry | 225 Formula IDs |
| Canonical Variable Registry | 116 variables |
| Canonical Reference Registry | 40 references |
| Dependency Map | 545 links |
| Normalization Issues / Assumptions | 147 records |
| Formula Sprint Execution Steps | 12 steps |

Generated CSV registries:

- `docs/formula-spec/normalized/formula_registry.csv`
- `docs/formula-spec/normalized/variable_registry.csv`
- `docs/formula-spec/normalized/reference_registry.csv`
- `docs/formula-spec/normalized/dependency_map.csv`
- `docs/formula-spec/normalized/normalization_issues.csv`
- `docs/formula-spec/normalized/implementation_order.csv`

Review workbook:

- `outputs/masterdata-normalization/SmartQuote_Masterdata_Normalization.xlsx`

## Normalization Rules

- Keep all 225 Formula IDs for traceability.
- Related or overlapping formulas are linked, not deleted.
- When AS-IS and TO-BE variables use the same normalized business name, the TO-BE ID is canonical and the AS-IS ID remains an alias.
- The same canonical/alias rule applies to references.
- `TBD` or missing business data is never converted into an approved production value.
- Tests may use documented example values, zero, or current local reference seeds when the assumption is explicitly recorded.
- `js/calculator.js` and active pricing formulas are unchanged during normalization.

## Confirmed Duplicate / Alias Groups

Variables:

- `marginRate`
- `brokerFeeRate`
- `managementFee`
- `brokerCommissionRate`

References:

- `ZIP Dictionary`
- `Protection Plans`

Formula overlaps remain separate because Formula IDs are part of the audit and trace contract.

## Remaining Risks

- Automatic exact-name mapping does not resolve every semantic formula dependency.
- Production owners and sources are still required for several TO-BE references.
- Some variables still use example or TBD values.
- Formula Sprint tests can proceed with assumptions, but production activation requires governed values and reference versions.

## Recommended Next Step

Start Formula Sprint Foundation:

1. Create a calculation input/output contract independent from UI state.
2. Add formula and reference version metadata to the calculation result.
3. Create a trace collector that accepts normalized Formula IDs.
4. Keep current pricing outputs unchanged during the foundation slice.
5. Add the first TO-BE calculation block only after foundation regression tests pass.
