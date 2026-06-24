# Formula Workbook Glossary

Этот глоссарий нужен, чтобы CEO, BA, Operations и разработчик одинаково понимали термины в TO-BE Formula Workbook.

## Главные различия

**Variable** — одиночное изменяемое значение: процент, ставка, threshold, fee, multiplier.

**Reference** — справочник с множеством строк и ключом lookup: vehicle, ZIP, item type, protection plan.

**Reference field** — конкретная колонка внутри справочника. Например `cargoInteriorHeightIn` не является общей переменной; она зависит от выбранного vehicle/body spec.

**Variable / Reference field** — значение, для которого еще нужно решить модель хранения: общий coefficient или значение по строкам справочника.

**Governance variable** — управленческое правило, которое влияет на approval, payout, discount, helper policy или audit.

**Rule set** — набор условий, который возвращает решение: allowed, blocked, manual review, min crew, vehicle required.

**Derived reference value** — значение, подтянутое из выбранной строки справочника. Его нельзя трактовать как глобальный threshold.

## Важный пример

`selectedVehicleCargoHeightIn` — это **Derived reference value**.

Оно берется из:

```text
selectedVehicle.cargoBodySpecId -> Vehicle Dimensions / Cargo Body Specs -> cargoInteriorHeightIn
```

Если Sprinter имеет `cargoInteriorHeightIn = 72`, то `72 in` является параметром конкретного кузова, а не универсальной бизнес-переменной.

Правильная формула:

```text
selectedVehicleHeightExceeded = itemHeight > selectedVehicle.cargoInteriorHeightIn
```

Неправильно:

```text
tallItemFlag = itemHeight > 72
```

Потому что другой truck может иметь высоту кузова 96 in или 155 in, и тот же item уже не будет проблемой по высоте.

## CSV

Полная таблица терминов:

```text
docs/formula-spec/glossary_variable_types.csv
```
