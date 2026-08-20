# Fleissig — site audit remediation progress

Date: 2026-08-20

Applied skills: `site-audit` + `attribution`

## Current verdict

The first remediation pass is complete and deployed to production. All production builds now run the regression suite before Vite builds. The final checked build passed 12 test files / 96 tests and deployed successfully.

No P0 issue remains from the audit. The highest-risk analytics/consent defects identified in the first audit are resolved or production-mitigated. Several lower-priority cleanup items remain and should be handled in a second pass.

## Resolved / production-mitigated

| Original finding | Current status | Remediation |
|---|---|---|
| Canonical contact event plus legacy contact event could both reach GA4 | Resolved | Active AppV4/Umzug page-local contact tracking was removed. Canonical `whatsapp_click` / `phone_click` now owns contact measurement. A central compatibility guard also suppresses the historical legacy event names. |
| Old page-local cookie banners / GA loaders existed under the central consent layer | Resolved for active pages | Historical active-page cookie banners and local tag loaders were physically removed. Consent/tag loading remains centralized in `privacyConsent.js` + `SitePrivacyControls.jsx`. |
| Paid first-touch could be lost after accepting consent and navigating internally | Resolved | Tracking now listens for `fleissig-consent-changed` and persists the pre-consent touch immediately after acceptance. Regression test covers GCLID + UTM persistence and one canonical WhatsApp event. |
| GA4 `(data not available)` could be classified as a real source | Resolved in production attribution job | The production attribution entry point treats `(data not available)` as unresolved/unknown, so it cannot become `Другой сайт` with false confidence. |
| No current-architecture regression gate | Resolved | Consent, tracking, privacy-dialog and deployment-config regression tests were added. `npm run build` now runs the test suite first, and a Site CI workflow also exists. |
| Public credential-shaped fal.ai example + unused client | Repository cleaned | Credential-shaped example was removed and unused `fal-ai-client.ts` deleted. If the historical value was ever a real credential, rotation/revocation remains a manual security action because Git history is public. |
| Catch-all rewrite created soft 404s | Resolved | Catch-all rewrite removed. Live QA check of a random nonexistent path returns HTTP 404; the three intended pages remain HTTP 200. |
| Missing browser hardening headers | Improved | Production now returns CSP (`base-uri`, `object-src`, `frame-ancestors`, `form-action`, upgrade-insecure-requests), HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy and Permissions-Policy. |
| Privacy dialog lacked keyboard focus management | Resolved | Added initial focus, tab trapping, Escape close and focus restoration; regression-tested. |
| Duplicate root/public robots/manifest and stale public Vercel config | Resolved | Duplicate/stale source files were removed; `public/` is the canonical source for robots/manifest assets. |
| Oversized PNG used as browser/app icon | Mitigated | Browser and manifest now use the lightweight SVG favicon. Large logo asset remains available for business/schema use and can be optimized separately. |
| Sitemap `lastmod` stale | Resolved | Sitemap updated to 2026-08-20 for materially changed pages. |
| Fenster social metadata incomplete | Resolved | Added matching OG image details and Twitter card metadata. |
| Superseded `scripts/ga4_sync.py` remained in repo | Resolved | Removed; production analytics workflow uses `attribution_job.py` + `attribution_sync.py`. |

## Confirmed production checks after remediation

- Latest production deployment is READY and aliased to `fleissig-reinigung.ch`.
- Final build passed 12 test files / 96 tests before bundling.
- `/`, `/umzugsreinigung-aargau`, `/fensterreinigung-aargau` return HTTP 200.
- A random nonexistent URL returns HTTP 404 instead of the homepage.
- Production HTML responses include the new security headers.
- Current active AppV4 no longer owns raw GA/Meta contact tracking; canonical tracking is centralized.

## Remaining second-pass work

1. **Google Fonts before consent / performance (P2).** Static HTML still preconnects to Google Fonts and active page CSS imports Plus Jakarta Sans from Google. Prefer self-hosting/subsetting or a system stack; then align privacy text accordingly.
2. **Offline conversion business timestamps (P2).** `google_ads_export.py` still stamps booked/completed helper times when the sync first observes the CRM status. We need explicit real milestone timestamps in CRM and must export those exact times.
3. **Old application generations and dependencies (P2).** `App.jsx`, `AppV2.jsx`, `AppV3.jsx` and their old tests/dependencies remain. They no longer own production, but still add maintenance ambiguity. Migrate any useful coverage to AppV4/current landings, then delete the obsolete generations and remove unused dependencies from package/lock.
4. **Large business-logo PNG (P2/P3).** The browser no longer needs it as favicon, but `logo.png` remains large and is referenced by schema. Generate an appropriately sized optimized logo asset before replacing it.
5. **Exact external verification (manual).** Tag Assistant/GA4 DebugView, Google Ads auto-tagging/account link and Search Console URL Inspection still require account/browser-level verification.
6. **Historical secret provenance (manual).** Determine whether the former fal.ai-looking example was ever a valid credential. If yes, revoke/rotate it regardless of its removal from the current branch.

## Next remediation order

1. Move Google Fonts off third-party pre-consent loading.
2. Add explicit `Gebucht am` / `Abgeschlossen am` business timestamps to the CRM workflow and use them for Ads export.
3. Migrate useful tests from old app generations, then delete App/AppV2/AppV3 and unused dependencies.
4. Optimize the remaining large logo asset.
5. Re-run full `site-audit` after these changes and perform the manual Tag Assistant / DebugView / Search Console checks.
