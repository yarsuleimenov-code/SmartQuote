# Zaberman LLC Pricing Calculator — eBOL Workflow

# 1. Назначение eBOL

eBOL (Electronic Bill of Lading) является operational execution workflow системы.

eBOL используется для:
- item verification;
- pickup confirmation;
- delivery confirmation;
- photo verification;
- POD workflow;
- damage tracking;
- dispute prevention;
- operational auditability.

---

# 2. Основной принцип

Ключевой принцип:

```text
eBOL не является pricing system.
```

eBOL:
- не пересчитывает estimate;
- не изменяет pricing;
- не изменяет formula logic.

eBOL работает с:
- frozen estimate snapshot;
- operational execution data.

---

# 3. High-Level Workflow

Полный workflow:

```text
Estimate Approved
↓
Order Created
↓
eBOL Created
↓
Pickup Verification
↓
Transit
↓
Delivery Verification
↓
Signatures
↓
POD Generation
↓
Completed Delivery
```

---

# 4. Order → eBOL Transition

eBOL создаётся:
- после создания Order;
- после подтверждения estimate/invoice;
- перед operational execution.

---

## eBOL получает snapshot

```text
Customer Data
Pickup Address
Delivery Address
Items Snapshot
Access Conditions
Operational Notes
```

---

## Ключевое правило

```text
eBOL использует frozen estimate snapshot.
```

Изменение estimate:
- не должно изменять существующий eBOL.

---

# 5. Pickup Workflow

Pickup workflow начинается:
- при прибытии crew;
- перед loading.

---

## Pickup Workflow Sequence

```text
Arrival
↓
Address Verification
↓
Item Verification
↓
Condition Verification
↓
Pickup Photos
↓
Pickup Signature
↓
Pickup Completed
```

---

## Pickup Verification

Для каждого item:
- подтверждается наличие;
- фиксируется состояние;
- фиксируются comments;
- фиксируются photos.

---

## Pickup Statuses

Примеры:

```text
Pending
Verified
Loaded
Missing
Refused
Damaged Before Pickup
```

---

# 6. Delivery Workflow

Delivery workflow начинается:
- при прибытии на delivery address;
- перед unloading.

---

## Delivery Workflow Sequence

```text
Arrival
↓
Item Verification
↓
Condition Verification
↓
Delivery Photos
↓
Recipient Signature
↓
Delivery Completed
```

---

## Delivery Statuses

Примеры:

```text
Pending
Delivered
Partially Delivered
Refused
Damaged During Delivery
Missing
```

---

# 7. Item Verification

Каждый item является отдельной operational entity.

---

## Item Verification включает

```text
Pickup Status
Delivery Status
Pickup Condition
Delivery Condition
Photos
Comments
Exceptions
```

---

## Ключевое правило

```text
Item verification item-level.
```

Нельзя:
- применять status ко всему order;
- объединять exceptions между items.

---

# 8. Photos Workflow

Photos являются обязательной частью eBOL.

---

## Типы photos

```text
Pickup Photo
Delivery Photo
Damage Photo
Warehouse Photo
Address Photo
Signature Photo
```

---

## Pickup Photos

Pickup photo фиксирует:
- состояние item до loading;
- упаковку;
- visible damage;
- наличие item.

---

## Delivery Photos

Delivery photo фиксирует:
- состояние после delivery;
- completed placement;
- visible damage;
- completed unloading.

---

## Damage Photos

Damage photos:
- обязательны при exception;
- привязываются к item;
- должны храниться отдельно.

---

## Ключевое правило

```text
Photo attachment item-level.
```

---

# 9. Signature Workflow

Подписи являются proof entity.

---

## Типы signatures

```text
Pickup Signature
Delivery Signature
```

---

## Pickup Signature

Подтверждает:
- item received for transportation;
- pickup completed.

---

## Delivery Signature

Подтверждает:
- item delivered;
- delivery accepted;
- POD completed.

---

## Ключевое правило

```text
Delivery signature завершает POD workflow.
```

---

# 10. Exception Workflow

Exception workflow используется для:
- damage;
- missing items;
- refusal;
- operational incidents.

---

## Exception Types

Примеры:

```text
Damaged
Missing
Refused
Incorrect Item
Packaging Failure
Access Problem
```

---

## Exception Workflow

```text
Exception Detected
↓
Item Linked
↓
Photos Attached
↓
Comment Added
↓
Severity Selected
↓
Operational Review
```

---

## Severity Examples

```text
Low
Medium
High
Critical
```

---

## Ключевое правило

```text
Exception всегда привязан к item.
```

---

# 11. POD Workflow

POD (Proof of Delivery) создаётся после:
- delivery completion;
- required photos;
- recipient signature.

---

## POD включает

```text
Order Data
Customer Data
Items
Statuses
Photos
Exceptions
Signatures
Completion Timestamp
```

---

## POD Generation Flow

```text
Delivery Completed
+
Photos Verified
+
Signature Collected
↓
Generate POD
```

---

# 12. Completion Logic

Order считается completed только после:

```text
All Items Delivered
+
Required Photos Uploaded
+
Delivery Signature Collected
+
Exceptions Processed
```

---

## Completion Statuses

Примеры:

```text
In Transit
Awaiting Delivery
Delivery Verification
Completed
Completed With Exceptions
```

---

# 13. Immutable Rules

## Immutable после completion

После completed state:
- eBOL snapshot;
- photos;
- signatures;
- statuses;
- POD

не должны изменяться напрямую.

---

## Mutable до completion

До completion разрешено:
- update statuses;
- upload photos;
- add comments;
- add exceptions.

---

# 14. Operational Roles

## Dispatcher

Может:
- отслеживать order;
- проверять statuses;
- контролировать completion.

---

## Driver / Crew

Может:
- менять item statuses;
- загружать photos;
- добавлять comments;
- собирать signatures.

---

## Operations Manager

Может:
- review exceptions;
- approve operational resolution;
- export POD/eBOL.

---

# 15. Edge Cases

## Case 1 — Partial Delivery

Пример:

```text
2 items delivered
1 item missing
```

Результат:
- partial delivery;
- open exception;
- incomplete POD.

---

## Case 2 — Damaged Item

Flow:

```text
Damage Detected
↓
Photos
↓
Comment
↓
Exception
↓
Manager Review
```

---

## Case 3 — Refused Delivery

Flow:

```text
Recipient Refused
↓
Reason Captured
↓
Photos Attached
↓
Exception Created
```

---

## Case 4 — Missing Pickup Item

Пример:

```text
Item expected
but not available during pickup
```

Результат:
- pickup exception;
- incomplete loading.

---

## Case 5 — Large Order

Пример:

```text
30-50 items
```

Требования:
- item-level tracking;
- fast verification workflow;
- scalable photo workflow.

---

# 16. Основные архитектурные правила

## Rule 1

```text
eBOL не изменяет pricing.
```

---

## Rule 2

```text
eBOL работает с frozen estimate snapshot.
```

---

## Rule 3

```text
Item verification всегда item-level.
```

---

## Rule 4

```text
Exception всегда привязан к item.
```

---

## Rule 5

```text
Photos являются proof entity.
```

---

## Rule 6

```text
Delivery signature завершает POD workflow.
```

---

# 17. Целевая backend архитектура

Целевая архитектура eBOL workflow:

```text
Mobile App / Operations UI
↓
Operational API
↓
eBOL Service
↓
Photo Storage
↓
POD Generator
↓
Database
```

---

# 18. Назначение документа

Документ фиксирует:
- operational execution flow;
- eBOL lifecycle;
- pickup/delivery workflow;
- item verification logic;
- POD generation logic;
- operational boundaries.

Основная задача:
- обеспечить consistent operational workflow;
- подготовить foundation для mobile/dispatch system;
- предотвратить смешивание pricing и operational layers;
- обеспечить proof and audit workflow.
