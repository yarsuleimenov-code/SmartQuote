# Zaberman Broker Calculator MVP — Operational Edge Cases

## 1. Purpose

Документ описывает нестандартные operational и pricing scenarios системы.

Цель:
- подготовить систему к real-world operations;
- снизить количество manual overrides;
- предотвратить pricing inconsistencies;
- зафиксировать expected system behavior;
- подготовить future QA coverage.

---

# 2. Core Principle

Edge case не должен:
- ломать workflow;
- silently изменять pricing;
- bypass auditability;
- bypass snapshot logic.

Система должна:
- фиксировать issue;
- сохранять consistency;
- поддерживать manual review flow.

---

# 3. Pricing Edge Cases

## Case 01 — Missing Item Dimensions

### Scenario

Broker не указал dimensions item.

---

### Risk

```text
Incorrect volume calculation
↓
Incorrect vehicle fit
↓
Incorrect pricing
```

---

### Expected Behavior

```text
Manual Review Required
```

Система должна:
- блокировать final estimate;
- подсветить missing dimensions;
- не выполнять automatic vehicle fit.

---

# 4. Oversized Item

## Case 02 — Oversized Item

### Scenario

Item exceeds standard vehicle dimensions.

---

### Risk

```text
Item physically does not fit vehicle
```

---

### Expected Behavior

Система должна:
- пометить oversized cargo;
- требовать manual review;
- запретить automatic estimate generation.

---

# 5. Overweight Item

## Case 03 — Unsafe Handling Weight

### Scenario

Item exceeds safe lifting threshold.

---

### Risk

```text
Crew safety issue
Operational failure
Damage risk
```

---

### Expected Behavior

Система должна:
- применить Heavy Handling logic;
- увеличить labor complexity;
- показать warning;
- поддерживать manual approval flow.

---

# 6. Zero or Invalid Volume

## Case 04 — Invalid Dimensions

### Scenario

One or more dimensions:
- zero;
- negative;
- unrealistic.

---

### Expected Behavior

Система должна:
- блокировать calculations;
- требовать correction;
- записывать validation error.

---

# 7. Vehicle Overflow

## Case 05 — Shipment Exceeds Vehicle Capacity

### Scenario

Shipment does not fit selected vehicle.

---

### Expected Behavior

Система должна:
- автоматически выбрать larger vehicle;
- либо включить multi-vehicle logic;
- пересчитать operational cost.

---

# 8. Multi-Vehicle Edge Case

## Case 06 — Shipment Exceeds Largest Vehicle

### Scenario

Shipment exceeds single largest vehicle.

---

### Expected Behavior

Система должна:

```text
Split shipment
↓
Assign multiple vehicles
↓
Recalculate operational cost
```

---

# 9. Fragile + Non-Stackable Conflict

## Case 07 — Multiple Constraints

### Scenario

Item одновременно:
- fragile;
- non-stackable;
- crated.

---

### Risk

```text
Effective Volume explosion
Incorrect stacking logic
```

---

### Expected Behavior

Система должна:
- применять highest applicable constraint;
- избегать duplicate coefficients;
- логировать applied constraints.

---

# 10. Crate Without Dimensions

## Case 08 — Missing Crate Parameters

### Scenario

Crated item without crate dimensions.

---

### Expected Behavior

Система должна:
- использовать fallback crating rules;
- пометить estimate как review required;
- сохранять audit note.

---

# 11. Pickup Partially Completed

## Case 09 — Partial Pickup

### Scenario

Часть items picked up.
Часть осталась.

---

### Expected Behavior

Система должна:
- поддерживать item-level statuses;
- фиксировать missing items;
- разрешать partial pickup completion.

---

# 12. Delivery Partially Completed

## Case 10 — Partial Delivery

### Scenario

Доставлены не все items.

---

### Expected Behavior

Система должна:
- разделять delivered / missing items;
- сохранять item-level POD;
- поддерживать follow-up delivery workflow.

---

# 13. Customer Unavailable

## Case 11 — Delivery Failed

### Scenario

Customer unavailable during delivery.

---

### Expected Behavior

Система должна:
- фиксировать failed delivery;
- создавать operational exception;
- поддерживать rescheduling;
- фиксировать additional operational cost separately.

---

# 14. Customer Refuses Delivery

## Case 12 — Delivery Refused

### Scenario

Customer refuses item acceptance.

---

### Expected Behavior

Система должна:
- фиксировать refusal reason;
- сохранять photos;
- сохранять signature/refusal evidence;
- переводить order в exception workflow.

---

# 15. Damage Found at Pickup

## Case 13 — Pre-Existing Damage

### Scenario

Damage discovered during pickup.

---

### Expected Behavior

Система должна:
- сохранять pickup damage photos;
- сохранять timestamp;
- сохранять crew comments;
- помечать item before transit.

---

# 16. Damage Found at Delivery

## Case 14 — Delivery Damage

### Scenario

Damage discovered during delivery.

---

### Expected Behavior

Система должна:
- фиксировать delivery damage;
- запускать claim workflow;
- сохранять photos;
- сохранять signatures/comments.

---

# 17. Missing Pickup Photos

## Case 15 — Pickup Completed Without Photos

### Scenario

Pickup marked completed without required photos.

---

### Expected Behavior

Система должна:
- выдавать warning;
- поддерживать incomplete operational status;
- блокировать final eBOL generation if required.

---

# 18. Missing Delivery Signature

## Case 16 — Delivery Without Signature

### Scenario

Delivery completed without customer signature.

---

### Expected Behavior

Система должна:
- фиксировать missing signature;
- требовать operational comment;
- помечать POD as incomplete.

---

# 19. Estimate Changed After Sending

## Case 17 — Sent Estimate Modified

### Scenario

Broker edits estimate after sending.

---

### Expected Behavior

Система должна:
- создавать new estimate version;
- сохранять old estimate snapshot;
- не изменять historical estimate.

---

# 20. Variables Changed After Approval

## Case 18 — Variables Updated

### Scenario

Admin updates pricing variables after estimate approval.

---

### Expected Behavior

Approved estimate:
- не пересчитывается;
- сохраняет old variables snapshot;
- сохраняет original formula version.

---

# 21. Route Changed After Estimate

## Case 19 — Route Modification

### Scenario

Pickup or delivery address changed after estimate generation.

---

### Expected Behavior

Система должна:
- требовать recalculation;
- создавать new estimate version;
- сохранять audit history.

---

# 22. Storage Added After Pickup

## Case 20 — Unexpected Storage

### Scenario

Order moved into warehouse after pickup.

---

### Expected Behavior

Система должна:
- запускать storage workflow;
- фиксировать storage dates;
- фиксировать additional charges separately.

---

# 23. Duplicate Items

## Case 21 — Duplicate Item Entry

### Scenario

Broker accidentally duplicates item.

---

### Expected Behavior

Система должна:
- предупреждать possible duplicate;
- поддерживать merge/review flow.

---

# 24. AAA Fuel API Failure

## Case 22 — Fuel API Unavailable

### Scenario

AAA fuel API unavailable.

---

### Expected Behavior

Система должна:
- использовать last known fuel price;
- сохранять timestamp;
- логировать API failure.

---

# 25. Maps API Failure

## Case 23 — Distance Calculation Failed

### Scenario

Distance API unavailable.

---

### Expected Behavior

Система должна:
- блокировать automatic route pricing;
- переводить quote в manual review.

---

# 26. Payment Failure

## Case 24 — Payment Declined

### Scenario

Stripe/Square payment failed.

---

### Expected Behavior

Система должна:
- сохранять unpaid status;
- логировать payment failure;
- разрешать retry.

---

# 27. Email / SMS Failure

## Case 25 — Estimate Delivery Failed

### Scenario

Estimate email or SMS failed.

---

### Expected Behavior

Система должна:
- сохранять delivery attempt;
- логировать failure;
- разрешать resend.

---

# 28. eBOL Generation Failure

## Case 26 — Missing Operational Data

### Scenario

Not enough operational data to generate eBOL.

---

### Expected Behavior

Система должна:
- показывать incomplete workflow;
- блокировать final eBOL generation;
- показывать missing requirements.

---

# 29. Snapshot Integrity Rule

## Critical Rule

```text
Historical estimate must never change
after estimate generation.
```

---

# 30. Operational Integrity Rule

## Critical Rule

```text
Orders and eBOL
must not recalculate pricing.
```

---

# 31. Validation Integrity Rule

## Critical Rule

```text
Invalid operational data
must trigger review workflow,
not silent fallback logic.
```

---

# 32. Future Expansion

Future edge-case coverage:
- warehouse transfer chains;
- split delivery routes;
- multiple crews;
- route interruption;
- weather disruption;
- failed storage release;
- customer claim escalation;
- barcode mismatch;
- offline mobile sync conflicts.
