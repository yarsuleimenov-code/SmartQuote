# Cost Breakdown Output Audit

## Scope

CB-01 audit of fields available to the read-only admin Cost Breakdown. This document reflects the current AS-IS result and snapshot contracts. It does not authorize pricing formula changes.

## Available Outputs

| Area | Available fields | Source | Decision |
| --- | --- | --- | --- |
| Route | pickup zone, delivery zone, interstate distance, route support | calculator result | display |
| Items | volume, effective volume, total weight, warning, protection plan, item reference price | calculator result items | display |
| Vehicle | selected local vehicle, volume capacity, payload where present in the vehicle record | calculator result / snapshot | show selected vehicle; do not infer fit |
| Crew | pickup, delivery, item-required and overall crew | calculator result | display |
| Stages | pickup, interstate and delivery totals and component buckets | `result.stageBreakdown` | display and reconcile |
| Totals | operational cost, route cost, additional charges, margin, raw/final price, rounding delta | calculator result totals | display |
| Audit | formula version, variables snapshot/version, calculation timestamp, source draft | estimate snapshot | display through trace metadata |
| Warnings | current item/route/protection warnings and readiness contract | result + Warning Presentation | display |

## Missing Outputs

The current calculation result does not expose:

- shipment density;
- vehicle density threshold;
- volume utilization;
- payload utilization;
- limiting factor;
- selected pricing/cost basis;
- recommended vehicle;
- dimensional fit;
- door opening fit;
- equipment fit;
- Formula Sprint calculation trace rows.

These values must display as `Not available` until approved Formula Sprint outputs and reference data exist. The frontend must not derive them.

## Stage Reconciliation

Audit-only check:

```text
Pickup Stage Total
+ Interstate Stage Total
+ Delivery Stage Total
= Route Cost

Route Cost
+ Non-route Operational Cost
= Operational Cost
```

Tolerance: `$1.00`, because stage component values are stored as rounded display amounts.

The check explains existing outputs and does not participate in quote pricing.

## Snapshot Rule

- Draft review uses a live calculation with current runtime configuration.
- Estimate review uses the frozen `quote` and `result` saved in the estimate snapshot.
- Stored ZIP coverage metadata is preferred for frozen estimate warning presentation when available.
- Missing historical fields remain `Not available`; old estimates must not be recalculated to manufacture them.
