# Zaberman Broker Calculator MVP — eBOL Workflow

## 1. Purpose

Документ описывает будущий operational workflow системы eBOL (electronic Bill of Lading).

Цель:
- фиксировать pickup/delivery execution;
- сопоставлять items;
- хранить photos;
- фиксировать POD;
- поддерживать damage tracking;
- поддерживать operational auditability.

---

# 2. Core Principle

Calculator отвечает за:
- pricing;
- estimate;
- customer-facing quote.

eBOL отвечает за:
- operational execution;
- pickup;
- delivery;
- proof of service.

---

# 3. Lifecycle

```text
Draft
↓
Estimate
↓
Approved Estimate
↓
Order
↓
eBOL
↓
Completed Delivery
```

---

# 4. Order Creation

## Trigger

Order создаётся после:

```text
Estimate Status = Approved
```

---

## Snapshot Rule

Order получает frozen snapshot:

```text
Customer
Addresses
Items
Vehicle
Pricing
Notes
```

После создания Order:
- pricing не должен пересчитываться;
- items не должны silently изменяться.

---

# 5. Operational Roles

## Broker

Отвечает за:
- quote;
- estimate;
- customer communication.

---

## Dispatcher

Отвечает за:
- route assignment;
- crew assignment;
- operational coordination.

---

## Pickup / Delivery Team

Отвечает за:
- item verification;
- photos;
- pickup confirmation;
- delivery confirmation;
- damage reporting.

---

# 6. Order Status Flow

## Suggested Statuses

```text
Pending Pickup
↓
Pickup Scheduled
↓
Picked Up
↓
In Transit
↓
Warehouse Storage
↓
Out For Delivery
↓
Delivered
↓
Completed
```

---

## Exception Statuses

```text
Issue Reported
Claim
Delivery Failed
Customer Unavailable
Damage Review
```

---

# 7. Item Workflow

Каждый item должен существовать отдельно внутри Order.

---

## Item Data

Каждый item хранит:
- item name;
- dimensions;
- weight;
- packaging;
- fragile flag;
- non-stackable flag;
- crated flag;
- comments;
- declared value.

---

## Item Verification

Pickup/delivery team должны иметь возможность:
- видеть item list;
- сопоставлять physical items;
- отмечать completion status.

---

# 8. Pickup Workflow

## Pickup Screen

Pickup workflow должен позволять:

```text
View Items
↓
Verify Item
↓
Take Pickup Photo
↓
Add Comment
↓
Mark Picked Up
```

---

## Pickup Item Status

Для каждого item:

```text
Not Picked Up
Picked Up
Missing
Damaged
Rejected
```

---

## Pickup Photos

Pickup photos должны:
- храниться отдельно по item;
- поддерживать multiple photos;
- быть доступны внутри order history.

---

# 9. Delivery Workflow

## Delivery Screen

Delivery workflow должен позволять:

```text
View Items
↓
Verify Item
↓
Take Delivery Photo
↓
Add Comment
↓
Collect Signature
↓
Mark Delivered
```

---

## Delivery Item Status

Для каждого item:

```text
Delivered
Damaged
Missing
Customer Refused
Exception
```

---

# 10. Damage Workflow

## Purpose

Damage workflow фиксирует:
- claims;
- disputes;
- operational incidents.

---

## Damage Report

Damage report должен содержать:
- item reference;
- photos;
- damage description;
- pickup/delivery stage;
- timestamp;
- uploaded by.

---

# 11. Photo Workflow

## Requirements

Photos должны:
- быть привязаны к item;
- хранить timestamps;
- хранить uploader;
- поддерживать pickup/delivery separation.

---

## Suggested Photo Types

```text
Pickup
Delivery
Damage
Warehouse
Exception
```

---

# 12. Signature Workflow

## Pickup Signature

Pickup signature подтверждает:
- item transfer;
- pickup completion.

---

## Delivery Signature

Delivery signature подтверждает:
- successful delivery;
- customer acceptance.

---

# 13. POD Logic

POD (Proof of Delivery) должен содержать:

```text
Delivered Items
Delivery Photos
Delivery Timestamp
Recipient Signature
Delivery Address
Driver / Crew
```

---

# 14. eBOL Generation

eBOL должен генерироваться автоматически на основании:
- order snapshot;
- item statuses;
- photos;
- signatures;
- comments.

---

## eBOL Must Include

```text
Customer Info
Pickup Address
Delivery Address
Items List
Pickup Confirmation
Delivery Confirmation
Photos
Damage Notes
Signatures
```

---

# 15. Storage Workflow

Если order переходит в storage:

```text
Picked Up
↓
Warehouse Storage
↓
Storage Tracking
↓
Out For Delivery
```

Storage должен:
- фиксировать storage dates;
- фиксировать storage charges;
- фиксировать warehouse status.

---

# 16. Operational Auditability

Система должна хранить:
- timestamps;
- uploader;
- signatures;
- status changes;
- comments;
- item history.

---

# 17. Future Expansion

Future operational features:
- driver mobile app;
- offline photo upload;
- route scanning;
- barcode / QR item matching;
- customer delivery tracking;
- automated POD delivery;
- claim workflow;
- warehouse inventory tracking.

---

# 18. Key Architectural Rules

## Rule 1

```text
Order uses frozen estimate snapshot.
```

---

## Rule 2

```text
Operational layer must not recalculate pricing.
```

---

## Rule 3

```text
Every item must support:
- status
- comments
- photos
- verification
```

---

## Rule 4

```text
eBOL must be generated automatically
from operational data.
```

---

## Rule 5

```text
Pickup and delivery workflows
must remain item-based,
not order-based only.
```
