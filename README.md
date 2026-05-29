# Zaberman Broker Calculator

Hi-fi wireframe и visual technical specification для production-разработки Zaberman Broker Calculator.

Проект описывает broker-first workflow для interstate-перевозок мебели, fragile cargo, full service delivery, estimate generation, invoice/order lifecycle и будущего eBOL/POD workflow.

---

# Важное предупреждение

Этот репозиторий является **hi-fi wireframe / visual technical specification**, а не production-ready реализацией.

Текущий код используется для демонстрации:

- workflow брокера;
- структуры экранов;
- UX quote creation;
- customer-facing estimate;
- pricing breakdown concept;
- draft / estimate / invoice / order / eBOL lifecycle;
- ожидаемых сущностей и полей;
- направления для будущей backend architecture.

В текущем коде используются:

- mock data;
- hardcoded values;
- статичные суммы;
- статичные customers;
- статичные routes;
- статичные items;
- статичные dates;
- статичные statuses;
- визуальные placeholders для будущих production-функций.

Статичные значения в HTML-файлах не должны использоваться как production logic.

Production implementation должна строиться отдельно и включать:

- backend pricing engine;
- quote draft persistence;
- estimate snapshots;
- validation;
- audit trail;
- PDF/export flow;
- backend storage;
- tested business formulas.

Перед началом production-разработки обязательно прочитать:

[DEVELOPER_HANDOFF.md](./DEVELOPER_HANDOFF.md)

---

# Статус проекта

```text
Hi-Fi Wireframe / Visual Technical Specification / Workflow Prototype
```

Текущий репозиторий используется для:

- проектирования workflow;
- моделирования pricing logic на уровне visual/reference specification;
- согласования бизнес-логики;
- подготовки backend architecture;
- демонстрации operational concept;
- alignment между business / CEO / development;
- передачи production-команде визуального и технического направления.

Важно:

- текущие HTML-экраны являются wireframe/spec;
- данные в экранах являются mock data;
- расчеты и значения являются hardcoded examples;
- production pricing engine должен быть реализован отдельно;
- frontend не должен хранить production formulas или business calculations;
- historical estimates должны строиться через immutable snapshots.

---

# Основная идея системы

Калькулятор должен оставаться:

- простым;
- быстрым;
- интуитивным;
- удобным для ежедневной работы брокеров.

Брокер должен:

- создать quote;
- указать customer data;
- указать pickup/delivery route;
- добавить shipment items;
- указать access conditions;
- получить estimate;
- отправить клиенту customer-facing price.

Сложность должна находиться:

- внутри pricing engine;
- в backend services;
- в operational workflows;
- в versioned pricing variables;
- в snapshot architecture.

Брокер не должен:

- вручную рассчитывать стоимость;
- подбирать vehicle вручную;
- интерпретировать formulas;
- рассчитывать operational complexity;
- помнить все access/insurance/helper rules.

---

# Главный Workflow

```text
Broker UI
↓
Quote Draft
↓
Validation
↓
Pricing Engine
↓
Pricing Breakdown
↓
Estimate Snapshot
↓
Customer-Facing Estimate
↓
Invoice
↓
Order
↓
eBOL / POD
↓
Operational Execution
```

---

# Основные бизнес-цели

- уменьшение ручных расчетов;
- стандартизация pricing logic;
- ускорение создания quote;
- снижение pricing inconsistencies;
- централизация operational pricing;
- подготовка foundation для eBOL;
- переход к unified operational workflow;
- улучшение auditability estimate;
- разделение commercial layer и operational execution layer.

---

# Архитектурные принципы

## Broker-First Workflow

Основной workflow должен помещаться в один рабочий процесс:

```text
Route
↓
Items
↓
Access Conditions
↓
Quote Options
↓
Pricing Result
↓
Generate Estimate
```

Broker UI должен быть быстрым и понятным, но не должен содержать production pricing logic.

## Разделение слоев

```text
Calculator = commercial pricing layer
Orders/eBOL = operational execution layer
```

Calculator отвечает за:

- quote draft;
- pricing calculation;
- estimate;
- invoice foundation.

Operational layer отвечает за:

- order execution;
- pickup;
- delivery;
- item verification;
- photos;
- signatures;
- exceptions;
- POD;
- eBOL.

## Backend Pricing Engine

Pricing logic должна принадлежать centralized pricing engine.

Целевая архитектура:

```text
User Input
↓
Validation
↓
Pricing Engine
↓
Calculation Result
↓
Snapshot
↓
UI Display / Estimate Document
```

Frontend не должен хранить:

- production formulas;
- pricing rules;
- business calculations;
- margin logic;
- insurance logic;
- route cost allocation logic.

---

# Snapshot Integrity

Каждый generated estimate должен фиксировать immutable snapshot:

```text
Customer Data
Route Data
Items
Access Conditions
Quote Options
Variables Snapshot
Formula Version
Pricing Breakdown
Final Rounded Price
Generated Document Metadata
```

Historical estimates не должны автоматически пересчитываться после:

- изменения pricing variables;
- изменения fuel rates;
- изменения formula version;
- изменения margin rules;
- изменения route allocation logic.

Если quote меняется после отправки estimate клиенту, должна создаваться:

- новая estimate version; или
- reopened draft на основе предыдущего estimate.

---

# Основные экраны

## index.html

Главный рабочий экран брокера.

Содержит:

- customer info;
- ZIP-based route;
- items table;
- access conditions;
- quote options;
- estimate summary;
- Generate Estimate action.

Назначение:

- быстрое ежедневное создание quote.

Production-команда должна реализовать:

- real QuoteDraft state;
- item CRUD;
- validation;
- recalculation through pricing engine;
- autosave;
- estimate snapshot generation.

---

## breakdown.html

Экран pricing breakdown и audit calculations.

Содержит:

- operational cost structure;
- additional charges;
- margin logic;
- rounding logic;
- pricing explanation.

Назначение:

- auditability;
- transparency;
- CEO/dev review;
- проверка расчетной структуры.

Production-команда должна реализовать:

- read-only breakdown из pricing engine;
- formula version;
- variables snapshot reference;
- component-level cost explanation.

---

## estimate-document.html

Customer-facing estimate document.

Содержит:

- estimate ID;
- customer details;
- route;
- shipment items;
- pricing summary;
- liability/protection language;
- key terms;
- customer acceptance;
- print/save PDF flow.

Назначение:

- показать, как должен выглядеть customer-facing estimate.

Production-команда должна реализовать:

- generation from EstimateSnapshot;
- PDF artifact generation или controlled print/PDF flow;
- document versioning;
- legal text ownership;
- generated_at/generated_by metadata.

---

## drafts.html

Управление quote drafts.

Назначение:

- открыть незавершенный draft;
- продолжить работу;
- duplicate draft;
- удалить/архивировать draft.

Production-команда должна реализовать:

- backend persistence;
- broker ownership;
- autosave;
- search/filter/sort;
- pagination;
- soft delete.

---

## estimates.html

История generated estimates.

Назначение:

- view sent estimates;
- track statuses;
- reopen draft;
- send again;
- convert to invoice/order.

Production-команда должна реализовать:

- estimate lifecycle;
- versioning;
- expiration;
- customer view tracking;
- conversion workflows.

---

## invoices.html

Будущий invoice workflow.

Назначение:

- invoice generation;
- payment tracking;
- payment provider integration.

Production-команда должна реализовать:

- Invoice entity;
- payment status;
- invoice document;
- payment link;
- Stripe/Square or selected provider integration.

---

## orders.html

Будущий order workflow после approved estimate.

Назначение:

- operational execution;
- dispatch workflow;
- order lifecycle.

Production-команда должна реализовать:

- Order entity;
- conversion from Estimate;
- status transitions;
- route assignment;
- dispatch/operations integration.

---

## ebol.html

Operational execution screen.

Содержит:

- item verification;
- pickup/delivery statuses;
- photos;
- comments;
- signatures;
- exceptions;
- POD workflow.

Назначение:

- operational verification;
- proof workflow;
- future electronic BOL.

Production-команда должна реализовать:

- eBOL state machine;
- item-level pickup/delivery verification;
- photo upload;
- signature capture;
- exceptions workflow;
- POD/eBOL artifact generation.

---

## variables.html

Administrative pricing governance screen.

Содержит:

- pricing variables;
- fuel logic;
- operational coefficients;
- vehicle logic;
- stackability logic;
- helper rules;
- COI fees;
- crating/packaging variables.

Назначение:

- централизованное управление pricing configuration.

Production-команда должна реализовать:

- versioned PricingVariables;
- permissions;
- audit log;
- activation timestamps;
- immutable variable snapshots for estimates.

---

## formulas.html

Документация formulas и pricing logic.

Назначение:

- documentation;
- development alignment;
- pricing governance;
- QA reference.

Production-команда должна реализовать:

- executable pricing formulas;
- unit tests;
- fixtures;
- edge-case coverage;
- versioned formula releases.

---

## references.html

Reference data area.

Назначение:

- operational reference tables;
- lookup values;
- route/pricing references.

Production-команда должна реализовать:

- source-of-truth reference data;
- admin editing;
- import/export;
- versioning.

---

## lifecycle.html

Visual lifecycle reference.

Назначение:

- показать переходы между draft, estimate, invoice, order, eBOL.

Production-команда должна реализовать:

- formal state machines;
- allowed transitions;
- role-based actions;
- audit events.

---

# Domain Entities

Production-система должна включать следующие основные сущности:

- QuoteDraft;
- QuoteItem;
- PricingVariables;
- PricingBreakdown;
- Estimate;
- EstimateSnapshot;
- Customer;
- Invoice;
- Order;
- eBOL.

Подробное описание сущностей находится в:

[DEVELOPER_HANDOFF.md](./DEVELOPER_HANDOFF.md)

---

# Pricing Structure

## Operational Cost

```text
Operational Cost =
Pickup Stage
+
Interstate Stage
+
Delivery Stage
```

Operational Cost может включать:

- labor;
- mileage;
- fuel;
- handling;
- tolls;
- parking;
- access complexity;
- route allocation;
- driver cost;
- vehicle cost.

---

## Additional Charges

```text
Packaging
Crating
Storage
Insurance / Protection
Exclusive Delivery
Access Fees
COI Fees
Zone Fees
Extra Helpers
Priority Date
```

Additional charges должны рассчитываться отдельно от stage costs, чтобы избежать double counting.

---

## Effective Volume Logic

Система должна рассчитывать:

- physical volume;
- item total volume;
- total shipment volume;
- stackability coefficient;
- effective volume;
- total effective volume.

Fragile и non-stackable items могут увеличивать effective volume и влиять на:

- vehicle fit;
- operational pricing;
- crew requirement;
- manual review flag;
- required handling.

Точная coefficient logic должна быть подтверждена business stakeholders до production implementation.

---

## Helper Logic

Additional helpers:

- рассчитываются отдельно;
- имеют minimum billable time;
- должны зависеть от item weight, access conditions, handling complexity и manual override rules.

Crew requirement может определяться:

- весом;
- effective volume;
- access conditions;
- floor/stairs/elevator;
- long carry;
- fragile/non-stackable/crated flags;
- operational complexity.

---

## Final Price Logic

Conceptual target:

```text
Raw Final Price =
Operational Cost
+
Additional Charges
+
Margin
-
Discounts
```

```text
Rounded Final Price =
CEILING(Raw Final Price, 10)
```

Важно:

- это conceptual formula;
- production margin formula должна быть подтверждена отдельно;
- all formulas must be implemented in pricing engine;
- all formulas must be tested.

---

# Required Production Architecture

Production implementation должна включать:

- frontend application;
- backend API;
- pricing engine;
- database;
- validation layer;
- audit trail;
- PDF/export service;
- authentication;
- authorization;
- file storage;
- integration layer.

Минимальный backend scope:

- QuoteDraft persistence;
- QuoteItem persistence;
- PricingVariables versioning;
- pricing calculation endpoint;
- EstimateSnapshot generation;
- Estimate document generation;
- Drafts/Estimates history;
- Invoice conversion;
- Order conversion;
- eBOL/POD foundation.

---

# API Expectations

Production API should support:

```text
POST   /api/quotes
GET    /api/quotes/:id
PATCH  /api/quotes/:id
DELETE /api/quotes/:id

POST   /api/quotes/:id/items
PATCH  /api/quotes/:id/items/:itemId
DELETE /api/quotes/:id/items/:itemId

POST   /api/pricing/calculate
GET    /api/pricing/variables/current
POST   /api/quotes/:id/generate-estimate

GET    /api/estimates/:id
POST   /api/estimates/:id/send
POST   /api/estimates/:id/reopen-draft
POST   /api/estimates/:id/convert-to-invoice
POST   /api/estimates/:id/convert-to-order

GET    /api/invoices/:id
GET    /api/orders/:id
GET    /api/orders/:id/ebol
PATCH  /api/orders/:id/ebol
```

Pricing response should include:

- formula version;
- variables version;
- validation errors;
- validation warnings;
- pricing breakdown;
- final price;
- manual review flags.

---

# Структура репозитория

```text
/
├── index.html
├── breakdown.html
├── estimate-document.html
├── quick-quote.html
├── drafts.html
├── estimates.html
├── invoices.html
├── orders.html
├── ebol.html
├── formulas.html
├── variables.html
├── references.html
├── lifecycle.html
├── sidebar.js
├── README.md
├── DEVELOPER_HANDOFF.md
│
└── /docs
    ├── architecture.md
    ├── entity-model.md
    ├── pricing-engine-flow.md
    ├── pricing-test-cases.md
    ├── operational-edge-cases.md
    ├── ebol-workflow.md
    └── technical-roadmap.md
```

---

# Технологический стек

Текущий prototype:

- HTML;
- TailwindCSS CDN;
- Lucide Icons CDN;
- static frontend-only pages;
- mock data;
- hardcoded values.

Текущий prototype не имеет:

- backend;
- database;
- production pricing engine;
- authentication;
- role-based permissions;
- API integrations;
- PDF artifact generation;
- payment integration;
- real-time calculations;
- production eBOL;
- test suite.

Production implementation:

- должна строиться отдельно;
- должна использовать backend pricing engine;
- должна иметь database persistence;
- должна иметь validation;
- должна иметь audit trail;
- должна иметь controlled PDF/export flow;
- должна иметь tests for pricing formulas.

---

# Что пока НЕ реализовано

```text
Backend
Database
Production-ready pricing engine
Authentication
Authorization
API integrations
CRM integration
PDF artifact generation
Payments
Production eBOL
Real-time calculations
State management
Local storage / backend autosave
Validation
Audit trail
Security hardening
Mobile production UX
```

---

# MVP Implementation Priorities

Recommended MVP priorities:

1. Pricing engine.
2. Quote draft persistence.
3. Estimate snapshot.
4. Item CRUD.
5. Validation.
6. Estimate document generation.
7. PDF/export flow.
8. Drafts and estimates list.
9. Basic invoice conversion.
10. Basic order conversion.
11. Basic eBOL/POD workflow.

MVP acceptance baseline:

- broker can create QuoteDraft;
- broker can add/edit/delete items;
- broker can save and resume draft;
- system validates required data;
- system calculates price through pricing engine;
- system returns explainable breakdown;
- broker can generate EstimateSnapshot;
- customer-facing estimate is generated from snapshot;
- sent estimate remains immutable;
- changes after sending create a new version or reopened draft;
- estimate can be converted into invoice/order.

---

# Open Business Questions

Before production implementation, business stakeholders must confirm:

- margin formula;
- fuel allocation;
- insurance/protection model;
- volume coefficient logic;
- interstate vs local pricing;
- payment terms;
- cancellation terms;
- quote expiration logic;
- minimum quote logic;
- manual approval thresholds;
- discount approval rules;
- legal language for estimates and liability.

---

# Реализованная документация

В `/docs` уже находятся:

- architecture.md;
- entity-model.md;
- pricing-engine-flow.md;
- pricing-test-cases.md;
- operational-edge-cases.md;
- ebol-workflow.md;
- technical-roadmap.md.

Дополнительно должен быть добавлен:

- DEVELOPER_HANDOFF.md.

Документация покрывает:

- pricing architecture;
- operational workflows;
- entity relationships;
- estimate lifecycle;
- edge cases;
- implementation roadmap;
- developer handoff expectations.

---

# Назначение репозитория

Репозиторий используется для:

- business validation;
- workflow architecture;
- operational modeling;
- pricing engine design;
- system specification;
- CEO/dev alignment;
- подготовки backend architecture;
- передачи production-команде визуального ТЗ.

Этот repository should guide production development, but production development must not reuse static screen calculations as implementation logic.
