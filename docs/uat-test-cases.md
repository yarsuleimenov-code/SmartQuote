# UAT Calculation Test Cases

Source workbook: `Zaberman_Calculator_UAT.xlsx`.

## Purpose

Use this file as the compact UAT checklist for validating SmartQuote calculations against confirmed Spreadsheet/Zion baselines.

## Test Cases

| ID | Scenario | Checks | Route | Items | Qty | Conditions | Spreadsheet | Zion |
| --- | --- | --- | --- | --- | --- | --- | ---: | ---: |
| T01 | Minimum order | Base calculation | CA South -> CA North | Chair | 1 | - | 360 | 360 |
| T02 | Standard interstate | Distance / price | NY Area -> CA South | Sofa | 1 | - | 540 | 540 |
| T03 | Heavy item | Team / vehicle | Boston -> CA South | Cabinet | 3 | - | 880 | 880 |
| T04 | Fragile shipment | Warnings | NY Area -> Boston | Artwork / Mirror | 5 | Fragile | 470 | 470 |
| T05 | Non-stackable shipment | Warnings | CA South -> DC Area | Mattress | 3 | Non-stackable | 1280 | 1280 |
| T06 | Multiple items | Totals | CA South -> NY Area | Sofa + Chair + Table | 2 / 4 / 1 | 3 items | 1460 | 1460 |
| T07 | Large order | Vehicle / team | CA South -> NY Area | Sofa + Chair + Table + Cabinet + Mattress | 3 / 2 / 2 / 2 / 5 | 5 items | 3680 | 3660 |
| T08 | Insurance and storage | Insurance / storage | CA South -> DC Area | Cabinet + Artwork / Mirror | 5 / 10 | Mirror value 5000 at 2.5%, cabinet storage 30 days | 2315 | 2310 |

## Usage Rules

- Treat Spreadsheet/Zion values as UAT baselines, not as automatic proof that current SmartQuote logic is wrong.
- When a mismatch appears, first confirm route, item template assumptions, crew, insurance, storage, and warning flags.
- Do not change confirmed pricing logic without a reproduced mismatch and a clear business decision.
- If a calculation bug is fixed, add or update a smoke/regression test for that case.

