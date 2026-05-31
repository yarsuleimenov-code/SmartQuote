# Zaberman LLC Pricing Calculator — Estimate Lifecycle

# 1. Назначение документа

Документ фиксирует:
- lifecycle estimate workflow;
- transitions между сущностями;
- mutable vs immutable states;
- ownership lifecycle;
- snapshot creation logic;
- operational transition logic.

Основная задача:
- обеспечить consistent estimate lifecycle;
- предотвратить mutable pricing;
- разделить commercial и operational layers;
- сохранить auditability.

---

# 2. Главный lifecycle системы

Полный lifecycle:

```text
Draft
↓
Estimate
↓
Invoice
↓
Order
↓
eBOL
↓
Completed Delivery
```

---

# 3. Основной архитектурный принцип

```text
Draft editable.
Estimate immutable.
```

---

## Что это означает

Draft:
- рабочее состояние;
- editable;
- recalculated dynamically.

Estimate:
- frozen snapshot;
- customer-facing document;
- immutable state.

---

# 4. Lifecycle Overview

## Commercial Layer

```text
Draft
↓
Estimate
↓
Invoice
```

---

## Operational Layer

```text
Order
↓
eBOL
↓
Completed Delivery
```

---

## Ключевое правило

```text
Operational layer
не должен изменять pricing snapshot.
```

---

# 5. Draft Lifecycle

## Назначение Draft

Draft представляет:
- рабочий quote;
- editable pricing state;
- temporary calculation workspace.

---

## Draft содержит

```text
Customer Data
Route Data
Items
Access Conditions
Quote Options
Pricing Preview
```

---

## Draft свойства

Draft:
- editable;
- autosaved;
- recalculated dynamically;
- mutable.

---

## Допустимые действия

```text
Edit Items
Edit Route
Edit Options
Recalculate
Duplicate Draft
Delete Draft
```

---

## Недопустимо

```text
Draft
не должен считаться
final customer estimate.
```

---

# 6. Draft Statuses

## Возможные статусы

```text
Draft
In Progress
Pending Review
Archived
Converted to Estimate
```

---

## Recommended Workflow

```text
Draft
↓
In Progress
↓
Converted to Estimate
```

---

# 7. Estimate Creation

Estimate создаётся:
- после generate estimate;
- после approval workflow;
- после pricing confirmation.

---

## Estimate Generation Flow

```text
Draft
↓
Generate Estimate
↓
Create Immutable Snapshot
↓
Estimate Created
```

---

# 8. Estimate Snapshot

Estimate должен фиксировать snapshot:

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
Estimate immutable.
```

---

# 9. Estimate Properties

Estimate:
- customer-facing;
- immutable;
- versioned;
- auditable.

---

## Estimate содержит

```text
Estimate ID
Customer Snapshot
Pricing Snapshot
Final Price
Estimate PDF
Created Timestamp
Formula Version
```

---

# 10. Estimate Statuses

## Возможные статусы

```text
Generated
Sent
Viewed
Approved
Rejected
Expired
Converted to Invoice
Archived
```

---

## Recommended Workflow

```text
Generated
↓
Sent
↓
Viewed
↓
Approved
```

---

# 11. Estimate Modification Logic

Estimate нельзя изменять напрямую.

---

## Правильный flow

```text
Existing Estimate
↓
Create New Draft
↓
Edit Draft
↓
Generate New Estimate
```

---

## Недопустимый flow

```text
Open Estimate
↓
Edit Estimate Directly
```

---

# 12. Estimate Versioning

Каждое изменение estimate:
- создаёт новую версию;
- создаёт новый snapshot.

---

## Versioning Example

```text
EST-291-v1
EST-291-v2
EST-291-v3
```

---

## Причина versioning

Необходимы:
- auditability;
- pricing reproducibility;
- dispute prevention;
- historical consistency.

---

# 13. Invoice Lifecycle

Invoice создаётся:
- после estimate approval;
- после commercial confirmation.

---

## Invoice Flow

```text
Approved Estimate
↓
Generate Invoice
↓
Invoice Sent
↓
Payment Workflow
```

---

## Invoice содержит

```text
Invoice ID
Estimate Reference
Invoice Amount
Payment Status
Due Date
```

---

## Ключевое правило

```text
Invoice
не изменяет estimate snapshot.
```

---

# 14. Invoice Statuses

## Возможные статусы

```text
Draft
Sent
Partially Paid
Paid
Overdue
Cancelled
```

---

# 15. Order Creation

Order создаётся:
- после invoice/payment confirmation;
- после operational approval.

---

## Order Flow

```text
Approved Invoice
↓
Create Order
↓
Operational Workflow
```

---

## Order получает snapshot

```text
Customer Snapshot
Route Snapshot
Items Snapshot
Access Conditions
Operational Notes
```

---

## Ключевое правило

```text
Order работает
с frozen estimate snapshot.
```

---

# 16. Order Statuses

## Возможные статусы

```text
Pending Dispatch
Scheduled
In Pickup
In Transit
Out For Delivery
Completed
Completed With Exceptions
Cancelled
```

---

# 17. eBOL Creation

eBOL создаётся:
- после Order creation;
- перед pickup workflow.

---

## eBOL Flow

```text
Order Created
↓
eBOL Created
↓
Pickup Verification
↓
Delivery Verification
↓
POD
```

---

# 18. eBOL Statuses

## Возможные статусы

```text
Created
Pickup In Progress
In Transit
Delivery Verification
Completed
Completed With Exceptions
```

---

# 19. POD Completion

POD создаётся после:

```text
All Items Delivered
+
Required Photos Uploaded
+
Delivery Signature Collected
```

---

## Completion Flow

```text
Delivery Completed
↓
POD Generated
↓
Order Closed
```

---

# 20. Immutable vs Mutable States

## Mutable

Могут изменяться:

```text
Draft
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
Invoice Snapshot
```

---

# 21. Snapshot Integrity Rules

## Rule 1

```text
Variables changes
не изменяют
historical estimates.
```

---

## Rule 2

```text
Formula changes
не изменяют
historical estimates.
```

---

## Rule 3

```text
Operational workflow
не изменяет pricing snapshot.
```

---

# 22. Recalculation Rules

## Draft

Draft:
- recalculated dynamically;
- reflects latest variables.

---

## Estimate

Estimate:
- frozen;
- reproducible;
- historically stable.

---

## Правильный recalculation flow

```text
Create New Draft
↓
Apply Changes
↓
Recalculate
↓
Generate New Estimate
```

---

# 23. Lifecycle Ownership

## Commercial Layer Ownership

```text
Draft
Estimate
Invoice
Pricing Snapshot
```

---

## Operational Layer Ownership

```text
Order
eBOL
Photos
Signatures
Exceptions
```

---

## Governance Layer Ownership

```text
Variables
Formula Versions
Pricing Rules
```

---

# 24. Main Lifecycle Risks

## Risk 1 — Editable Estimates

Последствия:
- inconsistent pricing;
- historical corruption;
- pricing disputes.

---

## Решение

```text
Immutable Estimate Snapshot
```

---

## Risk 2 — No Versioning

Последствия:
- impossible auditability;
- impossible reproducibility.

---

## Решение

```text
Estimate Versioning
+
Formula Version Snapshot
```

---

## Risk 3 — Operational Layer Changes Pricing

Последствия:
- broken snapshot integrity;
- inconsistent invoices;
- audit failure.

---

## Решение

```text
Strict Layer Separation
```

---

# 25. Main Architectural Rules

## Rule 1

```text
Draft editable.
Estimate immutable.
```

---

## Rule 2

```text
Operational workflow
не изменяет estimate pricing.
```

---

## Rule 3

```text
Every estimate
must contain snapshot.
```

---

## Rule 4

```text
Every estimate
must contain formula version.
```

---

## Rule 5

```text
Changes create new estimate version.
```

---

# 26. Recommended Future Automation

## Planned Automation

```text
Autosave Drafts
Auto Estimate Versioning
Automatic Snapshot Creation
Estimate Expiration
Operational Status Automation
POD Automation
```

---

# 27. Целевая backend lifecycle architecture

```text
Frontend UI
↓
API Layer
↓
Draft Service
↓
Pricing Engine
↓
Snapshot Service
↓
Invoice Service
↓
Operational Services
↓
eBOL Service
↓
Database
```

---

# 28. Назначение документа

Документ фиксирует:
- estimate lifecycle;
- lifecycle ownership;
- snapshot rules;
- immutable vs mutable boundaries;
- operational transitions;
- commercial workflow consistency.

Основная задача:
- обеспечить predictable lifecycle behavior;
- сохранить auditability;
- предотвратить mutable pricing;
- подготовить foundation для production architecture.
