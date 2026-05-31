# Zaberman LLC Pricing Calculator — Entity Model

# 1. Назначение документа

Документ фиксирует:
- основные сущности системы;
- ownership данных;
- lifecycle сущностей;
- relationships между сущностями;
- snapshot logic;
- boundaries между commercial и operational layer.

Документ не описывает SQL schema.

Основная задача:
- зафиксировать business entity architecture;
- предотвратить смешивание responsibility;
- подготовить foundation для backend architecture.

---

# 2. Основные сущности системы

Система состоит из следующих основных сущностей:

```text
Customer
↓
Quote Draft
↓
Estimate
↓
Invoice
↓
Order
↓
eBOL
```

Дополнительные сущности:

```text
Item
Vehicle
Pricing Snapshot
Formula Version
Photo
Signature
Exception
Access Condition
Additional Charge
```

---

# 3. Customer

## Назначение

Customer представляет:
- клиента;
- buyer;
- seller;
- компанию;
- contact entity.

---

## Основные данные

```text
customer_id
customer_type
name
company_name
phone
email
billing_info
notes
```

---

## Важное правило

Customer не должен хранить:
- pricing snapshot;
- estimate totals;
- operational statuses.

Customer является reference entity.

---

# 4. Quote Draft

## Назначение

Draft представляет:
- редактируемый quote;
- незавершённый estimate;
- временное состояние pricing workflow.

---

## Основные данные

```text
draft_id
customer_id
route_data
items
quote_options
pricing_preview
status
created_by
updated_at
```

---

## Основные свойства

Draft:
- editable;
- autosaved;
- recalculated dynamically;
- mutable.

---

## Ключевое правило

```text
Draft не является customer-facing документом.
```

Draft может:
- изменяться;
- пересчитываться;
- дублироваться;
- удаляться.

---

# 5. Estimate

## Назначение

Estimate представляет:
- customer-facing quote;
- frozen pricing snapshot;
- версию отправленной стоимости.

---

## Основные данные

```text
estimate_id
draft_id
customer_snapshot
route_snapshot
items_snapshot
pricing_snapshot
formula_version
final_price
estimate_pdf
created_at
```

---

## Основные свойства

Estimate:
- immutable;
- versioned;
- auditable.

---

## Ключевое правило

```text
Estimate нельзя изменять напрямую.
```

Любые изменения:
- создают новый draft;
- генерируют новый estimate.

---

# 6. Invoice

## Назначение

Invoice представляет:
- billing document;
- payment entity;
- customer payment request.

---

## Основные данные

```text
invoice_id
estimate_id
invoice_status
payment_status
invoice_amount
payment_method
due_date
```

---

## Важное правило

Invoice не должен:
- пересчитывать pricing;
- изменять estimate snapshot.

---

# 7. Order

## Назначение

Order представляет:
- operational execution entity;
- заказ после подтверждения estimate/invoice.

---

## Основные данные

```text
order_id
estimate_id
pickup_status
delivery_status
dispatch_status
assigned_route
assigned_vehicle
assigned_crew
operational_notes
```

---

## Основные свойства

Order:
- operational entity;
- lifecycle-driven;
- stateful.

---

## Ключевое правило

```text
Order не должен изменять estimate pricing.
```

Order работает с frozen estimate snapshot.

---

# 8. Item

## Назначение

Item представляет:
- единицу груза;
- отдельный перевозимый объект;
- item-level operational entity.

---

## Основные данные

```text
item_id
draft_id / estimate_id / order_id
item_name
dimensions
weight
quantity
flags
declared_value
photos
comments
```

---

## Item Flags

Примеры flags:

```text
Fragile
Non-stackable
Crated
Heavy
Oversized
High Value
```

---

## Важное правило

Item должен поддерживать:
- pricing logic;
- operational logic;
- eBOL verification.

---

# 9. Vehicle

## Назначение

Vehicle представляет:
- vehicle type;
- operational capacity entity;
- pricing capacity entity.

---

## Основные данные

```text
vehicle_id
vehicle_type
max_volume
max_weight
crew_capacity
cost_per_mile
operational_limits
```

---

## Важное правило

Vehicle не выбирается брокером вручную.

Vehicle определяется pricing engine.

---

# 10. Pricing Snapshot

## Назначение

Pricing Snapshot фиксирует:
- pricing variables;
- formula outputs;
- operational calculations.

---

## Основные данные

```text
snapshot_id
estimate_id
variables_snapshot
formula_version
calculation_components
rounding_rule
raw_price
final_price
```

---

## Ключевое правило

```text
Snapshot immutable.
```

---

# 11. Formula Version

## Назначение

Formula Version фиксирует:
- active pricing formulas;
- calculation logic version;
- governance state.

---

## Основные данные

```text
formula_version_id
version_name
created_at
activated_at
status
change_notes
```

---

## Важное правило

Estimate должен хранить:
- formula_version;
- variables_snapshot.

---

# 12. Additional Charge

## Назначение

Additional Charge представляет:
- отдельную дополнительную услугу;
- дополнительный pricing component.

---

## Примеры

```text
Packaging
Crating
Storage
Insurance
COI
Access Fee
Exclusive Delivery
Zone Fee
```

---

## Основные данные

```text
charge_id
charge_type
calculation_method
charge_amount
applies_to
```

---

# 13. Access Condition

## Назначение

Access Condition описывает:
- pickup complexity;
- delivery complexity;
- handling complexity.

---

## Примеры

```text
Apartment
Warehouse
Stairs
Elevator
Long Carry
COI Required
Narrow Access
```

---

## Основные данные

```text
access_condition_id
location_type
floor
stairs
elevator
long_carry
coi_required
notes
```

---

# 14. Photo

## Назначение

Photo представляет:
- proof entity;
- operational verification artifact.

---

## Основные данные

```text
photo_id
item_id
photo_type
uploaded_by
uploaded_at
file_url
comment
```

---

## Типы photo

```text
Pickup
Delivery
Damage
Warehouse
Address
Signature
```

---

# 15. Signature

## Назначение

Signature представляет:
- pickup confirmation;
- delivery confirmation;
- POD artifact.

---

## Основные данные

```text
signature_id
order_id
signature_type
signed_by
signed_at
signature_file
```

---

# 16. Exception

## Назначение

Exception представляет:
- damage report;
- operational incident;
- delivery discrepancy.

---

## Основные данные

```text
exception_id
order_id
item_id
exception_type
severity
description
photos
created_at
```

---

# 17. eBOL

## Назначение

eBOL представляет:
- operational delivery document;
- item verification workflow;
- POD workflow.

---

## Основные данные

```text
ebol_id
order_id
items_snapshot
pickup_status
delivery_status
photos
signatures
exceptions
completed_at
```

---

## Ключевое правило

```text
eBOL не должен изменять estimate pricing.
```

eBOL работает с:
- operational execution;
- verification;
- proof workflow.

---

# 18. Relationships

## Основные relationships

```text
Customer
1 → many Drafts

Draft
1 → many Items

Draft
1 → many Estimates

Estimate
1 → 1 Pricing Snapshot

Estimate
1 → 1 Formula Version

Estimate
1 → 1 Order

Order
1 → 1 eBOL

Item
1 → many Photos

Order
1 → many Exceptions
```

---

# 19. Lifecycle и ownership

## Commercial Layer

Владеет:
- Draft;
- Estimate;
- Invoice;
- Pricing Snapshot.

---

## Operational Layer

Владеет:
- Order;
- eBOL;
- Photos;
- Signatures;
- Exceptions.

---

## Pricing Governance Layer

Владеет:
- Variables;
- Formula Versions;
- Pricing Rules.

---

# 20. Immutable vs Mutable сущности

## Mutable

Могут изменяться:

```text
Draft
Customer
Order
eBOL
```

---

## Immutable

Не должны изменяться:

```text
Estimate
Pricing Snapshot
Formula Version Snapshot
```

---

# 21. Основные архитектурные правила

## Rule 1

```text
Draft editable.
Estimate immutable.
```

---

## Rule 2

```text
Order не должен изменять pricing.
```

---

## Rule 3

```text
eBOL не должен пересчитывать estimate.
```

---

## Rule 4

```text
Pricing logic принадлежит pricing engine.
```

---

## Rule 5

```text
UI не должен хранить business-critical formulas.
```

---

# 22. Целевая backend модель

Целевая backend архитектура:

```text
Frontend UI
↓
API Layer
↓
Pricing Engine
↓
Operational Services
↓
Database
```

---

# 23. Цель entity model

Документ фиксирует:
- ownership сущностей;
- boundaries системы;
- lifecycle entities;
- snapshot logic;
- основу будущей backend architecture.

Основная задача:
- избежать смешивания commercial и operational layers;
- предотвратить дублирование данных;
- обеспечить auditability;
- сохранить snapshot integrity.
