# Zaberman Broker Calculator MVP — Архитектура системы

## 1. Назначение системы

Zaberman Broker Calculator MVP проектируется как operational pricing system для interstate перевозок мебели, bulky items, fragile cargo и full service delivery.

Основная задача системы:
- ускорить создание quote;
- стандартизировать pricing logic;
- снизить ручные расчёты;
- сделать стоимость explainable и audit-friendly.

Главный принцип системы:

```text
Брокер не должен думать о системе.
Брокер должен быстро ввести данные,
получить quote и отправить estimate.
```

---

## 2. Границы MVP

MVP состоит из трёх основных слоёв:

```text
1. Broker Quote Creation
2. Pricing Breakdown / Audit
3. Admin Variables / Pricing Governance
```

Дополнительные экраны:
- Drafts
- Estimates
- Future: Invoice
- Future: Orders
- Future: eBOL

---

## 3. Основные экраны

### 3.1 index.html — Broker Quote Screen

Главный рабочий экран брокера.

Назначение:
- создать новый quote;
- заполнить customer / route info;
- добавить items;
- выбрать quote options;
- получить итоговую стоимость;
- отправить estimate.

Экран должен оставаться:
- простым;
- быстрым;
- интуитивным.

Глубокая pricing logic не должна отображаться брокеру.

---

### 3.2 breakdown.html — Pricing Breakdown Screen

Экран объяснения расчёта.

Назначение:
- показать из чего сформировалась стоимость;
- показать operational cost;
- показать additional charges;
- показать margin;
- показать rounding logic;
- использоваться для review CEO и разработки.

Экран не предназначен для редактирования.

Все изменения выполняются через:

```text
index.html
```

---

### 3.3 variables.html — Admin Variables Screen

Административный экран pricing engine.

Назначение:
- управление pricing variables;
- управление vehicle parameters;
- управление fuel pricing;
- управление packaging / crating logic;
- управление access fees;
- управление formula versions;
- поддержка auditability.

Брокеры не должны менять variables напрямую.

---

### 3.4 drafts.html — Draft Management

Назначение:
- хранение черновиков quote;
- reopening draft;
- duplicate draft;
- autosave workflow.

Draft остаётся редактируемым.

---

### 3.5 estimates.html — Sent Estimates

Назначение:
- хранение отправленных estimate;
- отслеживание статусов;
- повторная отправка;
- reopen as draft;
- convert to invoice.

Estimate и Draft — разные сущности.

```text
Draft = editable
Estimate = frozen customer-facing version
```

---

## 4. Lifecycle системы

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

```text
Draft
↓
Estimate
```

Следующие этапы:
- Invoice
- Orders
- eBOL

---

## 5. Разделение слоёв системы

### 5.1 Commercial Layer

Отвечает за:
- создание quote;
- pricing;
- discounts;
- margin;
- estimate generation.

Основные экраны:
- index.html
- drafts.html
- estimates.html
- breakdown.html

---

### 5.2 Pricing Governance Layer

Отвечает за:
- variables;
- formulas;
- fuel rates;
- vehicle logic;
- pricing versions;
- admin changes;
- audit trail.

Основной экран:

```text
variables.html
```

---

### 5.3 Operational Layer

Будущий operational layer.

Отвечает за:
- order execution;
- pickup workflow;
- delivery workflow;
- item checklist;
- photos;
- signatures;
- POD / eBOL.

Будущие экраны:
- orders.html
- ebol.html

---

## 6. Архитектурный принцип pricing engine

UI не должен содержать критичную pricing logic.

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

HTML-страницы MVP демонстрируют:
- workflow;
- структуру данных;
- формулы;
- бизнес-логику;
- output calculations.

Production system должен рассчитывать стоимость на backend.

---

## 7. Общий pricing flow

Высокоуровневая последовательность расчёта:

```text
Customer / Route Input
↓
Items Input
↓
Physical Volume Calculation
↓
Effective Volume Calculation
↓
Vehicle Fit
↓
Operational Cost
↓
Additional Charges
↓
Discounts
↓
Margin
↓
Rounding
↓
Final Estimate Price
```

---

## 8. Основные pricing components

### 8.1 Operational Cost

Operational Cost включает:

```text
Pickup Cost
+ Interstate Cost
+ Delivery Cost
```

Примеры:
- labor;
- mileage;
- fuel;
- vehicle cost;
- handling;
- tolls;
- parking;
- access fees.

---

### 8.2 Additional Charges

Additional Charges включает:

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

### 8.3 Margin

Margin рассчитывается после:
- operational cost;
- additional charges.

Пример:

```text
Margin = (Operational Cost + Additional Charges) × Margin Rate
```

---

### 8.4 Final Price

Финальная стоимость округляется вверх.

```text
Rounded Final Price = CEILING(Raw Final Price, Rounding Rule)
```

Текущее правило:

```text
UP to nearest $10
```

---

## 9. Variables Governance

Variables управляются admin role.

Примеры variables:
- fuel surcharge;
- vehicle capacity;
- cost per mile;
- margin rate;
- storage rate;
- packaging cost;
- crating coefficients;
- stackability coefficients;
- access fees;
- NYC tolls / parking / ticket reserve;
- rounding rules.

Ключевое правило:

```text
Изменение variables
не должно изменять
уже отправленные estimates.
```

Каждый estimate должен хранить:

```text
formula_version
variables_snapshot
calculation_components
```

---

## 10. Snapshot Logic

При генерации estimate система должна фиксировать snapshot:

```text
Customer Data
Route Data
Items Data
Selected Options
Variables Snapshot
Formula Version
Calculation Result
Final Rounded Price
```

Это необходимо для:
- auditability;
- dispute resolution;
- стабильности pricing;
- consistency customer communication.

---

## 11. Роли системы

### Broker

Может:
- создать quote;
- редактировать draft;
- добавлять items;
- пересчитывать quote;
- генерировать estimate;
- смотреть breakdown.

Не должен:
- менять variables;
- менять formula versions;
- изменять скрытую pricing logic.

---

### Admin

Может:
- менять variables;
- активировать formula versions;
- обновлять vehicle parameters;
- управлять pricing rules;
- экспортировать snapshots.

Не должен:
- редактировать customer quote data без audit trail.

---

### Future Operations User

Может:
- управлять order;
- фиксировать pickup;
- фиксировать delivery;
- загружать item photos;
- работать с eBOL;
- фиксировать damage/comments.

---

## 12. Планируемые интеграции

Потенциальные интеграции:

```text
Kommo CRM
Stripe / Square
Google Maps / Mapbox
AAA Fuel Prices
Email / SMS services
Storage / Warehouse module
eBOL / POD workflow
Dispatch / Routing systems
```

---

## 13. Границы MVP

MVP не является production-ready системой.

Назначение MVP:
- validate workflow;
- согласовать логику с CEO;
- согласовать архитектуру с разработкой;
- разделить calculator / pricing engine / operations;
- подготовить technical specification.

В MVP не входят:
- backend engine;
- database;
- authentication;
- API integration;
- real PDF generation;
- payment processing;
- production eBOL workflow.

---

## 14. Основные риски

### Risk 1 — Pricing logic в UI

Проблема:
- сложность поддержки;
- отсутствие auditability;
- высокий риск ошибок.

Решение:

```text
Backend Pricing Engine
```

---

### Risk 2 — Draft и Estimate смешаны

Проблема:
- изменение уже отправленных цен;
- inconsistent customer communication.

Решение:

```text
Draft = editable
Estimate = frozen
```

---

### Risk 3 — Variables меняются без snapshot

Проблема:
- старые estimates пересчитываются задним числом.

Решение:

```text
Variables Snapshot per Estimate
```

---

### Risk 4 — Orders смешиваются с Calculator

Проблема:
- перегруженный broker workflow;
- сложный интерфейс;
- потеря скорости работы.

Решение:

```text
Calculator = quote creation
Orders/eBOL = operational execution
```

---

## 15. Целевая архитектура системы

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
```

Калькулятор должен оставаться простым и быстрым для брокера.

Сложность системы должна находиться:
- в backend logic;
- в pricing engine;
- в operational workflows,
а не в broker UI.


# Zaberman Broker Calculator MVP — Architecture

## 1. Purpose

Zaberman Broker Calculator MVP is designed as an operational pricing system for interstate furniture, bulky-item, fragile-item, and white-glove delivery quotes.

The system must help brokers create accurate quotes quickly, while keeping pricing logic centralized, explainable, and scalable.

The main principle:

```text
Broker should not think about the system.
Broker should enter data, receive quote, and send estimate.
```

---

## 2. Product Scope

The MVP is focused on three primary layers:

```text
1. Broker Quote Creation
2. Pricing Breakdown / Audit
3. Admin Variables / Pricing Governance
```

Additional lifecycle pages support the quote process:

```text
Drafts
Estimates
Future: Invoice
Future: Orders
Future: eBOL
```

---

## 3. Main Screens

## 3.1 index.html — Broker Quote Screen

Primary working screen for brokers.

Purpose:
- create a new quote;
- enter customer and route data;
- add items;
- select quote options;
- receive final rounded price;
- generate estimate.

This screen should stay simple and fast.

It must not expose deep pricing logic to the broker.

---

## 3.2 breakdown.html — Pricing Explanation Screen

Read-only explanation screen.

Purpose:
- explain how quote price was calculated;
- show operational cost;
- show additional charges;
- show margin;
- show rounding;
- support CEO review and developer alignment.

This screen is not used for direct editing.

Editing must happen in `index.html`.

---

## 3.3 variables.html — Admin Variables Screen

Admin-only configuration screen.

Purpose:
- manage pricing variables;
- manage vehicle parameters;
- manage fuel prices;
- manage packaging and crating variables;
- manage access and zone fees;
- manage formula versioning;
- support auditability.

Brokers should not directly change variables.

---

## 3.4 drafts.html — Draft Management

Purpose:
- show unfinished quote drafts;
- allow broker to reopen, duplicate, or delete drafts;
- support auto-save workflow.

Drafts are editable.

---

## 3.5 estimates.html — Sent Estimates

Purpose:
- show customer-facing estimates already generated or sent;
- track estimate status;
- support send again, reopen as draft, and convert to invoice.

Estimate is not the same as draft.

Draft is editable.  
Estimate is a sent customer-facing version.

---

## 4. Core Lifecycle

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

MVP currently focuses on:

```text
Draft
↓
Estimate
```

Future expansion:

```text
Invoice
Order
eBOL
```

---

## 5. Layer Separation

## 5.1 Commercial Layer

Responsible for:
- quote creation;
- estimate generation;
- pricing;
- discounts;
- margin;
- customer-facing price.

Main screens:
- index.html
- drafts.html
- estimates.html
- breakdown.html

---

## 5.2 Pricing Governance Layer

Responsible for:
- variables;
- formulas;
- formula versions;
- fuel rates;
- vehicle parameters;
- admin changes;
- audit trail.

Main screen:
- variables.html

---

## 5.3 Operational Layer

Responsible for future order execution:
- order status;
- pickup;
- delivery;
- item checklist;
- eBOL;
- photos;
- signatures;
- POD.

Future screens:
- orders.html
- ebol.html

---

## 6. Pricing Engine Principle

The UI must not contain business-critical calculation logic.

Correct architecture:

```text
User input
↓
Backend pricing engine
↓
Calculation result
↓
UI display
```

HTML pages in this MVP are wireframes and must only demonstrate:
- workflow;
- data structure;
- calculation outputs;
- business rules.

Production system must calculate values on backend.

---

## 7. Pricing Flow

High-level pricing sequence:

```text
Customer / Route Input
↓
Items Input
↓
Physical Volume Calculation
↓
Effective Volume Calculation
↓
Vehicle Fit
↓
Operational Cost
↓
Additional Charges
↓
Discounts
↓
Margin
↓
Rounding
↓
Final Estimate Price
```

---

## 8. Key Pricing Components

## 8.1 Operational Cost

Operational Cost includes:

```text
Pickup Cost
+ Interstate Cost
+ Delivery Cost
```

Examples:
- labor;
- mileage;
- fuel;
- vehicle cost;
- handling;
- tolls;
- parking;
- access cost.

---

## 8.2 Additional Charges

Additional Charges include:

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

## 8.3 Margin

Margin is calculated after operational cost and additional charges.

Example:

```text
Margin = (Operational Cost + Additional Charges) × Margin Rate
```

---

## 8.4 Final Price

Final price is rounded up.

```text
Rounded Final Price = CEILING(Raw Final Price, Rounding Rule)
```

Current rounding rule:

```text
UP to nearest $10
```

---

## 9. Variables Governance

Variables are managed by admin.

Examples:
- fuel surcharge;
- vehicle capacity;
- vehicle cost per mile;
- margin rate;
- storage rate;
- packaging price;
- crating coefficients;
- stackability coefficients;
- access fees;
- NYC tolls / parking / ticket reserve;
- rounding rule.

Important rule:

```text
Changing variables must not change already sent estimates.
```

Each estimate must store:

```text
formula_version
variables_snapshot
calculation_components
```

---

## 10. Snapshot Logic

When an estimate is generated, the system must freeze:

```text
Customer data
Route data
Items data
Selected options
Variables snapshot
Formula version
Calculation result
Final rounded price
```

This protects:
- auditability;
- customer communication;
- price consistency;
- dispute resolution.

---

## 11. Roles

## Broker

Can:
- create quote;
- edit draft;
- add items;
- recalculate quote;
- generate estimate;
- view breakdown.

Should not:
- edit admin variables;
- change formula versions;
- manually override hidden calculation logic.

---

## Admin

Can:
- edit variables;
- activate formula versions;
- update vehicle parameters;
- manage system rules;
- export snapshots.

Should not:
- edit customer quote data directly without audit.

---

## Future Operations User

Can:
- manage order;
- check pickup;
- check delivery;
- upload item photos;
- complete eBOL;
- record damage/comments.

---

## 12. Future Integrations

Potential integrations:

```text
Kommo CRM
Stripe / Square
Google Maps / Mapbox
AAA Fuel Prices
Email / SMS service
Storage / Warehouse module
eBOL / POD workflow
Dispatch / Routing system
```

---

## 13. MVP Boundaries

MVP is not final production system.

MVP is used to:
- validate workflow;
- align CEO and development;
- clarify system logic;
- separate calculator, pricing engine, and operations;
- prepare technical specification.

Not included in MVP frontend:
- backend calculation engine;
- real authentication;
- database;
- API integration;
- real PDF generation;
- real payment processing;
- real eBOL execution.

---

## 14. Key Risks

## Risk 1: UI contains pricing logic

Impact:
- formulas become hard to maintain;
- audit becomes impossible.

Solution:
- backend pricing engine;
- UI displays calculated results only.

---

## Risk 2: Draft and Estimate are mixed

Impact:
- sent prices can change unexpectedly;
- customer communication becomes inconsistent.

Solution:
- Draft is editable.
- Estimate is frozen/versioned.

---

## Risk 3: Variables are changed without snapshots

Impact:
- old estimates recalculate incorrectly.

Solution:
- store variables snapshot per estimate.

---

## Risk 4: Orders and eBOL are mixed into calculator

Impact:
- broker screen becomes overloaded.

Solution:
- calculator handles quote.
- orders/eBOL handle execution.

---

## 15. Target Architecture Summary

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
```

The calculator should remain simple for brokers.

The system behind it can be complex, but the complexity must be hidden behind clear workflows and backend logic.
