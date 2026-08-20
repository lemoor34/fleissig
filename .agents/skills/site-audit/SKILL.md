---
name: site-audit
description: Use for a full production audit of a website, especially a marketing/local-business site with GA4, Google Ads, consent, CRM attribution, SEO, performance, accessibility, security, or AI-generated code. Apply when the user asks to check whether the site is correctly built, whether analytics can be trusted, whether SEO/indexing is healthy, or whether AI-written code contains duplicated, stale, plausible-but-wrong, insecure, or unmaintainable logic.
metadata:
  version: 1.0.0
---

# Site Audit

Audit the production system, not just the visible page. The goal is to answer: **Can users use it, can Google understand it, can measurement be trusted, and can the code be safely maintained?**

For marketing attribution, pair this skill with `../attribution/SKILL.md`. CRM/backend is the source of truth for real leads, orders and revenue; GA4/ad platforms explain acquisition but do not redefine the number of real conversions.

## Operating rules

1. **Evidence first.** Do not label an item broken because it is merely suspicious. Every finding must name the evidence: production response, source code, analytics data, configuration, test output, or authoritative platform documentation.
2. **Separate confirmed defect from risk.** Use `Confirmed`, `Likely`, `Needs manual verification`, or `Pass`.
3. **Do not beautify unknown data.** `(not set)`, unavailable source, missing click IDs, and unverified claims stay unknown until evidence resolves them.
4. **Test production behavior as well as repository code.** A correct-looking source file does not prove the deployed site behaves correctly.
5. **Do not fix during the audit unless explicitly asked.** First produce the issue register so remediation is deliberate and regression-safe.
6. **Prioritize business impact over code aesthetics.** A duplicate analytics event is more urgent than an untidy component; a broken CTA is more urgent than a naming inconsistency.
7. **AI-generated code receives an adversarial pass.** Treat code that 'looks right' as unproven until behavior, dependencies, assumptions and edge cases are checked.

## Severity

- **P0 — Critical:** losing leads/orders, materially false analytics, privacy/security exposure, production outage, or indexability failure on a key landing page.
- **P1 — High:** meaningful revenue/SEO/measurement degradation, duplicate conversions, broken consent behavior, major mobile/accessibility problem, or strong maintainability trap likely to cause regressions.
- **P2 — Medium:** quality/performance/SEO weakness with limited immediate business impact.
- **P3 — Low:** cleanup, consistency, minor hardening, or documentation.

## Required audit passes

### Pass 1 — Product, code and AI-generated-code audit

Check the repository architecture before judging individual lines.

- Build/test/static-analysis status and warnings.
- Duplicate implementations of the same concern: analytics loaders, cookie banners, tracking helpers, config/constants, price logic, legal text, routing, API clients.
- Old implementation hidden instead of removed; dead code; unreachable branches; stale files.
- Same action emitted from both global listeners and component `onClick` handlers.
- Multiple `gtag('config')`, GA loaders, pixels, consent initializers or competing state machines.
- Hard-coded business facts repeated across files: phone, email, UID, company name, prices, insurance claims, service guarantees.
- Magic fallbacks that convert unknown data into a confident label.
- Hallucinated/nonexistent/deprecated APIs or dependencies; unnecessary dependencies; suspicious package names; license/maintenance concerns.
- Tests deleted/skipped/relaxed instead of root cause fixed.
- Overbroad exception swallowing, silent `catch`, fail-open security/privacy behavior.
- Client-side secrets, credentials, service-account material, private endpoints or keys.
- Unsafe HTML/DOM insertion, URL handling, open redirects, unvalidated user-controlled query values.
- Edge cases: no storage, rejected consent, slow tag load, duplicate clicks, back/forward navigation, Safari/private mode, missing query params, long URLs, returning visitors.

AI-specific review principle: verify **intent, constraints, dependencies, edge cases and actual behavior**, not plausibility of generated code. This follows GitHub's guidance for reviewing AI-generated code.

### Pass 2 — Analytics, consent and attribution audit

Use GA4/Ads/CRM data plus implementation code.

**Consent / privacy**
- Consent Mode defaults are established before Google tags load.
- `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization` have intentional defaults and updates.
- Rejected consent does not load optional GA/Meta tags in a Basic Consent Mode implementation.
- Accepted consent loads exactly once and does not destroy the original landing/referrer/click context.
- Consent can be changed later and the UI reflects the stored state.
- First-party attribution storage starts only according to the site's stated privacy model.
- No PII/free-text is sent into GA4 URLs/event parameters.

**GA4 event integrity**
- One page view per intended page load/navigation.
- One canonical CRM-lead event per real CTA action.
- WhatsApp, phone and calculator have clear event definitions and no generic+specific duplicates.
- Event names and service parameters are consistent across pages.
- DebugView/Realtime can confirm the expected event payload.
- Timezone/currency/property IDs are correct and consistent.

**Acquisition integrity**
- Auto-tagging/click identifiers survive redirects and navigation.
- GCLID/GBRAID/WBRAID and UTM parameters are not stripped or rewritten incorrectly.
- Google Ads ↔ GA4 link is the intended account/property.
- Source/medium/campaign/keyword/landing page are preserved when available.
- Unknown source is not coerced to Direct.
- Direct is treated as weak attribution evidence, not proof of acquisition source.
- First touch, last touch and last non-direct are retained if implemented.

**CRM / offline measurement**
- CRM is source of truth for lead/order/revenue count.
- Analytics refresh cannot overwrite manually maintained status, price, customer fields or manual attribution.
- Test traffic is excluded from business metrics without deleting raw diagnostics.
- Offline conversion export contains only valid real stages with required click identifier and correct timestamp/value/currency.
- Ad-platform conversion claims are never summed as separate real orders.

### Pass 3 — SEO, indexing and local-business audit

Check live HTTP behavior and rendered metadata.

- HTTP/HTTPS and www/non-www canonicalization.
- Key routes return expected status codes; legacy aliases permanently redirect.
- `robots.txt` exists, is syntactically sensible, and does not block important pages/resources.
- `sitemap.xml` exists and contains only preferred canonical indexable URLs with absolute URLs.
- Each indexable page has one coherent canonical; canonical, redirect and sitemap signals do not conflict.
- For JavaScript sites, rendered title, description, canonical and content are available to Google; avoid conflicting original-vs-JS canonical signals.
- Unique useful `<title>`, meta description and one meaningful H1 per landing page.
- Logical H2/H3 structure; crawlable `<a href>` internal links between important pages.
- No accidental `noindex`, `nofollow`, `X-Robots-Tag`, staging/demo URL or Vercel preview indexation.
- Open Graph/social sharing metadata and favicon are correct.
- Local-business facts are consistent: brand, legal entity, phone, email, locality/service area, UID where displayed.
- Structured data is valid, visible-content-aligned and not fabricated.
- Content is useful and specific, not repetitive keyword stuffing or generic AI filler.
- Business claims such as insurance amount, prices, guarantees, reviews and service areas are factual and current.

Use Google Search Central guidance for crawling/indexing, sitemap, canonicalization and JavaScript SEO.

### Pass 4 — Performance, mobile UX and accessibility audit

Run/inspect Lighthouse or equivalent where available, but also manually inspect critical UI behavior.

- Core Web Vitals targets as current Google guidance: LCP, INP, CLS.
- Large images, image dimensions, modern formats, lazy loading and above-the-fold prioritization.
- Render-blocking CSS/JS, duplicate third-party tags, unused bundle code and fonts.
- Mobile viewport and no horizontal overflow.
- CTA visibility/tap targets on iPhone/Android sizes.
- No layout jump from consent banner, fonts or images.
- Keyboard navigation, visible focus, semantic buttons/links.
- Form labels, accessible names, errors/instructions, modal focus/close behavior.
- Meaningful alt text; decorative images handled appropriately.
- Contrast and text sizing.
- Browser compatibility, especially Safari/iOS for storage, dialogs, sticky UI and external-app links.

Do not treat a good Lighthouse score as proof of good UX.

### Pass 5 — Security, privacy hardening and deployment audit

- HTTPS and no mixed content.
- Security headers: CSP, HSTS where appropriate, `X-Content-Type-Options`, frame protection (`frame-ancestors`/equivalent), Referrer-Policy, Permissions-Policy where useful.
- CSP must be meaningful, not merely present; flag `unsafe-eval`, overly broad `*`, unnecessary `unsafe-inline`, or permissive third-party origins.
- No exposed secrets in repository or client bundle.
- Dependency/security alerts where available (CodeQL/Dependabot or equivalent).
- External links use appropriate `rel` where needed.
- User-controlled values are encoded/validated before DOM/URL use.
- Hosting redirects/rewrites preserve query strings required for attribution.
- Production deployment is the intended commit and is healthy.
- Preview/staging environments are not accidentally public/indexable if they contain sensitive or duplicate production content.
- Privacy policy matches actual implementation: providers, purposes, consent behavior, retention, cross-border processing, offline conversion use.

Use OWASP WSTG as the baseline for web-security verification.

## Audit workflow

1. **Inventory** routes, analytics IDs, integrations, deployment, sitemap/robots, major source files and CRM/analytics outputs.
2. **Run automated checks** available in the environment: build/tests/static analysis, live HTTP fetches, Lighthouse/PageSpeed, dependency/security checks, schema validators.
3. **Trace critical journeys** end-to-end:
   - direct visitor → page → CTA;
   - Google Ads-like click with test parameters → consent → CTA;
   - reject consent → CTA;
   - returning visitor → CTA;
   - service page navigation → CTA;
   - CRM status change → sync → offline conversion export.
4. **Cross-check raw vs derived data.** Compare GA4 raw reports, attribution layer, CRM and ad export. Investigate every transformation that changes meaning.
5. **Perform AI-red-team review** for duplication, stale generations, conflicting helpers, invented assumptions and hidden fallback logic.
6. **Produce issue register** before remediation.

## Required output format

Start with a concise verdict and counts by severity. Then provide one issue register with columns:

| Priority | Status | Area | Finding | Evidence | Business impact | Recommended fix | Verification after fix |

After the register include:

- **Confirmed passes** — important controls that were tested and passed.
- **Manual checks still required** — only things the available tools cannot verify (for example Tag Assistant browser session or Search Console URL Inspection if not connected).
- **Remediation order** — P0 first, then P1, grouped so one architectural fix can remove several symptoms.

Do not bury critical issues in prose. Do not report speculative defects as confirmed.

## Authoritative references

Use current official sources when validating standards:

- Google Analytics Help: Consent Mode verification and GA4 DebugView.
- Google Search Central: crawling/indexing, sitemap, canonicalization, JavaScript SEO.
- web.dev / Lighthouse: performance, Core Web Vitals, browser baseline.
- OWASP Web Security Testing Guide: security headers/CSP and web security testing.
- GitHub Docs: review of AI-generated code — functional checks, intent/context, dependency scrutiny, hallucinated APIs, skipped tests and edge cases.
