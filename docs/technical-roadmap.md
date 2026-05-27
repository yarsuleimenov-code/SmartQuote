# Zaberman Broker Calculator MVP — Technical Roadmap

# 1. Назначение документа

Документ фиксирует:
- стратегию развития системы;
- sequencing разработки;
- архитектурные приоритеты;
- dependency order;
- MVP boundaries;
- roadmap phases;
- технические ограничения.

Основная задача roadmap:
- предотвратить хаотичную разработку;
- избежать premature integrations;
- стабилизировать architecture до backend phase;
- обеспечить predictable system evolution.

---

# 2. Текущий статус проекта

Текущий статус:

```text
Workflow MVP / Architecture Prototype
```

---

## Текущая цель проекта

Система проектируется как:
- broker-first pricing platform;
- operational workflow foundation;
- centralized pricing architecture;
- future eBOL operational system.

---

## Текущий scope MVP

Реализованы:
- quote workflow;
- breakdown workflow;
- pricing governance screens;
- formulas documentation;
- eBOL workflow concept;
- operational workflow modeling;
- reusable UI structure.

---

## Реализованные экраны

```text
index.html
breakdown.html
ebol.html
variables.html
formulas.html
drafts.html
estimates.html
```

---

# 3. Основные цели roadmap

Roadmap должен обеспечить:

```text
Stable Architecture
↓
Stable Pricing Flow
↓
Backend Foundation
↓
Operational Scalability
```

---

## Ключевые цели

- centralized pricing logic;
- explainable pricing;
- immutable snapshots;
- operational workflow consistency;
- scalable architecture;
- separation of concerns;
- auditability;
- integration readiness.

---

# 4. Главные архитектурные принципы

## Principle 1 — Broker First

Главный workflow должен оставаться:
- быстрым;
- простым;
- минималистичным.

---

## Principle 2 — Layer Separation

```text
Commercial Layer
≠
Operational Layer
```

---

## Principle 3 — Pricing Ownership

```text
Pricing Engine
=
Single Source of Truth
```

---

## Principle 4 — Immutable Estimates

```text
Estimate immutable.
Draft editable.
```

---

## Principle 5 — Snapshot Integrity

Historical estimates:
- не должны пересчитываться;
- не должны зависеть от future variables changes.

---

# 5. Architecture Freeze Milestone

Перед:
- backend;
- integrations;
- database implementation;

необходимо завершить stabilization phase.

---

## Architecture Freeze включает

```text
Entity Stabilization
Pricing Flow Stabilization
Lifecycle Stabilization
Workflow Stabilization
Boundary Stabilization
```

---

## Главная цель

```text
Сначала стабилизировать архитектуру.
Потом строить backend.
```

---

# 6. MVP Exit Criteria

MVP считается завершённым только после достижения:

```text
Stable Workflows
Stable Entities
Stable Pricing Flow
Stable Navigation
Stable Layout
Explainable Pricing
Demo-Ready Operational Flow
```

---

## MVP не считается завершённым если

- pricing logic постоянно меняется;
- lifecycle не зафиксирован;
- entities продолжают меняться;
- отсутствует snapshot consistency;
- UI ownership не определён;
- workflow нестабилен.

---

# 7. Non-Goals

Следующие функции не входят в ближайшие этапы roadmap:

```text
AI Pricing
Marketplace Platform
Customer Portal
Advanced Route Optimization
Warehouse WMS
Multi-Tenant Architecture
Predictive Pricing
Real-Time Fleet Optimization
```

---

## Причина

Приоритет:
- стабильная architecture;
- pricing consistency;
- operational workflow;
- backend foundation.

---

# 8. Текущая MVP Phase

## Phase 1 — Workflow Prototype

Статус:

```text
IN PROGRESS
```

---

## Цели phase

- визуализировать workflow;
- стабилизировать entities;
- стабилизировать lifecycle;
- зафиксировать pricing flow;
- подготовить backend architecture.

---

## Deliverables

```text
Wireframes
Workflow Screens
Documentation
Entity Model
Pricing Flow
eBOL Workflow
Architecture Docs
```

---

# 9. Phase 2 — Frontend Stabilization

## Цель

Стабилизировать frontend architecture.

---

## Основные задачи

- reusable layout;
- centralized UI components;
- shared navigation;
- consistent table patterns;
- responsive cleanup;
- state preparation;
- UI normalization.

---

## Deliverables

```text
layout.js
shared UI components
navigation consistency
stable workflows
UI cleanup
```

---

# 10. Refactoring Window

После frontend stabilization должен быть отдельный этап:

```text
Architecture Cleanup / Refactor
```

---

## Цель

- удалить MVP hacks;
- cleanup duplicated logic;
- cleanup temporary solutions;
- cleanup inconsistent UI patterns;
- стабилизировать codebase.

---

## Ключевое правило

```text
Temporary MVP logic
не должна становиться
permanent architecture.
```

---

# 11. Phase 3 — Backend Foundation

## Цель

Создать backend foundation.

---

## Основные задачи

```text
API Layer
Database Foundation
Authentication
Entity Persistence
Snapshot Persistence
Basic Services
```

---

## Deliverables

```text
Backend API
Entity Services
Authentication
Persistence Layer
Infrastructure Foundation
```

---

## Важное ограничение

Backend phase начинается:
- только после architecture freeze;
- только после stabilized entity model.

---

# 12. Phase 4 — Pricing Engine

## Цель

Перенос pricing logic в centralized backend engine.

---

## Основные задачи

```text
Calculation Engine
Variables Service
Formula Versioning
Snapshot Service
Rounding Engine
Pricing Audit
```

---

## Deliverables

```text
Centralized Pricing Engine
Calculation APIs
Variables Governance
Immutable Snapshots
Pricing Auditability
```

---

## Ключевой принцип

```text
Pricing logic
не должна жить в frontend.
```

---

# 13. Phase 5 — Operational Layer

## Цель

Построение operational execution system.

---

## Основные задачи

```text
Orders
Dispatch Workflow
eBOL Workflow
POD Workflow
Exception Workflow
Photo Workflow
Operational Statuses
```

---

## Deliverables

```text
Operational Services
Order Lifecycle
eBOL System
POD Generator
Exception Tracking
```

---

# 14. Phase 6 — Integrations

## Цель

Подключение внешних систем.

---

## Планируемые integrations

```text
Kommo CRM
Maps APIs
Fuel APIs
Stripe / Square
SMS / Email Services
Dispatch Systems
Storage Systems
```

---

## Ключевое правило

```text
Integrations
только после
stable core architecture.
```

---

# 15. Phase 7 — Mobile / Driver Workflow

## Цель

Operational mobile workflow.

---

## Основные задачи

```text
Mobile eBOL
Photo Upload
Driver Workflow
Delivery Verification
Signature Collection
Operational Status Updates
```

---

## Deliverables

```text
Driver App
Mobile eBOL
Operational Mobile Workflow
Photo Workflow
```

---

# 16. Phase 8 — Analytics / BI

## Цель

Operational analytics и business visibility.

---

## Основные задачи

```text
Pricing Analytics
Operational Analytics
Margin Analytics
Exception Analytics
Dispatch Analytics
```

---

## Deliverables

```text
Dashboards
BI Layer
Operational Reporting
Pricing Reporting
```

---

# 17. Dependency Order

Главный архитектурный принцип:

```text
Core Architecture
before
Integrations
```

---

## Правильная последовательность

```text
Entity Stability
↓
Pricing Flow Stability
↓
Lifecycle Stability
↓
Frontend Stabilization
↓
Backend Foundation
↓
Pricing Engine
↓
Operational Services
↓
Integrations
↓
Mobile Workflow
↓
Analytics
```

---

## Недопустимая последовательность

```text
UI
↓
Integrations
↓
Backend
↓
Architecture Later
```

---

# 18. Single Source of Truth

## Pricing Ownership

```text
Pricing Engine
=
Single Source of Truth
для pricing logic.
```

---

## Operational Ownership

```text
Operational Layer
=
Single Source of Truth
для execution workflow.
```

---

## Estimate Ownership

```text
Estimate Snapshot
=
Single Source of Truth
для historical pricing.
```

---

# 19. Technical Debt Policy

Допускаются:
- temporary frontend calculations;
- temporary UI logic;
- prototype-level simplifications.

---

## Ограничение

```text
Temporary logic
должна быть удалена
до production backend phase.
```

---

## Недопустимо

```text
Permanent frontend formulas
Duplicated pricing logic
Hidden business rules in UI
```

---

# 20. Demo vs Production Boundary

Текущий проект является:

```text
Workflow MVP / Architecture Prototype
```

---

## MVP используется для

- workflow validation;
- pricing modeling;
- operational modeling;
- business alignment;
- backend preparation.

---

## MVP не является

```text
Production-ready system
```

---

# 21. Auditability Priority

Система должна поддерживать:

```text
Pricing Audit
Estimate History
Operational History
Exception History
Formula Version Tracking
Variables Snapshot Tracking
```

---

## Причина

Необходимы:
- explainable pricing;
- reproducible estimates;
- dispute resolution;
- operational auditability.

---

# 22. Migration Strategy

Будущая архитектура должна учитывать migration phase.

---

## Потенциальные источники migration

```text
Google Sheets
Kommo Fields
Manual Calculations
Operational Spreadsheets
Legacy Pricing Logic
```

---

## Migration Goals

```text
Centralized Pricing
Unified Workflow
Consistent Operational Logic
Removal of Duplicated Calculations
```

---

# 23. Основные технические риски

## Risk 1 — Pricing Logic в UI

Последствия:
- inconsistent pricing;
- difficult maintenance;
- duplicated logic.

---

## Решение

```text
Centralized Backend Pricing Engine
```

---

## Risk 2 — Draft и Estimate смешаны

Последствия:
- mutable estimates;
- historical inconsistency;
- pricing disputes.

---

## Решение

```text
Draft editable
Estimate immutable
```

---

## Risk 3 — Operational Layer смешан с Calculator

Последствия:
- overloaded UI;
- slower quote creation;
- workflow degradation.

---

## Решение

```text
Commercial Layer
≠
Operational Layer
```

---

## Risk 4 — No Snapshot Integrity

Последствия:
- historical recalculation;
- broken auditability;
- inconsistent estimates.

---

## Решение

```text
Immutable Snapshots
+
Variables Snapshot
+
Formula Version Snapshot
```

---

# 24. Целевая backend архитектура

```text
Frontend UI
↓
API Layer
↓
Pricing Engine
↓
Operational Services
↓
Snapshot Service
↓
Database
```

---

# 25. Главный архитектурный приоритет

```text
Простота broker workflow
важнее количества функций.
```

---

## UI Principle

Broker UI должен:
- оставаться быстрым;
- оставаться простым;
- минимизировать operational complexity.

---

## Сложность должна находиться

```text
Pricing Engine
Backend Logic
Operational Services
```

---

# 26. Главный риск проекта

Главный риск:

```text
Смешивание pricing,
operational workflow
и UI logic.
```

---

## Последствия

- unstable architecture;
- duplicated calculations;
- inconsistent pricing;
- difficult maintenance;
- impossible auditability.

---

## Основное решение

```text
Strict Layer Separation
+
Centralized Pricing Engine
+
Immutable Snapshots
+
Operational Boundaries
```

---

# 27. Назначение roadmap

Roadmap фиксирует:
- последовательность развития системы;
- dependency order;
- architecture priorities;
- MVP boundaries;
- backend preparation;
- operational scaling strategy.

Основная задача:
- обеспечить controlled system evolution;
- предотвратить хаотичную разработку;
- сохранить architecture consistency;
- подготовить foundation для production system.
