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

## Second TO-BE Contract Slice

Item Handling / Crew Feasibility is now emitted as a contract-only output:

- `calculationContract.itemHandlingFeasibility`.

This slice records max single-item weight, weight class, total pieces, heavy piece count, one-person eligibility, required crew from current item rules, hard access constraints, per-item handling complexity factors, and crew-review readiness.

Business rule for this slice:

- no pricing formula changes;
- current AS-IS `crewNeed` remains the only value used by the baseline calculator;
- handling score and crew review are audit/readiness outputs only;
- hard access constraints are captured for future labor logic but do not change price.

## Third TO-BE Contract Slice

Capacity / Vehicle Fit is now emitted as a contract-only output:

- `calculationContract.capacityVehicleFit`.

This slice records the selected vehicle snapshot, recommended vehicle by current volume/payload capacity, total physical volume, total effective volume, total weight, vehicle utilization, payload utilization, shipment density, vehicle density capacity, limiting capacity factor, capacity constraint type, and capacity fit warnings.

Business rule for this slice:

- no pricing formula changes;
- volume fit and payload fit use existing vehicle capacity and payload data;
- dimensional fit, door opening fit, and equipment fit are marked `not_available` until governed vehicle body specs exist;
- vehicle recommendation is audit/readiness data only and does not recalculate price.

## Snapshot Behavior

New estimate snapshots use `snapshotVersion: 2` and preserve `calculationContract`.

Old snapshots remain readable because all new fields are additive and optional.

## Safeguards

- `js/calculator.js` is unchanged.
- Pricing formulas, rates, fuel logic, and vehicle logic are unchanged.
- Regression tests compare baseline and wrapped totals.
- Blank quotes remain zero.

## Next Formula Sprint Slice

Next recommended Formula Sprint slice: expose contract-only outputs in Cost Breakdown Formula Trace / Capacity Analysis, or add labor-time architecture outputs behind the contract. Do not enable price impact until business review approves the next formula block.
