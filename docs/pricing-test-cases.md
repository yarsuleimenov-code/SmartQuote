# Zaberman Broker Calculator MVP — Pricing Test Cases

# 1. Назначение документа

Документ фиксирует:
- expected pricing behavior;
- тестовые сценарии pricing engine;
- expected calculation outcomes;
- edge pricing logic;
- validation rules.

Документ используется для:
- QA;
- backend validation;
- pricing regression testing;
- business validation;
- formula verification.

---

# 2. Основные принципы тестирования

Pricing test cases должны проверять:

```text
Calculation Consistency
Explainable Pricing
Expected Workflow Behavior
Stable Rounding
Snapshot Integrity
Operational Logic
```

---

# 3. Общая структура test case

Каждый test case включает:

```text
Scenario
Input
Expected Behavior
Expected Result
Notes
```

---

# 4. Test Case — Standard Order

## Scenario

Обычный interstate order без operational complexity.

---

## Input

```text
Pickup ZIP: 11211
Delivery ZIP: 90021

Items:
1 Sofa
80 × 36 × 32
150 lb

Access:
House → House

No storage
No COI
No helper
```

---

## Expected Behavior

- standard route pricing;
- no access surcharge;
- standard labor logic;
- no helper logic;
- standard vehicle fit.

---

## Expected Result

```text
Standard interstate estimate
without additional operational complexity.
```

---

# 5. Test Case — Fragile Item

## Scenario

Fragile item должен увеличивать effective volume.

---

## Input

```text
Item:
Glass Table

Flags:
Fragile
Non-stackable
```

---

## Expected Behavior

- increased effective volume;
- increased handling complexity;
- possible vehicle upgrade;
- fragile handling surcharge.

---

## Expected Result

```text
Effective Volume >
Physical Volume
```

---

# 6. Test Case — Heavy Item

## Scenario

Heavy item должен влиять на crew requirement.

---

## Input

```text
Item:
Concrete Table

Weight:
500 lb
```

---

## Expected Behavior

- additional labor requirement;
- helper logic activated;
- increased operational labor cost.

---

## Expected Result

```text
Crew Requirement ≥ 2
```

---

# 7. Test Case — Oversized Item

## Scenario

Oversized item влияет на vehicle fit.

---

## Input

```text
Oversized dimensions
requiring special handling
```

---

## Expected Behavior

- larger vehicle requirement;
- increased operational complexity;
- route limitations possible.

---

## Expected Result

```text
Vehicle upgraded automatically.
```

---

# 8. Test Case — Warehouse Delivery

## Scenario

Warehouse delivery должна уменьшать labor complexity.

---

## Input

```text
Delivery Type:
Warehouse
```

---

## Expected Behavior

- reduced unloading complexity;
- reduced labor time;
- reduced access fees.

---

## Expected Result

```text
Operational cost lower
than apartment delivery.
```

---

# 9. Test Case — Old Apartment Without Elevator

## Scenario

Old apartment со stairs увеличивает operational cost.

---

## Input

```text
Address Type:
Old Apartment

Floor:
4

Elevator:
No
```

---

## Expected Behavior

- increased labor cost;
- increased handling complexity;
- helper logic possible;
- access surcharge applied.

---

## Expected Result

```text
Operational Cost >
standard apartment delivery.
```

---

# 10. Test Case — Long Carry

## Scenario

Long carry должен увеличивать handling cost.

---

## Input

```text
Long Carry:
75 ft
```

---

## Expected Behavior

- increased labor time;
- access surcharge applied.

---

## Expected Result

```text
Additional access fee applied.
```

---

# 11. Test Case — COI Required

## Scenario

COI requirement должна добавлять operational surcharge.

---

## Input

```text
COI Required:
Yes
```

---

## Expected Behavior

- COI fee applied;
- operational preparation complexity increased.

---

## Expected Result

```text
Additional COI charge added.
```

---

# 12. Test Case — Exclusive Delivery

## Scenario

Exclusive delivery должна влиять на route logic.

---

## Input

```text
Exclusive Delivery:
Yes
```

---

## Expected Behavior

- dedicated route logic;
- higher operational cost;
- reduced consolidation efficiency.

---

## Expected Result

```text
Final estimate >
standard consolidated route.
```

---

# 13. Test Case — Storage

## Scenario

Storage должен рассчитываться отдельно.

---

## Input

```text
Storage:
5 days
```

---

## Expected Behavior

- storage fee calculated separately;
- item-level storage supported.

---

## Expected Result

```text
Additional storage charges added.
```

---

# 14. Test Case — Packaging

## Scenario

Packaging должен рассчитываться per item.

---

## Input

```text
3 items
Packaging enabled
```

---

## Expected Behavior

- packaging cost multiplied by item quantity;
- not fixed per order.

---

## Expected Result

```text
Packaging charge =
per-item calculation.
```

---

# 15. Test Case — Mixed Order

## Scenario

Mixed order не должен применять fragile logic ко всему shipment.

---

## Input

```text
1 fragile item
+
9 regular boxes
```

---

## Expected Behavior

- fragile coefficient applied only to fragile item;
- standard logic for remaining items.

---

## Expected Result

```text
Selective item-level logic.
```

---

# 16. Test Case — Additional Helper

## Scenario

Additional helper должен учитывать minimum billable time.

---

## Input

```text
Extra Helper:
1
```

---

## Expected Behavior

- helper surcharge added;
- minimum 2 hours applied.

---

## Expected Result

```text
Helper Cost =
2-hour minimum.
```

---

# 17. Test Case — Vehicle Upgrade

## Scenario

Effective volume превышает vehicle capacity.

---

## Input

```text
Total Effective Volume >
Sprinter Capacity
```

---

## Expected Behavior

- automatic vehicle upgrade;
- operational cost recalculated.

---

## Expected Result

```text
Vehicle upgraded automatically.
```

---

# 18. Test Case — Rounding Logic

## Scenario

Final estimate должен округляться вверх.

---

## Input

```text
Raw Final Price:
$1123
```

---

## Expected Behavior

- ceiling rounding applied.

---

## Expected Result

:contentReference[oaicite:0]{index=0}

---

# 19. Test Case — Draft Recalculation

## Scenario

Draft должен пересчитываться динамически.

---

## Input

```text
Item quantity changed
```

---

## Expected Behavior

- pricing recalculated immediately;
- draft remains editable.

---

## Expected Result

```text
Updated pricing preview.
```

---

# 20. Test Case — Estimate Snapshot Integrity

## Scenario

Estimate не должен изменяться после variables update.

---

## Input

```text
Existing estimate
+
updated fuel variable
```

---

## Expected Behavior

- historical estimate unchanged;
- new estimate uses updated variables.

---

## Expected Result

```text
Immutable historical estimate.
```

---

# 21. Test Case — Formula Versioning

## Scenario

Estimate должен хранить formula version snapshot.

---

## Input

```text
Formula Version:
v1.4
```

---

## Expected Behavior

- estimate linked to formula version;
- future formula changes do not affect estimate.

---

## Expected Result

```text
Versioned estimate reproducibility.
```

---

# 22. Test Case — Access Fee Separation

## Scenario

Access fee не должен дублировать labor cost.

---

## Input

```text
Apartment
+
Long Carry
```

---

## Expected Behavior

- labor logic separated from access surcharge;
- no duplicated charges.

---

## Expected Result

```text
Transparent operational pricing.
```

---

# 23. Test Case — Insurance Logic

## Scenario

Basic liability включена по умолчанию.

---

## Input

```text
No additional insurance selected
```

---

## Expected Behavior

- base coverage included;
- no duplicate insurance charges.

---

## Expected Result

```text
Standard liability active.
```

---

# 24. Test Case — Large Multi-Item Order

## Scenario

Большой order 30-50 items.

---

## Input

```text
45 items
mixed flags
mixed dimensions
```

---

## Expected Behavior

- scalable item processing;
- stable performance;
- item-level calculations preserved.

---

## Expected Result

```text
Consistent calculation behavior
for large orders.
```

---

# 25. Test Case — Operational Complexity Combination

## Scenario

Комбинация:
- fragile;
- stairs;
- helper;
- long carry.

---

## Input

```text
Fragile Item
Old Apartment
No Elevator
Long Carry
Helper Required
```

---

## Expected Behavior

- all operational coefficients applied correctly;
- no duplicated surcharges;
- helper logic separated from access logic.

---

## Expected Result

```text
Transparent combined operational pricing.
```

---

# 26. Основные правила validation

## Rule 1

```text
Pricing explainable.
```

---

## Rule 2

```text
Pricing reproducible.
```

---

## Rule 3

```text
Historical estimates immutable.
```

---

## Rule 4

```text
Item logic item-level.
```

---

## Rule 5

```text
No duplicated surcharges.
```

---

## Rule 6

```text
Operational complexity
должна влиять на pricing predictably.
```

---

# 27. Основные архитектурные проверки

Pricing engine должен поддерживать:

```text
Snapshot Integrity
Formula Versioning
Auditability
Item-Level Logic
Consistent Rounding
Operational Transparency
```

---

# 28. Будущие расширения test coverage

В будущем необходимо покрыть:

```text
Route Optimization
Dynamic Fuel Pricing
Dispatch Constraints
Warehouse Logic
Regional Pricing
Operational SLA Logic
Damage Probability Logic
```

---

# 29. Назначение документа

Документ фиксирует:
- expected pricing behavior;
- pricing validation logic;
- regression testing foundation;
- pricing QA foundation;
- explainable pricing expectations.

Основная задача:
- обеспечить consistent pricing behavior;
- предотвратить hidden pricing changes;
- обеспечить reproducible estimates;
- подготовить foundation для automated testing.
