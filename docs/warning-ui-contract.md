# Warning UI Contract

## Purpose

Normalize current calculator warnings into a consistent broker-facing presentation model without changing pricing formulas.

## Contract

Each warning record contains:

| Field | Meaning |
| --- | --- |
| `id` | Stable warning identifier. |
| `severity` | `info`, `warning`, `approval`, or `blocking`. |
| `scope` | `route`, `item`, `protection`, `capacity`, or `quote`. |
| `target` | UI field or item identifier related to the warning. |
| `title` | Short broker-facing label. |
| `message` | Explanation of the issue. |
| `actionLabel` | Recommended broker action. |
| `approvalRole` | Future approval owner when applicable. |
| `blocksEstimate` | Governance intent. Enforcement remains disabled until approval policy is approved. |

## Readiness

```text
blocking warning present -> Blocked
warning/approval present -> Review Required
no warnings -> Ready
```

`Blocked` is currently a presentation state only. Estimate-generation enforcement requires approved warning policy, roles, shared storage, and audit events.

## Current AS-IS Mapping

| Current condition | UI severity | Recommended action |
| --- | --- | --- |
| Entered ZIP route is unsupported | Blocking | Correct ZIP or review service area |
| Route ZIP is missing | Warning | Enter pickup and delivery ZIP |
| No complete item | Warning | Add item dimensions or weight |
| Item has volume but no weight | Warning | Enter item weight |
| Heavy / bulky item | Approval Required | Review crew and handling |
| Extremely heavy item | Approval Required | Review crew, equipment, and vehicle |
| FVP without Declared Value | Blocking | Enter Declared Value |
| DV selected | Approval Required | Confirm declared value and future pricing handling |
| Effective volume is 250+ cu ft | Approval Required | Review Direct service and capacity |

## Safeguards

- The adapter does not calculate price.
- The adapter does not change `js/calculator.js`.
- The adapter does not infer TO-BE dimensional fit or density outputs.
- Manager approval is not simulated locally.
- Blocking enforcement is deferred until governance is approved.

