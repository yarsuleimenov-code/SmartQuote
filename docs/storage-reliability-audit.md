# Storage Reliability Audit

Stage 6 scope: document the current browser storage model and add MVP backup/export-import without changing pricing formulas.

## Storage Keys

| Key | Source File | Data Stored | Used By Page / Module | Status | Risk | Decision |
|---|---|---|---|---|---|---|
| `currentVariables` | `js/pricingConfig.js`, `js/pricingAdminStorage.js` | Current runtime pricing snapshot | Variables, PricingConfig snapshot, estimate snapshot audit | active | Can diverge from defaults; local only | backup/export |
| `variablesVersions` | `js/pricingConfig.js`, `js/pricingAdminStorage.js` | Version history records for runtime variables | Variables, Pricing Admin audit | active | Local-only history can be lost | backup/export |
| `vehicles` | `js/pricingConfig.js`, `js/referencesVehicles.js`, `js/pricingAdminStorage.js` | Runtime vehicle records | References, calculator vehicle fit, fuel cost | active | Stale data can affect quotes; migration exists | backup/export |
| `vehiclesSeedVersion` | `js/pricingConfig.js` | Seed migration marker | PricingConfig vehicle migration | migration/fallback | Missing marker can trigger seed migration | backup/export |
| `fuelPrices` | `js/pricingConfig.js`, `js/variablesAdmin.js`, `js/pricingAdminStorage.js` | Runtime fuel price records | Variables, calculator fuel cost | active | Local changes affect new draft calculations | backup/export |
| `drafts` | `js/pricingConfig.js` | Pricing Admin placeholder bucket | PricingConfig baseline structure | active | Mostly unused by broker workflow today | backup/export |
| `estimates` | `js/pricingConfig.js` | Pricing Admin placeholder bucket | PricingConfig baseline structure | active | Mostly unused by broker workflow today | backup/export |
| `calculationLogs` | `js/pricingConfig.js`, `js/pricingAdminStorage.js` | Pricing Admin audit events | Pricing Admin adapter | active | Audit trail is local-only | backup/export |
| `zaberman-zip-coverage-overrides` | `js/coverageZips.js` | Per-ZIP coverage status and future price coefficient overrides | ZIP Coverage | active | Local-only admin settings can be lost with browser storage | backup/export |
| `zaberman-pricing-config` | `js/pricingConfig.js` | Future saved admin config overrides | PricingConfig apply/reset config | active | Could override runtime values if used | backup/export |
| `zaberman-calculator-draft` | `js/storage.js` | Last/current draft snapshot | Quote Draft, legacy migration, current UX | legacy | Single-record legacy key can drift from draft list | backup/export |
| `zaberman-calculator-drafts` | `js/storage.js` | Multiple saved quote drafts | My Drafts, Quote Draft load/select | active | Main broker draft data can be lost with browser storage | backup/export |
| `zaberman-current-draft-id` | `js/storage.js` | Current selected draft id | Quote Draft, Estimate snapshot sourceDraftId | active | Missing value degrades UX but does not corrupt drafts | backup/export |
| `zaberman-estimate-snapshot` | `js/storage.js` | Last/current estimate snapshot | Estimate Document, legacy migration, current UX | legacy | Single-record legacy key can drift from snapshot list | backup/export |
| `zaberman-estimate-snapshots` | `js/storage.js` | Multiple generated estimate snapshots | My Estimates, Estimate Document, Cost Breakdown | active | Main customer-facing history can be lost with browser storage | backup/export |
| `zaberman-current-estimate-id` | `js/storage.js` | Current selected estimate id | Estimate Document, Cost Breakdown | active | Missing value degrades UX but does not corrupt estimates | backup/export |
| `zabermanUserRole` | `sidebar.js` | Local UI role preference | Sidebar navigation/access presentation | active | Not business data; exporting could restore the wrong local role state | do not export |
| `zaberman-storage-preimport-backup` | `js/storageBackup.js` | Automatic pre-import backup snapshot | Storage Backup MVP | migration/fallback | Can grow large over time if not pruned later | keep |
| `zaberman-storage-backup-meta` | `js/storageBackup.js` | Last export/import timestamps | Drafts/Estimates backup panels | active | Informational only | keep |

## Decisions

- Export/import should include both active workflow keys and legacy current-record keys because current pages still use both list and current-selection storage.
- Invalid backup imports must be rejected before writing any data.
- A pre-import backup snapshot is created before a valid import overwrites local storage.
- Key consolidation is intentionally deferred; current migrations and fallbacks are working and should not be refactored during Stage 6.
