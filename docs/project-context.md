# SmartQuote Project Context

## Product

SmartQuote is a Zaberman LLC broker calculator for quick quotes, full customer estimates, quote breakdowns, drafts, and estimate documents.

## Primary User

Sales broker / admin user who needs fast, explainable, and reasonably accurate interstate delivery pricing.

## Current Business Focus

- Improve speed and clarity of broker-side price calculation.
- Keep calculations aligned with the original spreadsheet where business logic is confirmed.
- Prioritize practical usability over architectural expansion.
- Avoid unnecessary security hardening during test mode unless explicitly requested.

## Key Pricing Notes

- `CA South -> CA North` with `85 x 63 x 47`, `qty 1`, volume-dominant weight such as `80-150 lb`, crew `2/1/2` is expected around `$850`.
- Long interstate route examples such as `NY Area -> CA North` may be around `$1360` for the same item.
- `Eff. volume` is rounded up to a whole cubic foot in the calculation model.
- Empty items and name-only items must not create a non-zero quote.
- Quick Quote defaults to 2-person crew assumption.

## Current Architecture

- Static frontend deployed through Cloudflare Pages.
- Pricing logic is local JavaScript in `js/calculator.js`.
- UI for Full Quote is in `index.html` and `js/ui.js`.
- Quick Quote logic is in `quick-quote.html` and `js/quickQuote.js`.
- Local/browser storage is used for drafts; Google Sheets integration exists through Apps Script endpoint.

## Work Style

- Make minimal targeted changes.
- Preserve confirmed calculations unless a business bug is explicitly identified.
- Add or update smoke tests when calculation behavior changes.
- Push to `main` after verified changes when implementation is requested.
