# Zaberman Broker Calculator MVP — Technical Roadmap

## 1. Purpose

Документ описывает рекомендуемый порядок технической реализации системы.

Цель roadmap:
- разделить MVP phases;
- избежать premature development;
- сохранить архитектурную целостность;
- разделить pricing и operations;
- зафиксировать implementation priorities.

---

# 2. Core Development Principle

Система должна развиваться слоями:

```text
UI
↓
Backend Foundation
↓
Pricing Engine
↓
Integrations
↓
Operational Layer
```

Нельзя:
- строить operations раньше pricing engine;
- строить dispatcher workflow раньше estimate lifecycle;
- смешивать calculator и eBOL.

---

# 3. Current Project State

На текущий момент реализовано:

```text
index.html
breakdown.html
variables.html
drafts.html
estimates.html
```

Подготовлены документы:

```text
architecture.md
entity-model.md
pricing-engine-flow.md
ebol-workflow.md
```

---

# 4. Phase 1 — Frontend MVP

## Status

```text
Completed
```

---

## Scope

### Broker Workflow

- quote creation;
- customer input;
- route input;
- items input;
- packaging selection;
- pricing preview;
- estimate generation.

---

### Pricing Breakdown

- operational cost;
- additional charges;
- margin;
- rounding;
- audit explanation.

---

### Variables Management

- fuel pricing;
- vehicle parameters;
- packaging variables;
- crating variables;
- stackability coefficients;
- pricing governance;
- formula reference.

---

### Draft / Estimate Workflow

- draft storage;
- estimate separation;
- estimate lifecycle concept.

---

# 5. Phase 2 — Backend Foundation

## Priority

```text
Critical
```

---

## Goal

Создать backend foundation без полной business logic.

---

## Scope

### Database Schema

Необходимо реализовать:
- entities;
- relationships;
- snapshots;
- formula versioning.

---

### Estimate Lifecycle

Необходимо реализовать:
- draft creation;
- draft updates;
- estimate generation;
- frozen estimate snapshot.

---

### Variables Storage

Необходимо реализовать:
- centralized variables;
- active formula version;
- variables snapshots.

---

### Snapshot Architecture

Estimate должен сохранять:
- customer snapshot;
- route snapshot;
- item snapshot;
- variables snapshot;
- formula version;
- pricing result.

---

## Deliverables

```text
Database schema
Estimate persistence
Variables persistence
Snapshot persistence
```

---

# 6. Phase 3 — Pricing Engine

## Priority

```text
Critical
```

---

## Goal

Реализовать centralized backend pricing engine.

---

## Scope

### Input Normalization

- dimensions validation;
- weight validation;
- quantity normalization.

---

### Volume Logic

- physical volume;
- effective volume;
- stackability logic;
- crating impact.

---

### Vehicle Logic

- vehicle fit;
- multi-vehicle logic;
- capacity validation.

---

### Operational Cost

- pickup cost;
- interstate cost;
- delivery cost;
- fuel cost;
- labor cost;
- route cost.

---

### Additional Charges

- packaging;
- crating;
- storage;
- insurance;
- zone fees;
- exclusive delivery.

---

### Discounts

- shared pickup;
- shared delivery;
- route consolidation.

---

### Margin & Rounding

- margin calculation;
- rounding rules;
- final customer-facing price.

---

## Deliverables

```text
Backend pricing engine
Calculation API
Estimate calculation result
Breakdown output
```

---

# 7. Phase 4 — External Integrations

## Priority

```text
High
```

---

## Goal

Подключить external services.

---

## Planned Integrations

### Fuel Pricing

```text
AAA Fuel Prices API
```

---

### Distance & Routing

```text
Google Maps API
Mapbox API
```

---

### CRM

```text
Kommo CRM
```

---

### Payments

```text
Stripe
Square
```

---

### Communications

```text
Email Service
SMS Service
```

---

## Deliverables

```text
Live fuel updates
Distance calculations
Estimate delivery
Invoice generation
Payment links
```

---

# 8. Phase 5 — Invoice Layer

## Goal

Добавить payment workflow.

---

## Scope

### Invoice Generation

- estimate → invoice;
- deposit tracking;
- balance tracking.

---

### Payment Statuses

```text
Unpaid
Partial
Paid
Refunded
```

---

### Payment Providers

- Stripe;
- Square.

---

## Deliverables

```text
Invoice entity
Payment workflow
Payment links
Invoice statuses
```

---

# 9. Phase 6 — Operational Layer

## Priority

```text
High
```

---

## Goal

Реализовать operational execution workflow.

---

## Scope

### Orders

- order creation;
- operational statuses;
- team assignment.

---

### eBOL

- item verification;
- pickup workflow;
- delivery workflow;
- signatures;
- POD.

---

### Item Photos

- pickup photos;
- delivery photos;
- damage photos.

---

### Damage Workflow

- issue reporting;
- claim support;
- operational audit.

---

## Deliverables

```text
orders.html
eBOL workflow
Photo workflow
Operational statuses
POD generation
```

---

# 10. Phase 7 — Dispatch & Routing

## Goal

Добавить dispatch planning.

---

## Scope

### Route Planning

- route grouping;
- route optimization;
- shared delivery logic.

---

### Dispatch Assignment

- truck assignment;
- crew assignment;
- schedule coordination.

---

### Warehouse Logic

- storage tracking;
- warehouse statuses;
- storage release workflow.

---

## Deliverables

```text
Dispatch dashboard
Route planning
Warehouse workflow
```

---

# 11. Phase 8 — Analytics & Optimization

## Goal

Создать operational analytics layer.

---

## Scope

### Pricing Analytics

- profitability;
- margin analysis;
- pricing accuracy.

---

### Operational Analytics

- delivery performance;
- claims;
- damages;
- crew performance.

---

### Forecasting

- seasonal demand;
- route utilization;
- storage forecasting.

---

## Deliverables

```text
Operational dashboards
Margin analytics
Route analytics
Forecasting layer
```

---

# 12. Technical Priorities

## Highest Priority

```text
Estimate snapshot integrity
```

Без snapshot integrity:
- pricing станет нестабильным;
- auditability потеряется;
- historical estimates сломаются.

---

## Second Priority

```text
Pricing engine centralization
```

Pricing logic не должна находиться:
- в UI;
- в spreadsheets;
- в multiple services.

---

## Third Priority

```text
Operational separation
```

Orders/eBOL не должны изменять:
- estimate;
- pricing;
- variables.

---

# 13. MVP Constraints

На текущем этапе НЕ требуется:

- production-ready frontend;
- mobile applications;
- authentication system;
- real dispatcher board;
- live operational routing;
- microservices architecture.

---

# 14. Recommended Technical Sequence

## Correct Sequence

```text
1. Backend Foundation
2. Pricing Engine
3. Integrations
4. Invoice Layer
5. Orders / eBOL
6. Dispatch
7. Analytics
```

---

## Incorrect Sequence

```text
Dispatcher Board
↓
Operations
↓
Pricing Later
```

Это приведёт к:
- fragmented logic;
- duplicated calculations;
- unstable pricing;
- poor auditability.

---

# 15. Key Architectural Rules

## Rule 1

```text
Pricing engine owns calculations.
```

---

## Rule 2

```text
Estimate must remain immutable after sending.
```

---

## Rule 3

```text
Orders and eBOL use frozen estimate snapshot.
```

---

## Rule 4

```text
UI must remain simple for brokers.
```

---

## Rule 5

```text
Operational complexity must stay outside
of broker workflow.
```
