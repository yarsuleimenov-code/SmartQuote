# Zaberman Broker Calculator MVP

Operational pricing system для interstate-перевозок мебели, fragile cargo, full service delivery и будущих eBOL workflows.

Проект разрабатывается как broker-first operational calculator с централизованной pricing logic, единым operational workflow и foundation для дальнейшей backend-архитектуры.

---

# Статус проекта

```text
MVP / Workflow Prototype
```

Текущий репозиторий используется для:
- проектирования workflow;
- моделирования pricing logic;
- согласования бизнес-логики;
- подготовки backend architecture;
- демонстрации operational concept;
- alignment между business / CEO / development.

---

# Основная идея системы

Калькулятор должен оставаться:

- простым;
- быстрым;
- интуитивным;
- удобным для ежедневной работы брокеров.

Брокер должен:
- создать quote;
- получить estimate;
- отправить клиенту цену.

Сложность должна находиться:
- внутри pricing engine;
- backend services;
- operational workflows.

---

# Основные бизнес-цели

- уменьшение ручных расчётов;
- стандартизация pricing logic;
- ускорение создания quote;
- снижение pricing inconsistencies;
- централизация operational pricing;
- подготовка foundation для eBOL;
- переход к unified operational workflow.

---

# Главный Workflow

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

---

# Основные принципы архитектуры

## Broker-First Workflow

Основной workflow должен помещаться в один рабочий экран.

Брокер:
- вводит customer data;
- указывает route;
- добавляет items;
- получает final quote.

Брокер не должен:
- вручную рассчитывать стоимость;
- подбирать vehicle;
- интерпретировать formulas;
- рассчитывать operational complexity.

---

## Разделение слоёв

```text
Calculator = commercial pricing layer
Orders/eBOL = operational execution layer
```

Calculator отвечает за:
- quote;
- estimate;
- invoice foundation.

Operational layer отвечает за:
- pickup;
- delivery;
- POD;
- eBOL;
- photos;
- signatures;
- exceptions.

---

## Целевая backend архитектура

Pricing logic должна принадлежать centralized pricing engine.

Целевая архитектура:

```text
User Input
↓
Pricing Engine
↓
Calculation Result
↓
UI Display
```

Frontend не должен хранить:
- formulas;
- pricing rules;
- business calculations.

---

## Snapshot Integrity

Каждый estimate должен фиксировать snapshot:

```text
Customer Data
Route Data
Items
Variables Snapshot
Formula Version
Pricing Result
Final Rounded Price
```

Historical estimates не должны автоматически пересчитываться после изменения pricing variables.

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
- estimate summary.

Назначение:
- быстрое ежедневное создание quote.

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
- CEO/dev review.

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

---

## variables.html

Administrative pricing governance screen.

Содержит:
- pricing variables;
- fuel logic;
- operational coefficients;
- vehicle logic;
- stackability logic;
- crating variables.

Назначение:
- централизованное управление pricing configuration.

---

## formulas.html

Документация formulas и pricing logic.

Содержит:
- pricing formulas;
- operational formulas;
- coefficient logic;
- calculation explanation.

Назначение:
- documentation;
- development alignment;
- pricing governance.

---

## drafts.html

Управление draft estimates.

---

## estimates.html

История generated estimates.

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

---

## Effective Volume Logic

Система рассчитывает:
- physical volume;
- effective volume;
- stackability impact.

Fragile и non-stackable items увеличивают effective volume и влияют на:
- vehicle fit;
- operational pricing;
- crew requirement.

---

## Helper Logic

Additional helpers:
- рассчитываются отдельно;
- имеют minimum billable time = 2 hours.

Crew requirement определяется:
- весом;
- effective volume;
- access conditions;
- handling complexity.

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

# Структура репозитория

```text
/
├── index.html
├── breakdown.html
├── ebol.html
├── variables.html
├── formulas.html
├── drafts.html
├── estimates.html
├── sidebar.js
├── README.md
│
├── /docs
│   ├── architecture.md
│   ├── entity-model.md
│   ├── pricing-engine-flow.md
│   ├── pricing-test-cases.md
│   ├── operational-edge-cases.md
│   ├── ebol-workflow.md
│   └── technical-roadmap.md
```

---

# Технологический стек

Frontend:
- HTML
- TailwindCSS
- Lucide Icons

Текущий MVP:
- frontend-only;
- workflow prototype;
- wireframe architecture.

---

# Что пока НЕ реализовано

```text
Backend
Database
Pricing Engine
Authentication
API integrations
PDF generation
Payments
Production eBOL
Real-time calculations
```

---

# Планируемые функции

## Pricing Engine

- centralized pricing engine;
- dynamic fuel pricing;
- operational coefficients;
- automatic vehicle fit;
- route optimization.

---

## Commercial Layer

- estimate PDF;
- invoice workflow;
- payment integrations;
- customer communication.

---

## Operational Layer

- Orders;
- eBOL;
- POD workflow;
- warehouse workflow;
- item-level photos;
- delivery verification;
- damage workflow.

---

## Dispatch Layer

- dispatch dashboard;
- route planning;
- crew assignment;
- warehouse coordination.

---

# Реализованная документация

В `/docs` уже находятся:

- architecture.md
- entity-model.md
- pricing-engine-flow.md
- pricing-test-cases.md
- operational-edge-cases.md
- ebol-workflow.md
- technical-roadmap.md

Документация покрывает:
- pricing architecture;
- operational workflows;
- entity relationships;
- estimate lifecycle;
- edge cases;
- implementation roadmap.

---

# Назначение репозитория

Репозиторий используется для:
- business validation;
- workflow architecture;
- operational modeling;
- pricing engine design;
- system specification;
- CEO/dev alignment;
- подготовки backend architecture.
