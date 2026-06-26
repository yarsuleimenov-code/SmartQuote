# Formula Sprint Foundation

## Goal

Provide a versioned calculation input/output contract and normalized Formula ID trace around the UAT-approved calculator without changing quote prices.

## Runtime Contract

`js/calculationContract.js` wraps `PricingCalculator.calculateQuote` after `js/calculator.js` loads.

The original calculation function remains available as:

- `PricingCalculator.calculateQuoteBaseline`

The wrapped function:

1. clones and normalizes the quote payload;
2. executes the existing baseline calculator;
3. preserves all existing result fields and numeric outputs;
4. adds `result.calculationContract`.

## Contract Metadata

`calculationContract` contains:

- `contractVersion`;
- `traceVersion`;
- `calculatedAt`;
- `formulaVersion`;
- `variablesVersion`;
- `referenceVersions`;
- `normalizedInput`;
- `trace`.

Current versions:

- contract: `smartquote-calculation-v1`;
- trace: `normalized-formula-trace-v1`.

## Formula Trace

The foundation trace uses Formula IDs from normalized masterdata and records the output path and value for:

- normalized order inputs;
- route classification;
- pickup, interstate, and delivery stage totals;
- route cost;
- raw price;
- final rounded price.

The trace is an audit structure. It does not execute new TO-BE formulas.

## First TO-BE Contract Slice

Normalized Order Inputs and Route Classification are now emitted as contract-only outputs:

- `calculationContract.normalizedOrderInputs`;
- `calculationContract.routeClassification`.

This slice records normalized customer/order fields, ZIPs, service/direct flags, access capture, item rows, route type, ZIP coverage readiness, distance source, and captured ZIP coefficients.

Business rule for this slice:

- no pricing formula changes;
- ZIP coefficients are captured but `priceImpactActive = false`;
- Direct / specific-date service is classified for review but does not recalculate miles or price;
- coverage `Excluded` / `Review` remains readiness/audit data only.

The original price remains produced by `PricingCalculator.calculateQuoteBaseline`.

## Snapshot Behavior

New estimate snapshots use `snapshotVersion: 2` and preserve `calculationContract`.

Old snapshots remain readable because all new fields are additive and optional.

## Safeguards

- `js/calculator.js` is unchanged.
- Pricing formulas, rates, fuel logic, and vehicle logic are unchanged.
- Regression tests compare baseline and wrapped totals.
- Blank quotes remain zero.

## Next Formula Sprint Slice

Next recommended Formula Sprint slice: add item handling / crew feasibility outputs behind the contract, still comparing against the baseline before enabling any price impact.
