# TO-BE Development Master Architecture

Purpose: полный master contract для разработки формульной логики SmartQuote Calculator с нуля.

## Что входит

- Pricing engine boundary: normalized inputs -> formulas -> result -> trace -> warnings -> snapshot.
- AS-IS compatibility: текущие формулы остаются baseline version.
- TO-BE formula registry: новые формулы реализуются по Formula ID и execution order.
- Variables governance: все бизнес-коэффициенты вынесены из кода в variables.
- References governance: vehicles, ZIP, service areas, labor, payroll, warnings, packaging, protection, fuel, route capacity.
- Calculation trace: каждая pricing-impact строка объясняет, что взяли, откуда, на что умножили и куда передали.
- Snapshot compatibility: старые estimates не пересчитываются silently после изменения variables/references.
- Warning / approval rules: risky quotes должны блокироваться или идти на approval.
- UAT / benchmark cases: обязательная проверка до Formula Sprint rollout.

## Рекомендуемый порядок разработки

1. Freeze AS-IS baseline and smoke tests.
2. Implement normalized input/output contracts.
3. Implement formula version registry.
4. Implement variable/reference stores with versioning.
5. Implement formula execution order and trace.
6. Implement capacity/density, time/labor, access, warnings, margin and snapshot.
7. Run UAT and benchmark preview before changing production formulas.

## Ключевые архитектурные правила

- UI не должен быть источником формульной истины.
- Business-changeable constants не должны жить hardcoded в JS.
- Vehicle fit uses selected vehicle body specs, not a global height threshold.
- Capacity pricing must consider both volume and payload.
- Crew logic must use max single item weight separately from total order weight.
- Contribution margin must be calculated after direct cost, payroll, broker/dispatcher payouts and overhead.
- Estimate snapshot is immutable.

## Основной workbook

Use `docs/formula-spec/tobe_development_master.xlsx` as the implementation handoff file.
