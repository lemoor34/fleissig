# Fleissig — site audit remediation progress

Date: 2026-08-20

Applied skills: `site-audit` + `attribution`

## Current verdict

The first remediation pass, production hardening pass and legacy-code cleanup are complete and deployed. Production builds now run the current regression suite before Vite builds. The final checked deployment passed 7 test files / 22 tests and then built successfully.

No P0 issue remains from the audit, and no confirmed P1 code defect from the original register remains unresolved. The remaining technical work is lower priority: exact business milestone timestamps for offline conversions and optimization of the large schema logo asset. Account/browser-level validation remains a separate final verification step.

## Resolved / production-mitigated

| Original finding | Current status | Remediation |
|---|---|---|
| Canonical contact event plus legacy contact event could both reach GA4 | Resolved | Active AppV4/Umzug page-local contact tracking was removed. Canonical `whatsapp_click` / `phone_click` now owns contact measurement. A central compatibility guard also suppresses the historical legacy event names. |
| Old page-local cookie banners / GA loaders existed under the central consent layer | Resolved | Historical active-page cookie banners and local tag loaders were physically removed. Consent/tag loading remains centralized in `privacyConsent.js` + `SitePrivacyControls.jsx`. |
| Paid first-touch could be lost after accepting consent and navigating internally | Resolved | Tracking listens for `fleissig-consent-changed` and persists the pre-consent touch immediately after acceptance. Regression coverage verifies GCLID + UTM persistence and one canonical WhatsApp event. |
| GA4 `(data not available)` could be classified as a real source | Resolved in production attribution job | The production attribution entry point treats `(data not available)` as unresolved/unknown, so it cannot become `Другой сайт` with false confidence. |
| No current-architecture regression gate | Resolved | Consent, tracking, privacy-dialog, active-architecture, current-page and deployment-config regression tests are present. `npm run build` runs tests first and a Site CI workflow also exists. |
| Public credential-shaped fal.ai example + unused client | Repository cleaned | Credential-shaped example was removed and unused `fal-ai-client.ts` deleted. If the historical value was ever a real credential, rotation/revocation remains a manual security action because Git history is public. |
| Catch-all rewrite created soft 404s | Resolved | Catch-all rewrite removed. Live QA check of a random nonexistent path returns HTTP 404; the three intended pages remain HTTP 200. |
| Missing browser hardening headers | Improved | Production returns CSP (`base-uri`, `object-src`, `frame-ancestors`, `form-action`, upgrade-insecure-requests), HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy and Permissions-Policy. |
| Google Fonts requested before consent | Resolved | Removed Google Fonts preconnects and CSS imports from all active pages. Active pages use a local/system font stack and no longer need a third-party font request before consent. |
| Privacy dialog lacked keyboard focus management | Resolved | Added initial focus, tab trapping, Escape close and focus restoration; regression-tested. |
| Duplicate root/public robots/manifest and stale public Vercel config | Resolved | Duplicate/stale source files were removed; `public/` is the canonical source for robots/manifest assets. |
| Oversized PNG used as browser/app icon | Mitigated | Browser and manifest use the lightweight SVG favicon. Large logo asset remains available for business/schema use and can be optimized separately. |
| Sitemap `lastmod` stale | Resolved | Sitemap updated to 2026-08-20 for materially changed pages. |
| Fenster social metadata incomplete | Resolved | Added matching OG image details and Twitter card metadata. |
| Superseded `scripts/ga4_sync.py` remained in repo | Resolved | Removed; production analytics workflow uses `attribution_job.py` + `attribution_sync.py`. |
| Multiple obsolete AI-generated app generations/dependencies | Resolved | `App.jsx`, `AppV2.jsx`, `AppV3.jsx`, their stale tests and unused Formspree/router dependencies were removed. Current AppV4/service-page smoke tests and architecture guards replaced the legacy coverage. |
| Rollback instructions pointed to obsolete AppV3 | Resolved | Rollback documentation now requires reverting/deploying one known-good Git/Vercel revision so consent, tracking and attribution remain version-consistent. |

## Confirmed production checks after remediation

- Final production deployment for current main is READY and aliased to `fleissig-reinigung.ch`.
- Final build passed 7 test files / 22 tests before bundling.
- `/`, `/umzugsreinigung-aargau`, `/fensterreinigung-aargau` return HTTP 200.
- A random nonexistent URL returns HTTP 404 instead of the homepage.
- Production HTML responses include the new security headers.
- Current root HTML contains no Google Fonts preconnect/import dependency.
- Current active AppV4/service pages no longer own raw GA/Meta contact tracking; canonical tracking is centralized.
- Current package dependencies no longer include `@formspree/react` or `react-router-dom`.

## Remaining work

1. **Offline conversion business timestamps (P2).** `google_ads_export.py` still stamps booked/completed helper times when the sync first observes the CRM status. This is stable and normally within the hourly sync window, but it is not guaranteed to equal the exact real-world booking/completion time if CRM status is entered later. A future CRM workflow should store explicit `Забронирован в` / `Выполнен в` milestone timestamps at the moment of the business action and export those exact values.
2. **Large business-logo PNG (P2/P3).** The browser no longer needs the large PNG as favicon/app icon, but `logo.png` remains large and is referenced by LocalBusiness schema. Generate an appropriately sized optimized logo asset before replacing the schema URL.
3. **Exact external verification.** Tag Assistant/GA4 DebugView, Google Ads auto-tagging/account link and Search Console URL Inspection remain account/browser-level checks rather than repository defects.
4. **Historical secret provenance.** Determine whether the former fal.ai-looking example was ever a valid credential. If yes, revoke/rotate it regardless of its removal from the current branch.

## Next remediation order

1. Improve the CRM milestone timestamp workflow for offline Google Ads conversions.
2. Optimize the remaining large schema logo asset.
3. Re-run the full `site-audit` after those changes and complete the external Tag Assistant / DebugView / Search Console validation.
