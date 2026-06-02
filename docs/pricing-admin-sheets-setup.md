# Pricing Admin Sheets Setup

This setup is separate from the existing quote/draft/estimate Apps Script.
Do not modify `google-apps-script.gs` for Pricing Admin storage.

## Workbook

Create a new Google Sheets workbook:

```text
SmartQuote Pricing Admin Storage
```

## Sheets And Columns

### variables_versions

- `variablesVersion`
- `formulaVersion`
- `status`
- `updatedAt`
- `updatedBy`
- `changeNotes`
- `variablesSnapshotJson`

### fuel_prices

- `variablesVersion`
- `fuelType`
- `currentAvg`
- `fuelSurchargePct`
- `internalFuelPrice`
- `updatedAt`
- `updatedBy`

### vehicles

- `vehicleId`
- `vehicleName`
- `category`
- `capacityCuFt`
- `maxWeightLb`
- `fuelType`
- `mpg`
- `passengerCapacity`
- `costPerMile`
- `active`
- `variablesVersion`
- `updatedAt`
- `updatedBy`

### pricing_admin_audit

- `auditId`
- `timestamp`
- `action`
- `entityType`
- `entityId`
- `previousSnapshotJson`
- `newSnapshotJson`
- `updatedBy`
- `source`

### config_exports

- `exportId`
- `timestamp`
- `formulaVersion`
- `variablesVersion`
- `exportJson`

## Apps Script Setup

1. Open the `SmartQuote Pricing Admin Storage` workbook.
2. Go to `Extensions -> Apps Script`.
3. Create or replace the script content with `google-pricing-admin-script.gs` from this repo.
4. Save the Apps Script project.
5. Run `doGet` once from the Apps Script editor to authorize workbook access.
6. Confirm that the five sheets above are created with header rows.

## Deploy Web App

1. In Apps Script, select `Deploy -> New deployment`.
2. Choose type `Web app`.
3. Execute as: `Me`.
4. Who has access: choose the intended test access level.
5. Deploy and copy the Web App URL.

## Frontend Configuration

Paste the Web App URL into [js/config.js](../js/config.js):

```js
window.PRICING_ADMIN_SCRIPT_URL = "https://script.google.com/macros/s/.../exec";
```

If `PRICING_ADMIN_SCRIPT_URL` is empty, `js/pricingAdminStorage.js` still saves locally and returns a skipped remote result instead of breaking the calculator.

