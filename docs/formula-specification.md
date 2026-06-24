# SmartQuote AS-IS Formula Audit Workbook

Status: structured CEO / BA / developer audit draft.

Purpose: дать Alexander и команде структурированную "простыню" текущих AS-IS формул калькулятора, которую удобно читать, проверять и менять перед Formula Sprint.

Этот файл не меняет бизнес-логику и не вводит TO-BE правила. Он структурирует текущие формулы:

- формулы разбиты на блоки;
- `Formula ID` отражает блок;
- изменяемые variables вынесены отдельно;
- справочники вынесены отдельно;
- для каждой формулы видно, что считается, откуда берется input, куда передается output;
- subtotals и final customer price можно пройти по цепочке.

## Файлы

- `docs/formula-spec/formulas.xlsx` - основной workbook для проверки.
- `docs/formula-spec/as_is_formula_master.csv` - все AS-IS формулы в одном списке.
- `docs/formula-spec/formula_index.csv` - оглавление workbook.
- `docs/formula-spec/variables_reference.csv` - изменяемые coefficients / variables.
- `docs/formula-spec/reference_sources.csv` - справочники и источники input data.
- `docs/formula-spec/output_flow_map.csv` - куда передаются ключевые результаты.
- `docs/formula-spec/01_system_route.csv` ... `09_final_snapshot.csv` - формулы по блокам.

## Formula ID

ID теперь отражает блок:

| Prefix | Block |
| --- | --- |
| `SYS` | System helpers. |
| `RTE` | Route / Distance. |
| `ITM` | Item calculations. |
| `VEH` | Vehicle fit. |
| `PKG` | Packaging. |
| `PROT` | Protection plan. |
| `STO` | Storage. |
| `FUEL` | Fuel. |
| `PICK` | Pickup stage. |
| `INT` | Interstate stage. |
| `DEL` | Delivery stage. |
| `ACC` | Access conditions. |
| `OPT` | Order options. |
| `ADJ` | Adjustments. |
| `FINAL` | Final total. |
| `SNAP` | Snapshot / audit. |

Example:

```text
ITM-002 = Physical Volume
PICK-004 = Pickup Mileage Cost
FINAL-014 = Final Customer Price
```

## Formula Sheet Columns

Основные formula sheets используют компактную структуру:

| Column | Meaning |
| --- | --- |
| `Formula ID` | Уникальный ID с block prefix. |
| `Block` | Бизнес-блок расчета. |
| `Formula / Variable` | Название формулы или расчетной переменной. |
| `Formula` | Формульный расчет в читаемом виде. |
| `Описание логики расчета` | Русское описание: что берется, как считается, зачем нужно. |
| `Level` | Уровень: System, Route, Item, Pickup, Interstate, Delivery, Order, Snapshot. |
| `Source / Input` | Откуда берутся входные данные. |
| `Output / Goes To` | Куда передается результат. |
| `Used In` | Где используется результат в калькуляторе. |

## Scope

Включено только AS-IS:

- текущая логика `js/calculator.js`;
- текущие runtime variables из `js/variables.js`;
- текущий snapshot/config flow из `js/pricingConfig.js`;
- текущие input sources из Quote Draft / Quick Quote / Item Catalog;
- текущий Cost Breakdown / Estimate Document output.

Не включено:

- TO-BE правила;
- будущие изменения;
- новые формулы;
- refactor;
- изменения `js/calculator.js`.

TO-BE / Future нужно оформить отдельным заданием после согласования AS-IS.

## Workbook Structure

| Sheet | Purpose |
| --- | --- |
| `00_formula_index` | Навигация по workbook. |
| `AS_IS_MASTER` | Все AS-IS формулы в одном списке. |
| `01_system_route` | System helpers, ZIP, zone, distance. |
| `02_item_vehicle` | Item volume/weight/effective volume/crew/vehicle. |
| `03_pkg_prot_storage` | Packaging, protection, storage. |
| `04_fuel` | Fuel price, MPG, fuel per unit mile. |
| `05_pickup_stage` | Pickup labor, mileage, handling, subtotal. |
| `06_interstate_stage` | Interstate fuel, vehicle, driver, subtotal. |
| `07_delivery_stage` | Delivery labor, mileage, handling, subtotal. |
| `08_access_adjustments` | Access fees, options, special labor, legacy adjustment. |
| `09_final_snapshot` | Route cost, service cost, margin, raw/final price, snapshot. |
| `VARIABLES` | Изменяемые variables / coefficients. |
| `REFERENCES` | Справочники и input sources. |
| `OUTPUT_FLOW` | Куда идут ключевые intermediate results. |

## Как читать

```text
1. Найти формулу в AS_IS_MASTER по названию или Formula ID.
2. Открыть block sheet по prefix: ITM -> 02_item_vehicle, PICK -> 05_pickup_stage.
3. Проверить Formula.
4. Прочитать Source / Input: откуда берутся данные.
5. Прочитать Output / Goes To: куда передается результат.
6. Если меняется коэффициент, открыть VARIABLES.
7. Если меняется справочник, открыть REFERENCES.
```

Пример:

```text
ITM-002 Physical Volume
Source / Input: Quote Draft item row, Quick Quote catalog transfer, Item Catalog defaults
Formula: Length(in) x Width(in) x Height(in) / 1728 x Quantity
Output / Goes To: Billable items, physical volume, effective volume, total weight, warning, crew need
```

Так CEO / BA / developer может пройти цепочку:

```text
Order Inputs
-> Item Calculations
-> Pickup / Interstate / Delivery subtotals
-> Additional Charges
-> Brokered Price
-> Raw Price
-> Final Customer Price
```

## AS-IS Formula Blocks

- System helpers.
- Route and distance.
- Item volume / weight / effective volume.
- Vehicle fit.
- Packaging / protection / storage.
- Fuel.
- Pickup stage.
- Interstate stage.
- Delivery stage.
- Access fees.
- Special labor / adjustments.
- Additional charges.
- Margin / broker fee.
- Raw price.
- Final customer price.
- Snapshot / audit output.

## CEO Review Questions

- Все ли текущие price components видны?
- Понятно ли, откуда берется каждый input?
- Понятно ли, куда идет каждый intermediate result?
- Видно ли отдельно pickup / interstate / delivery?
- Можно ли по этому листу объяснить, почему получилась цена?
- Какие AS-IS формулы требуют бизнес-подтверждения перед Formula Sprint?
- Какие variables можно менять без переписывания формулы?
- Какие справочники должны стать source of truth?

## Important AS-IS Notes

- `Direct Pickup` и `Direct Delivery` сейчас capture-only и не меняют price.
- `DV` сейчас не имеет отдельной pricing logic и фактически идет как Basic Liability для цены.
- Per-item packaging cost сейчас tracked/displayed, но не добавляется напрямую в `additionalCharges`.
- `Custom Crate` сейчас flat tracked packaging rate, не surface-area formula.
- `Item Ref. Price` является internal allocation metric и не должен использоваться как declared value.
- Estimate snapshots сохраняют `formulaVersion`, `variablesSnapshot`, `quote` и `result`, чтобы старые estimates не пересчитывались.
