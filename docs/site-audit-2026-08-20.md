# Fleissig — production site & analytics audit

Date: 2026-08-20

Applied skills: `site-audit` + `attribution`

## Verdict

No confirmed P0 outage or catastrophic data-loss defect was found in the current production deployment. The site builds and serves all three intended landing pages, the basic SEO metadata/sitemap/robots setup is sound, CRM is the source of truth, and Consent Mode v2 is initialized before optional measurement tags.

The audit did find several P1 issues that can still distort attribution/conversions or create future regressions, plus P2/P3 cleanup and hardening work. The most important theme is AI-generated layering: current centralized tracking/privacy logic coexists with older page-local implementations instead of replacing them.

## Issue register

| Priority | Status | Area | Finding | Evidence | Business impact | Recommended fix | Verification after fix |
|---|---|---|---|---|---|---|---|
| P1 | Confirmed | Analytics | One CTA can fire the canonical `whatsapp_click`/`phone_click` and an older semantic event such as `conversion_event_contact` or `umzug_whatsapp_click`. | `src/tracking.js` globally captures contact links; `AppV4.jsx` and `UmzugsreinigungLanding.jsx` still send older raw gtag events. Historical GA4 export shows both event families. | GA4/key-event and Ads reporting can be inflated or confusing even though CRM now ignores legacy events. | Remove page-local conversion tracking and emit one canonical event through `trackEvent`; map Meta centrally. Keep legacy names historical only. | Test each CTA with GA4 DebugView: exactly one canonical contact event per click; verify legacy events stop increasing. |
| P1 | Confirmed architecture risk | Consent / AI code | Old CookieBanner and local GA/Meta loaders still exist in every active page while the new central consent system hides old banners with CSS. | `SitePrivacyControls.jsx` contains `.cookie,.lp-cookie,.fw-cookie{display:none!important}`; active page files still render old banners/loaders. | A later AI edit can re-enable competing consent/tag logic and produce duplicate pageviews or contradictory consent. | Delete old cookie banners/loaders/legal privacy implementations after central controls are fully wired; keep one owner for consent and tag loading. | Repo search finds one consent initializer and one GA loader; no hidden historical banners remain. |
| P1 | Confirmed | Attribution | First-party initial touch is captured pre-consent in `history.state`, but it is not immediately persisted when the central consent event changes to accepted. | `tracking.js` calls persistence once during init and has no listener for `fleissig-consent-changed`; only `privacyConsent.js` dispatches that event. | Paid visitor can accept consent, navigate from home to a service page before a tracked event, and lose the original click/UTM context. | On accepted consent, call attribution persistence immediately; regression-test paid entry → accept → internal navigation → WhatsApp. | CRM event retains Google Ads/first landing/click ID after navigation. |
| P1 | Confirmed | Attribution | GA4 value `(data not available)` is not considered unknown. It can become a real session source and then map to `Другой сайт` with overly high confidence. | `UNKNOWN_GA` excludes `(data not available)`; `friendly_source()` maps any non-empty unknown source to `Другой сайт`. | Fresh Google Ads traffic can be mislabeled as referral/other site while GA4 is still processing attribution. | Treat `(data not available)` as unresolved; preserve campaign hints such as cross-network separately, then enrich later when GA4 resolves it. | Fixture/report with `(data not available)` yields `Не определено/Ожидает данных`, never `Другой сайт`. |
| P1 | Needs manual verification | Security | `.env.example` contains a credential-shaped fal.ai example in a public repository. The fal client appears unused. | `.env.example`; `lib/fal-ai-client.ts` is only referenced by itself. | If the example was ever a real credential, it must be considered exposed. | Verify provenance; if ever valid, rotate/revoke it immediately. Remove the credential-shaped example and unused client if not needed. | Secret scan is clean and old credential is revoked if applicable. |
| P1 | Confirmed | Testing / AI code | Production-critical AppV4, consent and tracking code have no matching tests/CI gate; existing tests largely reference older app generations. | Repo test inventory contains App/AppV2 tests; search finds no tests for AppV4/privacyConsent/tracking; only analytics sync workflow exists. | Tracking/privacy regressions can deploy successfully because Vercel only proves that the bundle builds. | Add tests for consent states, click de-duplication, attribution persistence and current landing pages; run them in CI before deploy. | CI blocks a deliberate duplicate-event/consent regression and passes current code. |
| P2 | Confirmed | SEO / routing | Unknown URLs return the root site with HTTP 200 due catch-all rewrite: a soft-404 architecture. | `vercel.json` rewrites `/(.*)` to `/index.html`; live random nonexistent URL returned 200 with root HTML. | Search engines may crawl duplicate junk URLs and Search Console can report soft 404s. | Return a real 404 for unknown routes; rewrite only intended SPA/static routes. | Random URL returns 404; three intended pages remain 200. |
| P2 | Confirmed | Security headers | Production HTML has HSTS but lacks a meaningful CSP, X-Content-Type-Options, frame protection, Referrer-Policy and Permissions-Policy. | Live response headers + `vercel.json` only configures asset caching. | Reduced browser hardening; larger blast radius if a future injection or framing issue appears. | Add tested security headers in Vercel; keep CSP compatible with required Google/Meta/WhatsApp/font resources or preferably self-host fonts. | Header scan passes and site/tracking still work under CSP. |
| P2 | Confirmed | Privacy / performance | Google Fonts are preconnected/loaded before analytics consent and are not explicitly described as a separate third-party resource. | Static HTML preconnects `fonts.googleapis.com`/`fonts.gstatic.com`; active page CSS imports Google Fonts. | Unnecessary third-party request before consent; privacy text and actual third-party network surface are not perfectly aligned; adds render dependency. | Self-host required font files or use a system font stack; otherwise document the font provider separately. | Fresh no-consent load makes no Google Fonts request if self-hosted. |
| P2 | Confirmed | Offline conversions | Booked/completed timestamps are created when the hourly export first notices a status, not necessarily when the real booking/completion happened. | `google_ads_export.py` sets timestamp to `datetime.now()` when status is first observed. | Delayed CRM updates can send inaccurate conversion time to Google Ads and weaken attribution/learning. | Store explicit business milestone timestamps in CRM at status change and export those. | Change a status with a known historical time and verify export uses that exact time. |
| P2 | Confirmed | Accessibility | Privacy/legal modals have dialog semantics but no focus management, focus return or Escape-key handling. | No `.focus(` or `keydown` handling in current repo; central modal uses fixed overlay only. | Keyboard/screen-reader users can lose context or navigate behind modal. | Implement focus trap, initial focus, Escape close and focus restoration. | Keyboard-only modal test passes. |
| P2 | Confirmed | AI code debt | Multiple obsolete app generations and unused runtime dependencies remain. | `src/App.jsx`, `AppV2.jsx`, `AppV3.jsx` remain while `main.jsx` imports only AppV4; `@formspree/react` and `react-router-dom` searches resolve to old App/package files, not current runtime. | Increases confusion, dependency surface and chance an AI edit patches the wrong generation. | Archive/delete obsolete app versions and remove unused dependencies after tests are migrated. | Dependency graph and repo search contain only current architecture. |
| P2 | Confirmed | Performance | Large ~1 MB PNG logos remain and the live manifest points to the 1254px PNG; Google Fonts are externally imported. | Repository tree sizes and `public/manifest.json`. | Unnecessary transfer/storage and slower cold loads on some clients. | Generate appropriately sized app icons and self-host/subset fonts. | Lighthouse/network waterfall shows reduced image/font transfer. |
| P3 | Confirmed | Repo hygiene | Duplicate stale public-source files exist: root/public `robots.txt`, root/public manifest with different behavior/content. | Repository tree plus both file versions. | Future edits can target the wrong file and appear to have no effect. | Keep only the Vite `public/` source for public assets or document generated/source ownership explicitly. | One canonical source remains for each deployed asset. |
| P3 | Confirmed | Sitemap | Sitemap `lastmod` still says 2026-08-16 although visible privacy/site behavior was materially updated on 2026-08-20. | `public/sitemap.xml`. | Minor freshness-signal inconsistency. | Update meaningful `lastmod` when indexable page content materially changes; automate if practical. | Live sitemap matches actual material-content update dates. |
| P3 | Confirmed | Social metadata | Fenster landing has less complete social metadata than the other two pages (no Twitter block and fewer OG image details). | `fensterreinigung-aargau/index.html` vs the other static HTML files. | Small inconsistency in link-preview quality. | Normalize OG/Twitter metadata template across all landing pages. | Social preview validator shows consistent cards. |

## Confirmed passes

- Production build succeeds and the latest deployment is READY.
- `/`, `/umzugsreinigung-aargau`, `/fensterreinigung-aargau`, `/robots.txt` and `/sitemap.xml` respond successfully.
- The three indexable pages have distinct static titles/descriptions/canonicals and schema markup.
- `www` redirects permanently to the preferred apex domain.
- `robots.txt` allows normal crawling and points to the sitemap.
- Sitemap contains only the three preferred canonical URLs.
- Consent Mode v2 defaults are set before optional Google tags load; analytics/ad storage and ad user data start denied, while ad personalization stays denied even after measurement consent.
- Rejection clears optional first-party attribution storage and revokes Meta consent.
- CRM sync creates business leads only from canonical `whatsapp_click`/`phone_click`, preserving legacy events only as diagnostics.
- CRM manual status/financial fields are not overwritten by attribution refresh.
- Offline Google Ads export requires a click ID and a real booked/completed CRM stage.
- No `dangerouslySetInnerHTML`, direct `innerHTML`, or `eval(` use was found by repository search.
- `.env` and `.env.local` are gitignored.
- Public price CHF 55 and Betriebshaftpflicht up to CHF 2m are externally corroborated by the current public Tutti listing; other claims still need normal business-document verification.

## Manual checks still required

The available tools cannot replace a real browser Tag Assistant/DebugView session or Search Console. Manually verify: Consent Mode signals before/after both choices; one event per CTA in GA4 DebugView; Google Ads auto-tagging and the correct Ads↔GA4 property link; Search Console URL Inspection/index status; mobile Safari/Chrome interaction; Lighthouse/Core Web Vitals/contrast; the authenticity/current validity of the displayed review, guarantee wording and business documents; whether the credential-shaped fal.ai example was ever valid.

## Remediation order

1. Consolidate tracking/consent and delete legacy page-local tracking/banners. This removes duplicate events and prevents future consent regressions.
2. Persist attribution immediately on consent and fix `(data not available)` handling.
3. Add current-architecture tests + CI before further analytics changes.
4. Remove/rotate any exposed credential-shaped value and add browser security headers.
5. Fix true 404 routing, then clean old app generations/dependencies/duplicate public assets.
6. Self-host fonts, improve modal accessibility, optimize icons/images, normalize metadata and sitemap freshness.
