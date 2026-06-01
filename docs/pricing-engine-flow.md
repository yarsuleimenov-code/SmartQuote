# Zaberman LLC Pricing Calculator — Pricing Engine Flow

# 1. Назначение pricing engine

Pricing Engine является центральным calculation layer системы.

Основная задача pricing engine:
- стандартизировать pricing logic;
- исключить ручные расчёты;
- обеспечивать explainable pricing;
- обеспечивать reproducible estimates;
- централизовать business logic.

---

# 2. Главный архитектурный принцип

```text
Pricing logic принадлежит backend pricing engine.
```

Frontend:
- отображает данные;
- собирает input;
- показывает calculation result.
- in the current MVP, temporarily runs the accepted local calculator until backend pricing engine exists.

Frontend не должен:
- хранить formulas;
- рассчитывать final pricing;
- хранить скрытую business logic.

Current MVP exception:
- `js/calculator.js` contains the accepted local calculation model.
- `js/variables.js` contains the UAT-approved runtime variables baseline.
- `js/pricingConfig.js` applies frontend admin overrides and creates `variablesSnapshot`.
- This is a transition layer for business validation, not the target production architecture.

---

# 3. High-Level Pricing Flow

Общий flow расчёта:

```text
Customer Input
↓
Route Processing
↓
Items Processing
↓
Physical Volume
↓
Effective Volume
↓
Vehicle Fit
↓
Crew Logic
↓
Access Logic
↓
Operational Cost
↓
Additional Charges
↓
Margin Logic
↓
Discount Logic
↓
Rounding Logic
↓
Final Estimate
↓
Snapshot Creation
```

Current MVP snapshot rule:
- Drafts are live and recalculate against current runtime variables.
- Estimates are frozen snapshots and include `formulaVersion`, `variablesSnapshot`, `quote`, and `result`.
- Opening an existing estimate should use saved `result`, not recalculate from current variables.

---

# 4. Input Layer

Pricing engine получает:

```text
Customer Data
Pickup ZIP
Delivery ZIP
Items
Access Conditions
Quote Options
Pricing Variables
Formula Version
```

Current MVP variable source:

```text
js/variables.js defaults
↓
js/pricingConfig.js saved overrides
↓
CalculatorVariables runtime
↓
PricingCalculator.calculateQuote()
```

---

## Customer Data

Используется:
- для estimate;
- invoice;
- operational workflow.

Customer data не влияет напрямую на pricing.

---

## Route Data

Используется:
- для route calculation;
- distance calculation;
- zone mapping;
- operational planning.

---

## Items Data

Items являются главным pricing input.

Каждый item содержит:
- dimensions;
- weight;
- quantity;
- flags;
- declared value;
- packaging;
- storage;
- comments.

---

# 5. Route Processing

Pricing engine:
- определяет zones;
- рассчитывает distance;
- определяет interstate route;
- определяет route availability;
- определяет operational complexity.

---

## Route Inputs

```text
Pickup ZIP
Delivery ZIP
```

---

## Route Outputs

```text
Distance
Origin Zone
Destination Zone
Route Type
Operational Region
```

---

# 6. Item Processing

Каждый item обрабатывается отдельно.

---

## Item Processing Flow

```text
Item Input
↓
Physical Volume
↓
Flags
↓
Effective Volume
↓
Handling Complexity
↓
Crew Requirement
↓
Additional Charges
```

---

## Item-Level Logic

Item-level logic включает:
- packaging;
- crating;
- insurance;
- storage;
- stackability;
- fragile handling.

---

# 7. Physical Volume

Physical Volume рассчитывается на основе:

```text
Length × Width × Height
```

---

## Physical Volume Formula

:contentReference[oaicite:0]{index=0}

---

## Где используется

Physical Volume влияет на:
- vehicle fit;
- route planning;
- base operational capacity.

---

# 8. Effective Volume

Effective Volume учитывает:
- fragile items;
- non-stackable items;
- crated items;
- oversized handling;
- operational inefficiencies.

---

## Effective Volume Logic

:contentReference[oaicite:1]{index=1}

---

## Пример влияния

```text
Fragile item
→ higher effective volume

Non-stackable item
→ higher vehicle occupancy

Crated item
→ reduced stackability
```

---

# 9. Vehicle Fit Logic

Vehicle определяется автоматически pricing engine.

Broker не должен выбирать vehicle вручную.

---

## Vehicle Fit Inputs

```text
Effective Volume
Total Weight
Route Type
Operational Constraints
```

---

## Vehicle Fit Outputs

```text
Vehicle Type
Required Capacity
Operational Cost Base
Crew Capacity
```

---

## Примеры vehicle types

```text
Sprinter
Box Truck
26 ft Truck
Dedicated Truck
```

---

# 10. Crew Logic

Crew logic определяется pricing engine.

---

## Crew Logic Inputs

```text
Item Weight
Effective Volume
Access Conditions
Handling Complexity
Oversized Items
```

---

## Crew Logic Outputs

```text
Required Crew
Additional Helpers
Operational Labor Cost
```

---

## Helper Rule

Ключевое правило:

```text
Additional helper
minimum billable time = 2 hours
```

---

## Crew Logic Examples

```text
Heavy concrete table
→ 2 people

Fragile oversized item
→ helper surcharge

Small lightweight item
→ 1 person
```

---

# 11. Access Logic

Access Logic учитывает:
- pickup complexity;
- delivery complexity;
- handling difficulty.

---

## Access Inputs

```text
Address Type
Floor
Elevator
Stairs
Long Carry
COI Required
Narrow Access
```

---

## Address Types

Примеры:

```text
House
Warehouse
Modern Apartment
Old Apartment
Office
Storage
Retail
```

---

## Access Logic Outputs

```text
Labor Impact
Access Fee
Handling Complexity
Crew Requirement
```

---

## Пример

```text
Warehouse
→ lower labor complexity

Old apartment + stairs
→ higher operational cost
```

---

# 12. Operational Cost

Operational Cost является базой estimate.

---

## Operational Cost Structure

```text
Pickup Stage
+
Interstate Stage
+
Delivery Stage
```

---

## Pickup Stage

Может включать:
- labor;
- loading;
- access complexity;
- local mileage;
- parking;
- tolls.

---

## Interstate Stage

Может включать:
- long-haul mileage;
- fuel;
- vehicle usage;
- route operational cost.

---

## Delivery Stage

Может включать:
- unloading;
- access complexity;
- long carry;
- stairs;
- helper labor.

---

# 13. Additional Charges

Additional Charges рассчитываются отдельно от Operational Cost.

---

## Примеры Additional Charges

```text
Packaging
Crating
Storage
Insurance
COI
Exclusive Delivery
Zone Fee
```

---

## Packaging Logic

Packaging считается:
- отдельно для каждого item;
- не на весь order фиксированной ставкой.

---

## Insurance Logic

Basic Liability:
- включён по умолчанию.

Дополнительно:
- Full Coverage;
- declared value impact.

---

## Storage Logic

Storage рассчитывается:
- по item;
- по storage days.

---

# 14. Margin Logic

Margin применяется после:
- operational cost;
- additional charges.

---

## Margin Logic Formula

:contentReference[oaicite:2]{index=2}

---

## Margin Variables

Margin может зависеть от:
- route type;
- operational complexity;
- dedicated delivery;
- business rules.

---

# 15. Discount Logic

Discount применяется после margin.

---

## Discount Sources

```text
Manual Discount
VIP Customer
Operational Promotion
Sales Override
```

---

## Ключевое правило

Discount:
- не должен ломать operational profitability;
- должен быть auditable.

---

# 16. Rounding Logic

После расчёта final raw price применяется rounding rule.

---

## Текущее правило

```text
UP to nearest $10
```

---

## Rounding Formula

:contentReference[oaicite:3]{index=3}

---

# 17. Final Estimate

После всех calculations формируется:

```text
Final Rounded Estimate
```

---

## Estimate содержит

```text
Operational Cost
Additional Charges
Margin
Discount
Rounded Final Price
```

---

# 18. Snapshot Creation

После generate estimate создаётся immutable snapshot.

---

## Snapshot включает

```text
Customer Snapshot
Route Snapshot
Items Snapshot
Variables Snapshot
Formula Version
Calculation Components
Final Rounded Price
```

---

## Ключевое правило

```text
Historical estimates
не должны пересчитываться
после изменения variables.
```

---

# 19. Recalculation Rules

## Draft

Draft:
- editable;
- recalculated dynamically.

---

## Estimate

Estimate:
- immutable;
- frozen snapshot.

---

## Правильный flow

```text
Estimate change request
↓
Create New Draft
↓
Recalculate
↓
Generate New Estimate
```

---

# 20. Edge Cases

## Case 1 — Fragile Oversized Item

Влияние:
- increased effective volume;
- higher handling complexity;
- additional helper risk.

---

## Case 2 — Old Apartment + Stairs

Влияние:
- higher labor cost;
- increased crew requirement;
- access surcharge.

---

## Case 3 — Warehouse Delivery

Влияние:
- reduced unloading complexity;
- reduced labor cost.

---

## Case 4 — Additional Helper

Правило:

```text
Minimum billable time = 2 hours
```

---

## Case 5 — Mixed Order

Пример:

```text
1 fragile item
+
9 regular boxes
```

Item-level logic должна:
- рассчитываться отдельно;
- не применять fragile coefficient ко всему order.

---

# 21. Основные архитектурные правила

## Rule 1

```text
Pricing logic принадлежит pricing engine.
```

---

## Rule 2

```text
Frontend не хранит business formulas.
```

---

## Rule 3

```text
Estimate immutable.
```

---

## Rule 4

```text
Draft editable.
```

---

## Rule 5

```text
Order/eBOL
не изменяют estimate pricing.
```

---

## Rule 6

```text
Additional charges
не должны дублировать
operational stage cost.
```

---

# 22. Целевая backend архитектура

Целевая архитектура pricing engine:

```text
Frontend UI
↓
API Layer
↓
Pricing Engine
↓
Variables Service
↓
Snapshot Service
↓
Database
```

---

# 23. Назначение документа

Документ фиксирует:
- sequencing pricing logic;
- ownership calculations;
- business calculation flow;
- pricing governance;
- snapshot rules;
- foundation backend architecture.

Основная задача:
- предотвратить хаотичную реализацию formulas;
- обеспечить consistent pricing;
- обеспечить auditability;
- сохранить explainable pricing structure.
