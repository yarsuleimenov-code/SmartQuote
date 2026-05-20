# Zaberman Broker Calculator MVP

Operational pricing system для interstate-перевозок мебели, fragile cargo, white-glove delivery и будущих eBOL workflows.

Проект разрабатывается как broker-first operational calculator с акцентом на:
- быстрое создание quote;
- централизованную pricing logic;
- operational transparency;
- future scalability.

---

# Видение проекта

Калькулятор должен оставаться:

- простым;
- быстрым;
- интуитивным;
- эффективным в ежедневной работе.

Брокер должен заниматься формированием quote, а не разбираться во внутренней сложности системы.

Сложность должна находиться:
- внутри pricing engine;
- backend logic;
- operational workflows.

---

# Бизнес-цели

- Снижение количества ручных расчётов
- Стандартизация pricing logic
- Ускорение формирования quote
- Централизация operational pricing
- Повышение прозрачности расчётов
- Снижение pricing inconsistencies
- Подготовка foundation для eBOL и operational execution workflows

---

# Основные принципы

## Broker-First Workflow

Основной workflow должен помещаться в один рабочий экран.

Workflow брокера:

- ввести customer data;
- указать route;
- добавить items;
- получить final quote;
- отправить estimate.

Брокер не должен:
- вручную рассчитывать стоимость;
- вручную выбирать vehicle;
- интерпретировать formulas;
- рассчитывать operational complexity.

---

## Разделение слоёв

```text
Calculator = commercial pricing layer
Orders/eBOL = operational execution layer
```

Калькулятор отвечает за:
- quote;
- estimate;
- invoice foundation.

Operational layer отвечает за:
- pickup;
- delivery;
- POD;
- eBOL;
- photos;
- signatures.

---

## Backend Pricing Ownership

Pricing logic должна принадлежать centralized backend pricing engine.

UI не должен содержать:
- formulas;
- calculations;
- pricing rules.

Правильная архитектура:

```text
User Input
↓
Backend Pricing Engine
↓
Calculation Result
↓
UI Display
```

---

## Snapshot Integrity

Каждый generated estimate должен фиксировать snapshot:

```text
Customer Data
Route Data
Items
Variables Snapshot
Formula Version
Pricing Result
Final Rounded Price
```

Historical estimates не должны автоматически пересчитываться.

---

# Основной Workflow

## 1. Создание Quote

Брокер заполняет:
- pickup / delivery;
- customer info;
- items;
- dimensions;
- weight;
- packaging;
- insurance;
- storage;
- access conditions.

---

## 2. Pricing Calculation

Система автоматически рассчитывает:
- physical volume;
- effective volume;
- vehicle fit;
- operational cost;
- additional charges;
- discounts;
- margin;
- final rounded price.

---

## 3. Estimate Generation

Брокер получает:
- customer-facing estimate;
- rounded final price;
- operational breakdown;
- frozen estimate snapshot.

---

# Основные экраны

## index.html

Главный рабочий экран брокера.

Содержит:
- customer info;
- route info;
- quote options;
- items table;
- operational conditions;
- final price preview.

Назначение:
- быстрое ежедневное создание quote.

---

## breakdown.html

Экран breakdown и audit pricing calculations.

Содержит:
- operational cost structure;
- additional charges;
- pricing explanation;
- formulas;
- margin logic;
- rounding logic.

Назначение:
- operational transparency;
- CEO/dev review;
- auditability.

---

## variables.html

Административный экран pricing governance.

Содержит:
- pricing variables;
- fuel logic;
- vehicle parameters;
- stackability coefficients;
- crating variables;
- operational coefficients;
- formula references;
- pricing governance logic.

Назначение:
- централизованное управление pricing configuration.

---

## drafts.html

Экран управления drafts.

Содержит:
- autosaved drafts;
- editable quotes;
- duplicate/reopen workflow.

Назначение:
- поддержка рабочего процесса брокера.

---

## estimates.html

Экран отправленных estimates.

Содержит:
- generated estimates;
- estimate statuses;
- customer-facing pricing history.

Назначение:
- управление lifecycle estimates.

---

# Структура Pricing

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
- access complexity.

---

## Additional Charges

```text
Packaging
Crating
Storage
Insurance
Exclusive Delivery
Access Fees
Zone Fees
```

Additional Charges не должны дублировать operational stage costs.

---

## Effective Volume Logic

Система рассчитывает:
- physical volume;
- effective volume;
- stackability impact.

Non-stackable и fragile items увеличивают effective volume и влияют на:
- vehicle fit;
- operational pricing.

---

## Vehicle Logic

Система автоматически определяет:
- vehicle type;
- vehicle quantity;
- route capacity fit.

Поддерживаемая future logic:
- multi-vehicle shipments;
- oversized cargo;
- route consolidation.

---

## Margin Logic

```text
Margin =
(
Operational Cost
+
Additional Charges
)
×
Margin Rate
```

---

## Final Price Logic

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

---

# Реализованная документация

Репозиторий уже содержит:

- architecture.md
- entity-model.md
- pricing-engine-flow.md
- pricing-test-cases.md
- operational-edge-cases.md
- ebol-workflow.md
- technical-roadmap.md

Документы описывают:
- pricing architecture;
- entity relationships;
- operational workflows;
- edge cases;
- estimate lifecycle;
- implementation roadmap.

---

# Текущий статус проекта

## Current State

```text
MVP / Wireframe Prototype
```

Frontend stack:
- HTML
- TailwindCSS
- Lucide Icons

Репозиторий сфокусирован на:
- workflow design;
- pricing architecture;
- operational logic;
- подготовке backend architecture.

---

## Backend Status

Backend пока не реализован.

Не реализовано:
- database;
- pricing engine;
- authentication;
- API integrations;
- payment processing;
- PDF generation;
- production eBOL workflow.

---

# Планируемые функции

## Pricing Engine

- centralized backend pricing engine
- dynamic fuel pricing
- route optimization
- automatic vehicle fit
- operational scheduling logic

---

## Commercial Layer

- estimate PDF generation
- Stripe / Square integration
- invoice workflow
- customer communication

---

## Operational Layer

- Orders
- eBOL
- POD workflow
- item-level photos
- pickup/delivery verification
- damage workflow
- warehouse storage workflow

---

## Dispatch Layer

- dispatch dashboard
- route planning
- crew assignment
- warehouse coordination

---

# Назначение репозитория

Репозиторий используется для:
- workflow architecture;
- pricing engine design;
- operational modeling;
- system specification;
- business validation;
- CEO/dev alignment;
- подготовки backend architecture.

---

# Целевая архитектура

```text
Broker UI
↓
Quote Draft
↓
Pricing Engine
↓
Estimate Snapshot
↓
Invoice
↓
Order
↓
eBOL
↓
Operational Execution
```

Калькулятор должен оставаться простым для брокеров.

Operational и pricing complexity должны находиться внутри backend services и operational workflows.




# Zaberman Broker Calculator MVP

Operational pricing system for interstate furniture delivery, fragile cargo handling, white-glove transportation, and future eBOL workflows.

The project is designed as a broker-first operational calculator focused on fast quote creation, centralized pricing logic, operational transparency, and future scalability.

---

# Project Vision

The calculator should remain:

- simple;
- fast;
- intuitive;
- operationally effective.

The broker should focus on creating quotes, not on understanding internal system complexity.

Complexity must stay inside:
- pricing engine;
- backend logic;
- operational workflows.

---

# Business Goals

- Reduce manual pricing calculations
- Standardize operational pricing
- Accelerate quote generation
- Centralize pricing logic
- Improve operational transparency
- Reduce pricing inconsistencies
- Prepare foundation for eBOL and operational execution workflows

---

# Core Principles

## Broker-First Workflow

Primary workflow must fit into a single working screen.

Broker workflow:
- enter customer data;
- enter route;
- add items;
- receive final quote;
- send estimate.

Broker should not:
- manually calculate pricing;
- select vehicles manually;
- interpret formulas;
- calculate operational complexity.

---

## Separation of Layers

```text
Calculator = commercial pricing layer
Orders/eBOL = operational execution layer
```

The calculator creates:
- quote;
- estimate;
- invoice foundation.

Operational layer handles:
- pickup;
- delivery;
- POD;
- eBOL;
- photos;
- signatures.

---

## Backend Pricing Ownership

Pricing logic must belong to centralized backend pricing engine.

UI must not own:
- formulas;
- calculations;
- pricing rules.

Correct architecture:

```text
User Input
↓
Backend Pricing Engine
↓
Calculation Result
↓
UI Display
```

---

## Snapshot Integrity

Every generated estimate must freeze:

```text
Customer Data
Route Data
Items
Variables Snapshot
Formula Version
Pricing Result
Final Rounded Price
```

Historical estimates must never recalculate automatically.

---

# Main Workflow

## 1. Quote Creation

Broker fills:
- pickup / delivery;
- customer info;
- items;
- dimensions;
- weight;
- packaging;
- insurance;
- storage;
- access conditions.

---

## 2. Pricing Calculation

System automatically calculates:
- physical volume;
- effective volume;
- vehicle fit;
- operational cost;
- additional charges;
- discounts;
- margin;
- final rounded price.

---

## 3. Estimate Generation

Broker receives:
- customer-facing estimate;
- rounded final price;
- operational breakdown;
- frozen estimate snapshot.

---

# Main Screens

## index.html

Primary broker workflow screen.

Contains:
- customer info;
- route info;
- quote options;
- items table;
- operational conditions;
- final price preview.

Purpose:
- fast daily quote creation.

---

## breakdown.html

Pricing breakdown and audit screen.

Contains:
- operational cost structure;
- additional charges;
- pricing explanation;
- formulas;
- margin logic;
- rounding logic.

Purpose:
- operational transparency;
- CEO/dev review;
- auditability.

---

## variables.html

Administrative pricing governance screen.

Contains:
- pricing variables;
- fuel logic;
- vehicle parameters;
- stackability coefficients;
- crating variables;
- operational coefficients;
- formula references;
- pricing governance logic.

Purpose:
- centralized pricing configuration.

---

## drafts.html

Draft management screen.

Contains:
- autosaved drafts;
- editable quotes;
- duplicate/reopen workflow.

Purpose:
- support broker working process.

---

## estimates.html

Sent estimates screen.

Contains:
- generated estimates;
- estimate statuses;
- customer-facing pricing history.

Purpose:
- estimate lifecycle management.

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

Operational Cost may include:
- labor;
- mileage;
- fuel;
- handling;
- tolls;
- parking;
- access complexity.

---

## Additional Charges

```text
Packaging
Crating
Storage
Insurance
Exclusive Delivery
Access Fees
Zone Fees
```

Additional charges must not duplicate operational stage costs.

---

## Effective Volume Logic

System calculates:
- physical volume;
- effective volume;
- stackability impact.

Non-stackable and fragile items increase effective volume and affect:
- vehicle fit;
- operational pricing.

---

## Vehicle Logic

System automatically determines:
- vehicle type;
- vehicle quantity;
- route capacity fit.

Supported future logic:
- multi-vehicle shipments;
- oversized cargo;
- route consolidation.

---

## Margin Logic

```text
Margin =
(
Operational Cost
+
Additional Charges
)
×
Margin Rate
```

---

## Final Price Logic

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

---

# Implemented Documentation

The repository already contains:

- architecture.md
- entity-model.md
- pricing-engine-flow.md
- pricing-test-cases.md
- operational-edge-cases.md
- ebol-workflow.md
- technical-roadmap.md

These documents define:
- pricing architecture;
- entity relationships;
- operational workflows;
- edge cases;
- estimate lifecycle;
- implementation roadmap.

---

# Current Project Status

## Current State

```text
MVP / Wireframe Prototype
```

Frontend stack:
- HTML
- TailwindCSS
- Lucide Icons

Current repository focuses on:
- workflow design;
- pricing architecture;
- operational logic;
- future backend preparation.

---

## Backend Status

Backend is not implemented yet.

Not implemented:
- database;
- pricing engine;
- authentication;
- API integrations;
- payment processing;
- PDF generation;
- production eBOL workflow.

---

# Planned Future Features

## Pricing Engine

- centralized backend pricing engine
- dynamic fuel pricing
- route optimization
- automatic vehicle fit
- operational scheduling logic

---

## Commercial Layer

- estimate PDF generation
- Stripe / Square integration
- invoice workflow
- customer communication

---

## Operational Layer

- Orders
- eBOL
- POD workflow
- item-level photos
- pickup/delivery verification
- damage workflow
- warehouse storage workflow

---

## Dispatch Layer

- dispatch dashboard
- route planning
- crew assignment
- warehouse coordination

---

# Repository Purpose

This repository is used for:
- workflow architecture;
- pricing engine design;
- operational modeling;
- system specification;
- business validation;
- CEO/dev alignment;
- future backend preparation.

---

# Architectural Direction

The long-term target architecture:

```text
Broker UI
↓
Quote Draft
↓
Pricing Engine
↓
Estimate Snapshot
↓
Invoice
↓
Order
↓
eBOL
↓
Operational Execution
```

The calculator must remain simple for brokers, while operational and pricing complexity stays centralized inside backend services and operational workflows.
