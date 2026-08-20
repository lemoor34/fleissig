# Fleissig production rollback

The active production entry point is `src/main.jsx`.

Current routes:

- `/` → `src/AppV4.jsx`
- `/umzugsreinigung-aargau` → `src/UmzugsreinigungLanding.jsx`
- `/fensterreinigung-aargau` → `src/FensterreinigungLanding.jsx`

Consent and measurement ownership is centralized in:

- `src/privacyConsent.js`
- `src/tracking.js`
- `src/SitePrivacyControls.jsx`

Do not restore an older `AppV2`/`AppV3` generation as a rollback method. Those files are historical code, not a supported production fallback.

## Rollback procedure

Use the last known-good Git commit / Vercel production deployment and redeploy that exact revision. This keeps the HTML entry points, routing, Consent Mode, analytics and CRM attribution code on one consistent revision.

After a rollback verify:

1. `/`, `/umzugsreinigung-aargau` and `/fensterreinigung-aargau` return HTTP 200.
2. A nonexistent URL returns HTTP 404.
3. `npm run build` passes the regression tests.
4. Consent defaults are denied before optional measurement loads.
5. One WhatsApp or phone action emits one canonical contact event.

Avoid partial file-by-file rollback of analytics or consent code because the tracking, consent and attribution layers are designed to work as one versioned system.
