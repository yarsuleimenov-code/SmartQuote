# Zaberman LLC Pricing Calculator — Архитектура системы

## 1. Назначение системы

Zaberman LLC Pricing Calculator проектируется как operational pricing system для interstate перевозок мебели, bulky items, fragile cargo и full service delivery.

Система должна:
- ускорять создание quote;
- стандартизировать pricing logic;
- снижать ручные расчёты;
- обеспечивать explainable pricing;
- формировать foundation для будущего operational workflow и eBOL.

Главный принцип системы:

```text
Брокер не должен думать о системе.
Брокер должен быстро ввести данные,
получить quote и отправить estimate.
```

---

# 2. Целевая концепция системы

Система разделяется на три основных слоя:

```text
Commercial Layer
↓
Pricing Engine Layer
↓
Operational Layer
```

---

## Commercial Layer

Отвечает за:
- quote creation;
- estimate generation;
- customer-facing pricing;
- invoices;
- commercial workflow.

---

## Pricing Engine Layer

Отвечает за:
- formulas;
- operational coefficients;
- vehicle fit;
- helper logic;
- access logic;
- pricing calculations;
- variables governance.

---

## Operational Layer

Отвечает за:
- orders;
- pickup;
- delivery;
- eBOL;
- POD;
- item verification;
- photos;
- signatures;
- exceptions.

---

# 3. Границы MVP

Текущий MVP покрывает:

```text
Draft
↓
Estimate
↓
Breakdown
↓
Future Order Foundation
```

Реализованные экраны:
- index.html
- breakdown.html
- variables.html
- formulas.html
- drafts.html
- estimates.html
- ebol.html

MVP используется для:
- business validation;
- workflow modeling;
- CEO/dev alignment;
- pricing architecture design;
- подготовки backend specification.

---

# 4. Основные экраны

## 4.1 index.html — Broker Quote Screen

Главный рабочий экран брокера.

Назначение:
- создать quote;
- заполнить customer data;
- указать ZIP route;
- добавить items;
- выбрать quote options;
- получить estimate.

Экран должен оставаться:
- быстрым;
- простым;
- broker-first.

Брокер не должен:
- думать о formulas;
- выбирать vehicle вручную;
- интерпретировать operational coefficients;
- рассчитывать crew logic.

---

## 4.2 breakdown.html — Pricing Breakdown

Экран audit и explainable pricing.

Назначение:
- показать структуру цены;
- показать operational cost;
- показать additional charges;
- показать margin;
- показать rounding;
- поддерживать review CEO и development.

Экран:
- read-only;
- не используется для редактирования quote.

---

## 4.3 variables.html — Pricing Governance

Administrative pricing screen.

Назначение:
- управление pricing variables;
- управление fuel logic;
- управление packaging logic;
- управление access coefficients;
- управление formula versions;
- управление helper pricing;
- pricing governance.

Variables должны редактироваться только admin role.

---

## 4.4 formulas.html — Formula Documentation

Документация formulas и pricing logic.

Назначение:
- explain formulas;
- document business rules;
- align business and development;
- хранить pricing references.

Экран не является pricing engine.

---

## 4.5 drafts.html — Draft Workflow

Draft management screen.

Назначение:
- autosave workflow;
- reopening draft;
- duplicate draft;
- temporary quote editing.

Ключевое правило:

```text
Draft = editable
```

---

## 4.6 estimates.html — Estimate History

Estimate management screen.

Назначение:
- хранение generated estimates;
- tracking estimate statuses;
- reopen as draft;
- future invoice conversion.

Ключевое правило:

```text
Estimate = frozen snapshot
```

---

## 4.7 ebol.html — Operational Execution Screen

Operational execution layer.

Назначение:
- item verification;
- pickup confirmation;
- delivery confirmation;
- item photos;
- signatures;
- exceptions;
- POD workflow.

eBOL не должен изменять pricing.

eBOL работает с frozen estimate snapshot.

---

# 5. Lifecycle системы

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

Текущий MVP покрывает:
- Draft;
- Estimate;
- Breakdown;
- eBOL concept.

---

# 6. Архитектурный принцип pricing engine

Ключевой принцип:

```text
UI не должен владеть pricing logic.
```

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

Frontend должен:
- отображать данные;
- отправлять input;
- показывать results.

Frontend не должен:
- хранить formulas;
- рассчитывать pricing;
- хранить hidden business logic.

---

# 7. Общий pricing flow

Высокоуровневая последовательность расчёта:

```text
Customer Input
↓
Route Input
↓
Items Input
↓
Physical Volume
↓
Effective Volume
↓
Vehicle Fit
↓
Operational Cost
↓
Additional Charges
↓
Margin
↓
Rounding
↓
Final Estimate
```

---

# 8. Основные pricing components

## 8.1 Operational Cost

Operational Cost состоит из:

```text
Pickup Stage
+
Interstate Stage
+
Delivery Stage
```

Может включать:
- labor;
- mileage;
- fuel;
- vehicle cost;
- tolls;
- parking;
- handling;
- access fees.

---

## 8.2 Additional Charges

Additional Charges включает:

```text
Packaging
Crating
Storage
Insurance
Exclusive Delivery
COI
Access Fees
Zone Fees
```

Additional Charges не должны дублировать operational stage cost.

---

## 8.3 Effective Volume Logic

Система рассчитывает:
- physical volume;
- effective volume;
- stackability impact.

Fragile и non-stackable items увеличивают:
- effective volume;
- vehicle requirements;
- operational complexity.

---

## 8.4 Helper Logic

Additional helpers:
- рассчитываются отдельно;
- имеют minimum billable time = 2 hours.

Crew logic определяется:
- item weight;
- effective volume;
- access conditions;
- handling complexity.

---

## 8.5 Final Price Logic

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

Финальная стоимость:

```text
Rounded Final Price =
CEILING(Raw Final Price, 10)
```

Текущее правило:

```text
UP to nearest $10
```

---

# 9. Snapshot Logic

Каждый generated estimate должен фиксировать snapshot:

```text
Customer Data
Route Data
Items Data
Selected Options
Variables Snapshot
Formula Version
Calculation Components
Final Rounded Price
```

Ключевое правило:

```text
Изменение variables
не должно изменять
уже отправленные estimates.
```

---

# 10. Variables Governance

Variables управляются admin role.

Примеры variables:
- fuel surcharge;
- vehicle capacity;
- cost per mile;
- helper rates;
- margin rate;
- storage rate;
- packaging price;
- crating coefficients;
- stackability coefficients;
- access fees;
- COI fees;
- zone fees;
- rounding rules.

---

# 11. Роли системы

## Broker

Может:
- создать quote;
- редактировать draft;
- добавлять items;
- пересчитывать quote;
- генерировать estimate;
- смотреть breakdown.

Не должен:
- менять pricing variables;
- менять formula versions;
- изменять hidden pricing logic.

---

## Admin

Может:
- менять variables;
- активировать formula versions;
- обновлять pricing rules;
- обновлять vehicle parameters;
- управлять governance.

Не должен:
- изменять customer-facing estimate без audit trail.

---

## Future Operations User

Может:
- управлять order;
- подтверждать pickup;
- подтверждать delivery;
- загружать item photos;
- работать с eBOL;
- фиксировать exceptions;
- генерировать POD.

---

# 12. Integration Layer

Планируемые интеграции:

```text
Kommo CRM
Stripe / Square
Google Maps / Mapbox
Fuel APIs
Email / SMS services
Storage / Warehouse systems
Dispatch / Routing systems
eBOL / POD workflow
```

---

# 13. Основные архитектурные риски

## Risk 1 — Pricing logic в UI

Проблема:
- сложность поддержки;
- высокий риск ошибок;
- отсутствие auditability.

Решение:

```text
Centralized Backend Pricing Engine
```

---

## Risk 2 — Draft и Estimate смешаны

Проблема:
- изменение уже отправленных цен;
- inconsistent customer communication.

Решение:

```text
Draft = editable
Estimate = frozen snapshot
```

---

## Risk 3 — Variables без snapshots

Проблема:
- historical estimates пересчитываются задним числом.

Решение:

```text
Variables Snapshot per Estimate
```

---

## Risk 4 — Orders смешиваются с Calculator

Проблема:
- перегруженный broker workflow;
- сложный интерфейс;
- снижение скорости quote creation.

Решение:

```text
Calculator = commercial workflow
Orders/eBOL = operational workflow
```

---

# 14. Границы MVP

Текущий MVP не является production-ready системой.

В MVP пока не входят:
- backend engine;
- database;
- authentication;
- API integrations;
- real PDF generation;
- payment processing;
- production eBOL workflow;
- real-time pricing engine.

---

# 15. Целевая архитектура системы

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
Completed Delivery
```

Главный принцип:

```text
Broker UI должен оставаться простым.
Сложность должна находиться
в backend logic и operational workflows.
```
