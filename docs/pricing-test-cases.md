# Zaberman Broker Calculator MVP — Pricing Test Cases

## 1. Purpose

Документ фиксирует expected pricing behavior системы.

Цель:
- валидировать pricing engine;
- зафиксировать expected outputs;
- исключить неоднозначность formulas;
- подготовить QA scenarios;
- согласовать pricing logic между BA, CEO и development.

---

# 2. Core Validation Principle

Каждый test case должен содержать:

```text
Input
↓
Calculation Logic
↓
Expected Breakdown
↓
Expected Final Price
```

---

# 3. Pricing Structure Rules

## Operational Cost Includes

```text
Pickup Cost
Interstate Cost
Delivery Cost
```

---

## Additional Charges Includes

```text
Packaging
Crating
Storage
Insurance
Exclusive Delivery
Access Fees
Zone Fees
```

---

## Margin Rule

```text
Margin applies AFTER:
Operational Cost
+
Additional Charges
```

---

## Final Price Rule

```text
Rounded Final Price =
CEILING(
Raw Final Price,
Rounding Rule
)
```

---

# 4. Test Case Structure

Каждый кейс содержит:
- scenario;
- input data;
- expected calculation behavior;
- expected breakdown;
- expected final price.

---

# 5. Base Pricing Cases

## Case 01 — Standard Furniture Delivery

### Scenario

Стандартный sofa delivery без fragile logic.

---

### Input

```text
Item:
Sofa

Dimensions:
84 × 36 × 34 in

Weight:
180 lb

Quantity:
1

Packaging:
Blanket Wrap

Fragile:
No

Non-Stackable:
No

Crated:
No

Distance:
145 miles

Vehicle:
Sprinter

Storage:
No

Exclusive Delivery:
No
```

---

### Expected Logic

```text
Physical Volume calculated
↓
Effective Volume = Physical Volume
↓
Sprinter selected
↓
Operational Cost calculated
↓
Packaging added
↓
Margin added
↓
Rounded Final Price
```

---

### Expected Breakdown

```text
Operational Cost > 0
Packaging Cost > 0
Storage Cost = 0
Insurance Fee = 0
```

---

### Expected Result

```text
Single vehicle
No manual review
Rounded price
```

---

# 6. Stackability Cases

## Case 02 — Fragile Item

### Scenario

Fragile marble table.

---

### Input

```text
Item:
Marble Dining Table

Fragile:
Yes

Non-Stackable:
No

Crated:
No
```

---

### Expected Logic

```text
Fragile coefficient applied
↓
Effective Volume increased
↓
Handling complexity increased
```

---

### Expected Result

```text
Effective Volume > Physical Volume
Operational Cost increases
```

---

## Case 03 — Non-Stackable Item

### Scenario

Tall antique cabinet.

---

### Input

```text
Non-Stackable:
Yes
```

---

### Expected Logic

```text
Air above item counted
↓
Effective Volume significantly increases
```

---

### Expected Result

```text
Vehicle fit may change
Operational cost increases
```

---

## Case 04 — Crated Item

### Scenario

Fragile sculpture with custom crate.

---

### Input

```text
Crated:
Yes
```

---

### Expected Logic

```text
Crate Cost calculated
↓
Crate increases Effective Volume
↓
Crate may apply non-stackable logic
```

---

### Expected Breakdown

```text
Crate Cost > 0
Packaging Cost may exist separately
```

---

# 7. Vehicle Fit Cases

## Case 05 — Sprinter Fit

### Scenario

Shipment fits inside single Sprinter.

---

### Expected Result

```text
1 vehicle selected
Vehicle = Sprinter
```

---

## Case 06 — Truck Fit

### Scenario

Shipment exceeds Sprinter capacity.

---

### Expected Result

```text
Truck selected automatically
```

---

## Case 07 — Multi-Vehicle Shipment

### Scenario

Shipment exceeds single truck capacity.

---

### Expected Logic

```text
Vehicle Count =
CEILING(
Total Effective Volume / Vehicle Capacity
)
```

---

### Expected Result

```text
Multiple vehicles assigned
Operational Cost increases
```

---

# 8. Access & Handling Cases

## Case 08 — Stairs Fee

### Scenario

Delivery to 5th floor without elevator.

---

### Expected Logic

```text
Stairs Fee =
(Floor - 3)
×
Stairs Rate
```

---

### Expected Result

```text
Additional Charges increase
```

---

## Case 09 — Long Carry

### Scenario

Truck cannot park near entrance.

---

### Input

```text
Long Carry:
120 ft
```

---

### Expected Result

```text
Long Carry Fee > 0
```

---

## Case 10 — Heavy Item Handling

### Scenario

Item exceeds safe one-person handling weight.

---

### Expected Result

```text
Heavy Handling Fee applied
```

---

# 9. Storage Cases

## Case 11 — Warehouse Storage

### Scenario

Shipment stored for 5 days.

---

### Expected Logic

```text
Storage Cost =
Storage Days
×
Storage Daily Rate
×
Effective Volume
```

---

### Expected Result

```text
Storage Cost > 0
```

---

# 10. Insurance Cases

## Case 12 — Basic Liability

### Scenario

Default insurance selected.

---

### Expected Logic

```text
Coverage =
Total Weight × $0.60
```

---

### Expected Result

```text
No Insurance Fee added
```

---

## Case 13 — Full Coverage

### Scenario

Customer selects Full Coverage.

---

### Expected Logic

```text
Insurance Fee =
Declared Value × Coverage Rate
```

---

### Expected Result

```text
Insurance Fee > 0
```

---

# 11. Discount Cases

## Case 14 — Shared Pickup Discount

### Scenario

Multiple orders from same pickup address.

---

### Expected Result

```text
Consolidation Discount applied
```

---

## Case 15 — Shared Delivery Discount

### Scenario

Multiple deliveries to same address.

---

### Expected Result

```text
Discount applied
```

---

## Case 16 — Shared Route Discount

### Scenario

Orders share same interstate route.

---

### Expected Result

```text
Interstate cost partially shared
```

---

# 12. Exclusive Delivery Cases

## Case 17 — Exclusive Delivery

### Scenario

Customer requests dedicated direct delivery.

---

### Expected Result

```text
Exclusive Delivery Fee > 0
Shared route logic disabled
```

---

# 13. NYC Operational Cases

## Case 18 — NYC Delivery

### Scenario

Delivery inside NYC operational zone.

---

### Expected Result

```text
Tolls added
Parking reserve added
Ticket reserve added
```

---

# 14. Packaging Cases

## Case 19 — Multiple Packaging Types

### Scenario

Order contains:
- TV Box
- Blanket Wrap
- Custom Crate

---

### Expected Result

```text
Packaging calculated per item
No fixed global packaging fee
```

---

# 15. Margin Cases

## Case 20 — Margin Validation

### Scenario

Validate margin calculation order.

---

### Expected Logic

```text
Margin applies AFTER:
Operational Cost
+
Additional Charges
```

---

### Invalid Logic

```text
Margin applied before additional charges
```

---

# 16. Rounding Cases

## Case 21 — Price Rounding

### Scenario

Raw price:
$1184

---

### Expected Result

```text
Rounded Final Price = $1190
```

---

# 17. Snapshot Integrity Cases

## Case 22 — Variables Changed After Estimate

### Scenario

Estimate generated.
Variables changed later.

---

### Expected Result

```text
Old estimate remains unchanged
```

---

## Case 23 — Formula Version Changed

### Scenario

Formula v1.0 used in estimate.
System switches to Formula v1.1.

---

### Expected Result

```text
Old estimate continues using Formula v1.0 snapshot
```

---

# 18. Operational Separation Cases

## Case 24 — Order Created

### Scenario

Estimate converted to Order.

---

### Expected Result

```text
Order uses frozen estimate snapshot
Pricing not recalculated
```

---

## Case 25 — eBOL Completed

### Scenario

Pickup and delivery completed.

---

### Expected Result

```text
eBOL generated automatically
Operational workflow completed
```

---

# 19. Critical Validation Rules

## Rule 1

```text
Operational Cost and Additional Charges
must not duplicate charges.
```

---

## Rule 2

```text
Breakdown must match final estimate price.
```

---

## Rule 3

```text
Effective Volume must affect:
- vehicle fit
- operational pricing
```

---

## Rule 4

```text
Packaging must calculate per item,
not per order.
```

---

## Rule 5

```text
Orders and eBOL must not recalculate pricing.
```

---

# 20. Future Test Expansion

Future test coverage:
- route optimization;
- warehouse transfers;
- dispatch scheduling;
- claim workflow;
- dynamic pricing;
- regional pricing;
- API failure handling;
- live fuel update edge cases;
- multi-stop routes;
- oversized cargo exceptions.
