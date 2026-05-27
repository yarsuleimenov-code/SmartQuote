# Zaberman Broker Calculator MVP — Entity Model

## 1. Назначение

Документ описывает core entities системы Zaberman Broker Calculator MVP.

Цель entity model:
- стандартизировать структуру данных;
- разделить pricing и operations;
- обеспечить auditability;
- поддержать estimate snapshots;
- подготовить backend architecture.

---

# 2. Основные принципы

## 2.1 Draft и Estimate — разные сущности

```text
Draft = editable working state
Estimate = frozen customer-facing snapshot
```

Estimate не должен автоматически пересчитываться после отправки клиенту.

---

## 2.2 UI не владеет pricing logic

UI хранит:
- user input;
- calculation output;
- snapshots.

Pricing engine отвечает за:
- formulas;
- calculations;
- pricing rules.

---

## 2.3 Orders не изменяет pricing

```text
Estimate = commercial layer
Order = operational layer
```

Order использует frozen estimate snapshot.

---

# 3. Основные связи сущностей

```text
Customer
↓
Draft
↓
Estimate
↓
Invoice
↓
Order
↓
eBOL
```

Дополнительные связи:

```text
Estimate
↓
Estimate Items
↓
Item Photos

Estimate
↓
Variables Snapshot
↓
Formula Version
```

---

# 4. Основные сущности

## 4.1 Customer

Сущность клиента.

### Fields

| Field | Type | Notes |
|---|---|---|
| customer_id | UUID | Primary key |
| first_name | string | |
| last_name | string | |
| phone | string | |
| email | string | |
| company_name | string | Optional |
| created_at | datetime | |
| updated_at | datetime | |

---

## 4.2 Address

Переиспользуемая сущность адреса.

### Fields

| Field | Type | Notes |
|---|---|---|
| address_id | UUID | Primary key |
| full_address | string | |
| city | string | |
| state | string | |
| zip_code | string | |
| latitude | decimal | |
| longitude | decimal | |
| zone | string | NY Area / CA South etc |
| access_notes | text | |

---

## 4.3 Draft

Редактируемое состояние quote.

### Fields

| Field | Type | Notes |
|---|---|---|
| draft_id | UUID | Primary key |
| customer_id | UUID | FK → Customer |
| pickup_address_id | UUID | FK → Address |
| delivery_address_id | UUID | FK → Address |
| status | enum | draft / archived |
| broker_user_id | UUID | |
| estimated_delivery_window | string | |
| total_items | integer | |
| total_weight | decimal | |
| total_volume | decimal | |
| total_effective_volume | decimal | |
| selected_vehicle_id | UUID | |
| calculated_price | decimal | |
| created_at | datetime | |
| updated_at | datetime | |

---

## 4.4 Estimate

Frozen customer-facing estimate snapshot.

### Fields

| Field | Type | Notes |
|---|---|---|
| estimate_id | UUID | Primary key |
| estimate_number | string | Human-readable |
| draft_id | UUID | Source draft |
| customer_snapshot | json | Frozen snapshot |
| route_snapshot | json | Frozen snapshot |
| pricing_snapshot | json | Frozen calculation |
| variables_snapshot_id | UUID | |
| formula_version_id | UUID | |
| final_price | decimal | Rounded price |
| raw_price | decimal | Before rounding |
| margin_amount | decimal | |
| margin_rate | decimal | |
| status | enum | draft / sent / approved / rejected / expired |
| sent_at | datetime | |
| approved_at | datetime | |
| created_at | datetime | |

---

## 4.5 Estimate Item

Сущность item внутри estimate.

### Fields

| Field | Type | Notes |
|---|---|---|
| estimate_item_id | UUID | Primary key |
| estimate_id | UUID | FK → Estimate |
| catalog_item_id | UUID | Optional |
| item_name | string | |
| quantity | integer | |
| length | decimal | Inches |
| width | decimal | Inches |
| height | decimal | Inches |
| weight | decimal | lb |
| physical_volume | decimal | cu ft |
| effective_volume | decimal | cu ft |
| packaging_type_id | UUID | |
| fragile | boolean | |
| non_stackable | boolean | |
| crated | boolean | |
| declared_value | decimal | |
| item_comment | text | |

---

## 4.6 Item Photo

Будущая operational сущность.

### Fields

| Field | Type | Notes |
|---|---|---|
| photo_id | UUID | |
| estimate_item_id | UUID | |
| order_id | UUID | Optional |
| photo_type | enum | pickup / delivery / damage |
| file_url | string | |
| uploaded_by | UUID | |
| uploaded_at | datetime | |

---

## 4.7 Vehicle

Сущность vehicle configuration.

### Fields

| Field | Type | Notes |
|---|---|---|
| vehicle_id | UUID | |
| vehicle_name | string | |
| capacity_cuft | decimal | |
| max_weight_lb | decimal | |
| mpg | decimal | |
| fuel_type | enum | diesel / regular |
| crew_size | integer | |
| cost_per_mile | decimal | |
| active | boolean | |

---

## 4.8 Packaging Type

Справочник packaging.

### Fields

| Field | Type | Notes |
|---|---|---|
| packaging_type_id | UUID | |
| packaging_name | string | |
| pricing_type | enum | fixed / per_item / per_cuft |
| base_price | decimal | |
| active | boolean | |

---

## 4.9 Variables Snapshot

Frozen pricing variables.

### Fields

| Field | Type | Notes |
|---|---|---|
| variables_snapshot_id | UUID | |
| formula_version_id | UUID | |
| snapshot_json | json | Full variables copy |
| created_at | datetime | |

---

## 4.10 Formula Version

Сущность versioning pricing formulas.

### Fields

| Field | Type | Notes |
|---|---|---|
| formula_version_id | UUID | |
| version_name | string | v1.0 |
| status | enum | draft / active / archived |
| activated_at | datetime | |
| activated_by | UUID | |
| change_comment | text | |

---

## 4.11 Invoice

Будущая payment сущность.

### Fields

| Field | Type | Notes |
|---|---|---|
| invoice_id | UUID | |
| estimate_id | UUID | |
| invoice_number | string | |
| total_amount | decimal | |
| deposit_amount | decimal | |
| balance_amount | decimal | |
| payment_status | enum | unpaid / partial / paid |
| payment_provider | enum | stripe / square |
| created_at | datetime | |

---

## 4.12 Order

Будущая operational execution сущность.

### Fields

| Field | Type | Notes |
|---|---|---|
| order_id | UUID | |
| estimate_id | UUID | |
| order_status | enum | pending pickup / picked up / in transit / delivered |
| pickup_completed_at | datetime | |
| delivery_completed_at | datetime | |
| assigned_team | string | |
| route_id | UUID | Optional |
| operational_notes | text | |

---

## 4.13 eBOL

Будущая electronic bill of lading сущность.

### Fields

| Field | Type | Notes |
|---|---|---|
| ebol_id | UUID | |
| order_id | UUID | |
| pickup_signature | string | |
| delivery_signature | string | |
| pickup_photos_uploaded | boolean | |
| delivery_photos_uploaded | boolean | |
| damage_reported | boolean | |
| pickup_completed | boolean | |
| delivery_completed | boolean | |
| generated_pdf_url | string | |

---

# 5. Snapshot Strategy

Estimate должен фиксировать snapshot:

```text
Customer
Addresses
Items
Pricing
Variables
Formula Version
Final Price
```

Orders и eBOL должны ссылаться на estimate snapshot.

Operational layer не должен изменять pricing layer.

---

# 6. Future Expansion

Entity model проектируется с учётом будущей поддержки:
- multi-route pricing;
- dispatch planning;
- warehouse storage;
- dynamic pricing;
- CRM integration;
- API integrations;
- route optimization;
- POD/eBOL workflows;
- automated dispatching.

---

# 7. Основные архитектурные правила

## Rule 1

```text
Draft is editable.
Estimate is frozen.
```

---

## Rule 2

```text
Pricing logic belongs to backend pricing engine.
```

---

## Rule 3

```text
Orders and eBOL must not recalculate prices.
```

---

## Rule 4

```text
Every estimate stores:
- formula version
- variables snapshot
- pricing snapshot
```

---

## Rule 5

```text
Operational execution must stay separated
from commercial pricing workflow.
```





# Zaberman Broker Calculator MVP — Entity Model

## 1. Purpose

This document defines the core entities of the Zaberman Broker Calculator MVP.

The purpose of the entity model:
- standardize data structure;
- separate pricing and operations;
- support auditability;
- support estimate snapshots;
- prepare backend architecture.

---

# 2. Core Principles

## 2.1 Draft and Estimate are different entities

```text
Draft = editable working state
Estimate = frozen customer-facing snapshot
```

Estimate must never recalculate automatically after sending.

---

## 2.2 UI does not own pricing logic

UI stores:
- user input;
- calculation output;
- snapshots.

Pricing engine owns:
- formulas;
- calculations;
- pricing rules.

---

## 2.3 Orders do not modify pricing

```text
Estimate = commercial layer
Order = operational layer
```

Order uses frozen estimate snapshot.

---

# 3. Main Entity Relationships

```text
Customer
↓
Draft
↓
Estimate
↓
Invoice
↓
Order
↓
eBOL
```

Additional relationships:

```text
Estimate
↓
Estimate Items
↓
Item Photos

Estimate
↓
Variables Snapshot
↓
Formula Version
```

---

# 4. Core Entities

## 4.1 Customer

Represents customer information.

### Fields

| Field | Type | Notes |
|---|---|---|
| customer_id | UUID | Primary key |
| first_name | string | |
| last_name | string | |
| phone | string | |
| email | string | |
| company_name | string | Optional |
| created_at | datetime | |
| updated_at | datetime | |

---

## 4.2 Address

Reusable address entity.

### Fields

| Field | Type | Notes |
|---|---|---|
| address_id | UUID | Primary key |
| full_address | string | |
| city | string | |
| state | string | |
| zip_code | string | |
| latitude | decimal | |
| longitude | decimal | |
| zone | string | NY Area / CA South etc |
| access_notes | text | |

---

## 4.3 Draft

Editable quote state.

### Fields

| Field | Type | Notes |
|---|---|---|
| draft_id | UUID | Primary key |
| customer_id | UUID | FK → Customer |
| pickup_address_id | UUID | FK → Address |
| delivery_address_id | UUID | FK → Address |
| status | enum | draft / archived |
| broker_user_id | UUID | |
| estimated_delivery_window | string | |
| total_items | integer | |
| total_weight | decimal | |
| total_volume | decimal | |
| total_effective_volume | decimal | |
| selected_vehicle_id | UUID | |
| calculated_price | decimal | |
| created_at | datetime | |
| updated_at | datetime | |

---

## 4.4 Estimate

Frozen customer-facing estimate snapshot.

### Fields

| Field | Type | Notes |
|---|---|---|
| estimate_id | UUID | Primary key |
| estimate_number | string | Human-readable |
| draft_id | UUID | Source draft |
| customer_snapshot | json | Frozen snapshot |
| route_snapshot | json | Frozen snapshot |
| pricing_snapshot | json | Frozen calculation |
| variables_snapshot_id | UUID | |
| formula_version_id | UUID | |
| final_price | decimal | Rounded price |
| raw_price | decimal | Before rounding |
| margin_amount | decimal | |
| margin_rate | decimal | |
| status | enum | draft / sent / approved / rejected / expired |
| sent_at | datetime | |
| approved_at | datetime | |
| created_at | datetime | |

---

## 4.5 Estimate Item

Represents item inside estimate.

### Fields

| Field | Type | Notes |
|---|---|---|
| estimate_item_id | UUID | Primary key |
| estimate_id | UUID | FK → Estimate |
| catalog_item_id | UUID | Optional |
| item_name | string | |
| quantity | integer | |
| length | decimal | Inches |
| width | decimal | Inches |
| height | decimal | Inches |
| weight | decimal | lb |
| physical_volume | decimal | cu ft |
| effective_volume | decimal | cu ft |
| packaging_type_id | UUID | |
| fragile | boolean | |
| non_stackable | boolean | |
| crated | boolean | |
| declared_value | decimal | |
| item_comment | text | |

---

## 4.6 Item Photo

Future operational entity.

### Fields

| Field | Type | Notes |
|---|---|---|
| photo_id | UUID | |
| estimate_item_id | UUID | |
| order_id | UUID | Optional |
| photo_type | enum | pickup / delivery / damage |
| file_url | string | |
| uploaded_by | UUID | |
| uploaded_at | datetime | |

---

## 4.7 Vehicle

Vehicle configuration entity.

### Fields

| Field | Type | Notes |
|---|---|---|
| vehicle_id | UUID | |
| vehicle_name | string | |
| capacity_cuft | decimal | |
| max_weight_lb | decimal | |
| mpg | decimal | |
| fuel_type | enum | diesel / regular |
| crew_size | integer | |
| cost_per_mile | decimal | |
| active | boolean | |

---

## 4.8 Packaging Type

Packaging reference entity.

### Fields

| Field | Type | Notes |
|---|---|---|
| packaging_type_id | UUID | |
| packaging_name | string | |
| pricing_type | enum | fixed / per_item / per_cuft |
| base_price | decimal | |
| active | boolean | |

---

## 4.9 Variables Snapshot

Frozen pricing variables.

### Fields

| Field | Type | Notes |
|---|---|---|
| variables_snapshot_id | UUID | |
| formula_version_id | UUID | |
| snapshot_json | json | Full variables copy |
| created_at | datetime | |

---

## 4.10 Formula Version

Pricing formula governance.

### Fields

| Field | Type | Notes |
|---|---|---|
| formula_version_id | UUID | |
| version_name | string | v1.0 |
| status | enum | draft / active / archived |
| activated_at | datetime | |
| activated_by | UUID | |
| change_comment | text | |

---

## 4.11 Invoice

Future payment entity.

### Fields

| Field | Type | Notes |
|---|---|---|
| invoice_id | UUID | |
| estimate_id | UUID | |
| invoice_number | string | |
| total_amount | decimal | |
| deposit_amount | decimal | |
| balance_amount | decimal | |
| payment_status | enum | unpaid / partial / paid |
| payment_provider | enum | stripe / square |
| created_at | datetime | |

---

## 4.12 Order

Future operational execution entity.

### Fields

| Field | Type | Notes |
|---|---|---|
| order_id | UUID | |
| estimate_id | UUID | |
| order_status | enum | pending pickup / picked up / in transit / delivered |
| pickup_completed_at | datetime | |
| delivery_completed_at | datetime | |
| assigned_team | string | |
| route_id | UUID | Optional |
| operational_notes | text | |

---

## 4.13 eBOL

Future electronic bill of lading entity.

### Fields

| Field | Type | Notes |
|---|---|---|
| ebol_id | UUID | |
| order_id | UUID | |
| pickup_signature | string | |
| delivery_signature | string | |
| pickup_photos_uploaded | boolean | |
| delivery_photos_uploaded | boolean | |
| damage_reported | boolean | |
| pickup_completed | boolean | |
| delivery_completed | boolean | |
| generated_pdf_url | string | |

---

# 5. Snapshot Strategy

Estimate must freeze:

```text
Customer
Addresses
Items
Pricing
Variables
Formula Version
Final Price
```

Orders and eBOL must reference estimate snapshot.

Operational layer must not modify pricing layer.

---

# 6. Future Expansion

The entity model is designed to support future:
- multi-route pricing;
- dispatch planning;
- warehouse storage;
- dynamic pricing;
- CRM integration;
- API integrations;
- route optimization;
- POD/eBOL workflows;
- automated dispatching.

---

# 7. Key Architectural Rules

## Rule 1

```text
Draft is editable.
Estimate is frozen.
```

---

## Rule 2

```text
Pricing logic belongs to backend pricing engine.
```

---

## Rule 3

```text
Orders and eBOL must not recalculate prices.
```

---

## Rule 4

```text
Every estimate stores:
- formula version
- variables snapshot
- pricing snapshot
```

---

## Rule 5

```text
Operational execution must stay separated
from commercial pricing workflow.
```
