# Production Deployment

## Google Sheets Endpoint Protection

Frontend config lives in `js/config.js`.

Generate a production token and store it only in deployment settings:

```text
SHEETS_AUTH_TOKEN=<generated-secret-token>
```

The same value must be configured in Apps Script and in the Cloudflare Pages Function environment:

1. Open the Apps Script project.
2. Go to **Project Settings**.
3. Under **Script Properties**, add:
   - Property: `SHEETS_AUTH_TOKEN`
   - Value: the generated secret token
4. Save properties.
5. Replace Apps Script code with `google-apps-script.gs`.
6. Deploy a new Web App version.

Without this property, Google Sheets saves are rejected.

## Frontend Production Config

`js/config.js` controls:

- environment name;
- public app API endpoint;
- enabled/disabled state.

The frontend must call `/api/sheets/save`. Do not put the real Apps Script endpoint or token in browser JavaScript.

## Cloudflare Pages Environment Variables

Set these variables for the deployed Pages project:

```text
APPS_SCRIPT_ENDPOINT=<apps-script-web-app-url>
SHEETS_AUTH_TOKEN=<generated-secret-token>
```

The Pages Function at `functions/api/sheets/save.js` injects `SHEETS_AUTH_TOKEN` server-side before forwarding the request to Apps Script.

## Recommended Next Security Step

For stronger business use:

```text
Frontend -> Cloudflare Pages Function -> Apps Script -> Google Sheets
```
