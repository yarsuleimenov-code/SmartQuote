# Zaberman LLC SmartQuote - Broker Productivity Pipeline

## Purpose

This pipeline fixes the near-term development order for SmartQuote with one primary goal:

```text
Help the broker calculate, verify, and send prices faster with fewer mistakes.
```

Security hardening, internal infrastructure, and enterprise controls are intentionally outside the focus of this phase. The current priority is business usability and calculation reliability.

## Product Principle

Broker workflow must optimize for:

- fast quote entry;
- low cognitive load;
- clear assumptions;
- visible warnings;
- quick conversion from presales quote to customer estimate;
- repeatable pricing checks against known Excel benchmarks.

The system should not force the broker to think like an analyst during the first call. Complexity should be surfaced only when it changes price or requires review.

## Phase 1 - Quote Speed And Input Ergonomics

### Goal

Reduce the time needed to create a usable price estimate.

### Scope

- Make Quick Quote the fastest path for presales calls.
- Keep default Quick Quote assumptions conservative.
- Reduce repeated typing between Quick Quote and Full Calculation.
- Make required fields visually obvious.

### Planned Improvements

- Add common item templates: box, sofa, table, cabinet, mattress, artwork / mirror, custom item.
- Add one-click item duplication.
- Add keyboard-friendly item entry.
- Add inline volume helper: dimensions to cu ft, with cu ft rounded up for Quick Quote.
- Preserve Quick Quote assumptions when converting to Full Quote: pickup crew, delivery crew, rounded volume, packaging assumptions.

### Acceptance Criteria

- Broker can create a Quick Quote in under 60 seconds.
- Broker can convert Quick Quote to Full Quote without re-entering route or items.
- Empty item rows never create price.
- Quick Quote default crew remains 2 people.

## Phase 2 - Calculation Trust And Error Prevention

### Goal

Prevent bad estimates caused by incomplete or unrealistic inputs.

### Scope

- Improve validation before estimate generation.
- Make calculation assumptions visible.
- Add business warnings that match broker decisions.

### Planned Improvements

- Add quote readiness status: Ready, Missing item data, Unsupported route, Manual review recommended, Oversized / overweight warning.
- Add warning severity: Info, Warning, Blocker.
- Block customer estimate generation for blocker conditions.
- Show assumptions panel: route source, crew, vehicle, volume, access conditions, rounding.
- Expand smoke tests with broker-relevant cases: Quick Quote rounded volume, 1-person vs 2-person crew, stairs, long carry, COI, storage, full coverage, multi-item shipment.

### Acceptance Criteria

- Broker sees why a price changed.
- Invalid dimensions do not silently produce a customer estimate.
- Known Excel benchmark cases remain stable after changes.

## Phase 3 - Full Quote Workflow Acceleration

### Goal

Make the full calculator efficient enough for repeated daily broker use.

### Scope

- Reduce scrolling and hunting for fields.
- Improve item table usability.
- Keep pricing summary visible and actionable.

### Planned Improvements

- Add sticky item action toolbar: add item, duplicate item, clear row, expand/collapse advanced fields.
- Add compact item row mode for common quotes.
- Hide advanced item fields by default: storage, declared value, fragile, non-stackable, crate, comments.
- Improve pickup/delivery crew controls: Auto, 1 person, 2 people, 3 people, with clear visual impact on price.
- Add "Recalculate from Quick Quote assumptions" indicator.

### Acceptance Criteria

- Broker can review all core pricing inputs without horizontal confusion.
- Crew/access changes are immediately visible in final price.
- Full Quote remains usable on a laptop screen without excessive scrolling.

## Phase 4 - Estimate Output And Broker Follow-Up

### Goal

Make it easy to send or review a customer-facing estimate.

### Scope

- Improve Estimate Document usability.
- Make HTML/PDF output clean and broker-ready.
- Preserve generated estimate snapshots.

### Planned Improvements

- Add estimate version label: Draft, Generated, Revised.
- Add customer-facing estimate preview from both Quick Quote and Full Quote.
- Add print/PDF layout QA pass.
- Add estimate summary in My Estimates: customer, route, total, created date, valid until, source.
- Add "Reopen as Draft" from estimate.

### Acceptance Criteria

- Broker can generate an estimate document in one click after calculation.
- Estimate HTML/PDF is readable without internal cost details.
- Reopening an estimate creates an editable draft copy, not mutation of the original snapshot.

## Phase 5 - Pricing Review And Admin Calibration

### Goal

Help the business tune pricing while preserving broker workflow speed.

### Scope

- Improve admin review screens.
- Keep broker-facing UI simple.
- Expand benchmark-driven calibration.

### Planned Improvements

- Add pricing test matrix: route, items, expected Excel price, SmartQuote price, delta, status.
- Add cost breakdown review for admin only.
- Add variable change notes.
- Add formula/version label to calculation output.
- Keep `Variables` and `References` read-only until benchmark preview and snapshot governance are in place.
- Start interactive Variables with a limited safe set: margin, rounding, priority fee, storage rate, access fees, packaging rates, and protection plans.
- Add before/after impact preview for accepted benchmark cases before allowing admin save.

### Acceptance Criteria

- Admin can compare SmartQuote vs Excel without manual digging.
- Broker does not see unnecessary formula complexity.
- Pricing adjustments are traceable.
- Any generated estimate stores `formulaVersion` and `variablesSnapshot`.
- Admin cannot silently change pricing constants without a visible version/change note.

## Phase 6 - Persistence And Operational Readiness

### Goal

Move from local testing toward reliable shared workflow.

### Scope

- Stabilize Google Sheets persistence during testing.
- Prepare future backend handoff.
- Keep business entities clean.

### Planned Improvements

- Save full quote payloads to Sheets: quote, items, estimate, pricing result, audit log.
- Add stable IDs for draft, estimate, item.
- Add basic duplicate prevention.
- Document backend migration requirements.
- Add export/import local backup for drafts and estimates.
- Keep Google Sheets as test-mode backup/audit, not the only source of truth.
- Include `manual_adjustment`, displayed `additional_charges`, and calculated base additional charges in payloads for audit clarity.

### Acceptance Criteria

- Saved records can reconstruct a quote.
- Estimate history is not lost between browser sessions.
- Backend migration has clear entity boundaries.

## Near-Term Priority Order

```text
1. Interactive Variables MVP with benchmark impact preview
2. Export/import backup for drafts and estimates
3. Full broker flow QA from Quick Quote to Estimate Document
4. Validation and review-required states
5. Estimate HTML/PDF final polish
6. Sheets persistence stabilization
7. Backend migration preparation
```

## What Not To Prioritize Now

Do not prioritize:

- complex authentication;
- customer portal;
- driver mobile workflow;
- advanced dispatch;
- AI pricing;
- deep analytics;
- payment integration;
- multi-tenant architecture.

These are useful later, but they do not currently improve broker speed in daily pricing work.

## Current Working Assumptions

- Quick Quote is intentionally conservative.
- Quick Quote default crew is 2 people.
- Quick Quote volume is rounded up to the next whole cu ft.
- Full Quote is the detailed calculation workspace.
- Estimate Document is customer-facing and should hide internal cost logic.
- Admin views are for calibration and review, not daily broker quoting.
- `Variables` and `References` are intentionally read-only until governed variable editing is implemented.
- Existing accepted calculation benchmarks are the release gate for every pricing-related change.

## Success Metric

The near-term product phase succeeds when:

```text
A broker can go from customer call input
to a defensible customer estimate
quickly, repeatedly, and with fewer manual Excel checks.
```
