# Zaberman Broker Calculator MVP

Операционный калькулятор стоимости interstate-перевозок крупногабаритных и хрупких грузов.

Система предназначена для быстрого формирования quote брокером с прозрачной operational-логикой расчёта.

---

# Цели проекта

- Быстрое создание quote на одном экране
- Прозрачный расчёт стоимости
- Упрощение работы брокеров
- Снижение количества ручных расчётов
- Единая pricing-логика
- Подготовка к eBOL и operational workflow

---

# Основные принципы

## Broker-first UX

Калькулятор должен быть:
- простым;
- интуитивным;
- быстрым в работе;
- эффективным для ежедневного использования.

Брокер должен заниматься формированием quote, а не разбираться в архитектуре системы.

---

# Основной workflow

## 1. Создание quote

Брокер заполняет:
- pickup / delivery;
- список items;
- размеры;
- вес;
- упаковку;
- страховку;
- storage;
- условия доступа.

---

## 2. Автоматический расчёт

Система автоматически рассчитывает:
- operational cost;
- effective volume;
- vehicle fit;
- additional charges;
- margin;
- итоговую стоимость.

---

## 3. Генерация Estimate

Брокер получает:
- customer-facing estimate;
- финальную rounded price;
- operational breakdown.

---

# Архитектура MVP

## Основные экраны

### index.html

Основной рабочий экран брокера.

Содержит:
- customer info;
- route;
- items table;
- quote options;
- final quote preview.

---

### breakdown.html

Экран operational breakdown и проверки расчётов.

Содержит:
- stage costs;
- margin logic;
- pricing formulas;
- структуру итоговой стоимости.

---

### variables.html

Административный экран настройки переменных.

Содержит:
- pricing variables;
- fuel logic;
- параметры транспорта;
- operational coefficients.

---

# Логика расчётов

## Operational Cost

Operational Cost =
Pickup Stage +
Interstate Stage +
Delivery Stage

---

## Additional Charges

Дополнительные услуги:
- packaging;
- storage;
- insurance;
- crating;
- exclusive delivery.

---

## Final Price

Raw Final Price =
Operational Cost +
Additional Charges +
Margin

Rounded Final Price =
CEILING(Raw Final Price, 10)

---

# Текущий статус

MVP / Wireframe Prototype

Frontend:
- HTML
- TailwindCSS
- Lucide Icons

Backend пока не реализован.

---

# Планируемые функции

- автоматический подбор транспорта
- route optimization
- eBOL
- POD workflow
- Stripe / Square integration
- PDF estimate generation
- warehouse logic
- operational scheduling

---

# Назначение репозитория

Репозиторий используется для:
- проектирования workflow;
- разработки pricing architecture;
- проектирования operational logic;
- визуализации MVP для бизнеса и разработки.
