# SmartQuote TO-BE Formula Workbook для CEO

Status: CEO approval draft. Это не изменение кода и не изменение AS-IS pricing baseline.

## Назначение

Workbook нужен, чтобы Alexander / CEO мог согласовать целевую pricing architecture до Formula Sprint.

Файл отвечает на вопросы:

- что именно будет считаться;
- откуда берется каждый input;
- какой коэффициент или справочник используется;
- куда идет intermediate result;
- как строятся pickup / interstate / delivery subtotals;
- как применяется margin, broker fee, discount и rounding;
- как сохраняется snapshot, чтобы старые estimates не пересчитывались.

## Как читать

1. Начать с листа `00_CEO_Approval`.
2. Утвердить scope на `01_Sprint_Scope`.
3. Проверить порядок сборки цены на `02_Price_Build_Order`.
4. Проверить формулы по блокам на `03_Formula_Map` и детальных листах.
5. Отдельно проверить variables, references, snapshot governance и UAT cases.

## Главное правило

Ни одна TO-BE формула не должна попадать в `js/calculator.js`, пока:

1. CEO/CFO/Ops утвердили rule.
2. Есть owner у переменной.
3. Есть source of truth у справочника.
4. Есть UAT case.
5. Benchmark preview показывает приемлемый impact.

## Основные решения для CEO

- Final price build order.
- Formula trace как обязательный audit output.
- Route type pricing.
- Remote / corridor / core zones.
- Vehicle fit и crew split.
- Pickup time отдельно от delivery time.
- Bulky / moving premium.
- Direct / specific-date pricing.
- Crate / protection / storage / access fees.
- Margin / broker fee / discount order.
- Snapshot compatibility.
- Variable governance.

## Calculator Meeting Additions

- Interstate capacity logic uses both volume and payload. The pricing basis must use the larger utilization factor, not only cubic feet.
- Density threshold is calculated as vehiclePayloadLb / vehicleCapacityCuFt. Example 8000 lb / 1500 cu ft = 5.33 lb/cu ft is an example, not a hardcoded constant.
- Handling time uses two scenarios: volumeHandlingMinutes and weightHandlingMinutes. The TO-BE rule is baseHandlingMinutes = MAX(volumeHandlingMinutes, weightHandlingMinutes). Do not sum both scenarios.
- Pickup and delivery must use separate time multipliers: pickupTimeMultiplier and deliveryTimeMultiplier.
- All numeric business coefficients must be mapped to variables or explicitly approved as hardcoded exceptions.
- Warning Engine is part of pricing governance, not just UI text. Warnings can be informational, approval-required, or blocking.
- Vehicle fit includes dimensional fit, capacity fit by volume, and capacity fit by weight. Failure should trigger warning, review, and recommended vehicle change.

