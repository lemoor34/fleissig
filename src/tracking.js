const CONSENT_KEY = 'fleissig-consent'
const ATTRIBUTION_KEY = 'fleissig-attribution-v3'
const LEGACY_ATTRIBUTION_KEY = 'fleissig-attribution-v2'
const HISTORY_KEY = '__fleissig_attribution_v3'
const MAX_TOUCHES = 12

const ATTRIBUTION_PARAMS = [
  'gclid',
  'gbraid',
  'wbraid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
]

function hasAnalyticsConsent() {
  try {
    return window.localStorage.getItem(CONSENT_KEY) === 'accepted'
  } catch {
    return false
  }
}

function readIncomingAttribution(search = window.location.search) {
  const params = new URLSearchParams(search)
  const incoming = {}

  for (const key of ATTRIBUTION_PARAMS) {
    const value = params.get(key)
    if (value) incoming[key] = value.slice(0, 500)
  }

  return incoming
}

function hasPaidClickId(touch = {}) {
  return Boolean(touch.gclid || touch.gbraid || touch.wbraid)
}

function inferSource(incoming, referrer = document.referrer) {
  if (hasPaidClickId(incoming)) return { source: 'google', medium: 'cpc' }

  if (incoming?.utm_source) {
    return {
      source: incoming.utm_source,
      medium: incoming.utm_medium || 'campaign',
    }
  }

  if (!referrer) return { source: 'direct', medium: '(none)' }

  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '')
    const ownHost = window.location.hostname.replace(/^www\./, '')
    if (host === ownHost) return { source: 'internal', medium: 'navigation' }
    if (host.includes('google.')) return { source: 'google', medium: 'organic' }
    if (host.includes('bing.') || host.includes('duckduckgo.')) {
      return { source: host, medium: 'organic' }
    }
    if (
      host.includes('facebook.') ||
      host.includes('instagram.') ||
      host === 'l.facebook.com' ||
      host === 'lm.facebook.com'
    ) {
      return { source: host, medium: 'social' }
    }
    return { source: host, medium: 'referral' }
  } catch {
    return { source: 'unknown', medium: 'referral' }
  }
}

function buildTouch({ incoming, referrer, landingPage }) {
  const inferred = inferSource(incoming, referrer)
  return {
    ...incoming,
    source: incoming.utm_source || inferred.source,
    medium: incoming.utm_medium || inferred.medium,
    landing_page: landingPage.slice(0, 1000),
    referrer: (referrer || '').slice(0, 1000),
    captured_at: new Date().toISOString(),
  }
}

function createCurrentTouch() {
  return buildTouch({
    incoming: readIncomingAttribution(),
    referrer: document.referrer,
    landingPage: `${window.location.pathname}${window.location.search}`,
  })
}

function readHistoryTouch() {
  try {
    const state = window.history.state
    if (!state || typeof state !== 'object') return null
    return state[HISTORY_KEY] || null
  } catch {
    return null
  }
}

function persistHistoryTouch(touch) {
  try {
    const state = window.history.state && typeof window.history.state === 'object'
      ? window.history.state
      : {}
    window.history.replaceState({ ...state, [HISTORY_KEY]: touch }, document.title)
  } catch {
    // Same-page history is only a pre-consent safety net.
  }
}

function captureInitialTouch() {
  const existing = readHistoryTouch()
  if (existing) return existing

  const touch = createCurrentTouch()
  persistHistoryTouch(touch)
  return touch
}

// Captured before consent only in history.state. Cross-visit persistence starts
// after analytics consent, so the attribution chain stays consent-aware.
const INITIAL_TOUCH = captureInitialTouch()

function readJsonStorage(key) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function readStoredAttribution() {
  const current = readJsonStorage(ATTRIBUTION_KEY)
  if (current) return current

  const legacy = readJsonStorage(LEGACY_ATTRIBUTION_KEY)
  if (!legacy) return null

  const first = legacy.first_touch || null
  const last = legacy.last_touch || first
  return {
    version: 3,
    journey_id: '',
    first_touch: first,
    last_touch: last,
    last_non_direct: last && !['direct', 'internal', 'unknown'].includes(last.source)
      ? last
      : (first && !['direct', 'internal', 'unknown'].includes(first.source) ? first : null),
    touch_path: [first, last].filter(Boolean).filter((touch, index, arr) => {
      if (index === 0) return true
      return `${touch.source}|${touch.medium}|${touch.landing_page}` !==
        `${arr[0].source}|${arr[0].medium}|${arr[0].landing_page}`
    }),
  }
}

function createJourneyId(existing = '') {
  if (existing) return existing
  try {
    return window.crypto?.randomUUID?.() || `fr-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
  } catch {
    return `fr-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
  }
}

function isNonDirectTouch(touch) {
  const source = touch?.source
  return Boolean(source && !['direct', 'internal', 'unknown'].includes(source))
}

function isMeaningfulTouch(touch, existing) {
  if (!touch || touch.source === 'internal') return false
  if (isNonDirectTouch(touch)) return true
  return !existing?.first_touch
}

function touchKey(touch = {}) {
  return [
    touch.source || '',
    touch.medium || '',
    touch.utm_campaign || '',
    touch.landing_page || '',
  ].join('|')
}

function appendTouch(path = [], touch) {
  if (!touch) return path
  const next = [...path]
  const last = next[next.length - 1]
  if (!last || touchKey(last) !== touchKey(touch)) next.push(touch)
  return next.slice(-MAX_TOUCHES)
}

function persistAttributionIfAllowed() {
  if (!hasAnalyticsConsent()) return readStoredAttribution()

  const existing = readStoredAttribution() || {}
  const currentTouch = INITIAL_TOUCH || createCurrentTouch()
  const shouldRecord = isMeaningfulTouch(currentTouch, existing)

  let firstTouch = existing.first_touch || currentTouch
  let lastTouch = existing.last_touch || currentTouch
  let lastNonDirect = existing.last_non_direct || null
  let touchPath = Array.isArray(existing.touch_path) ? existing.touch_path : []

  if (shouldRecord) {
    if (!existing.first_touch) firstTouch = currentTouch
    lastTouch = currentTouch
    if (isNonDirectTouch(currentTouch)) lastNonDirect = currentTouch
    touchPath = appendTouch(touchPath, currentTouch)
  } else if (!touchPath.length && firstTouch) {
    touchPath = [firstTouch]
  }

  const next = {
    version: 3,
    journey_id: createJourneyId(existing.journey_id),
    first_touch: firstTouch,
    last_touch: lastTouch,
    last_non_direct: lastNonDirect,
    touch_path: touchPath,
    updated_at: new Date().toISOString(),
  }

  try {
    window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(next))
  } catch {
    // GA4 still works if browser storage is unavailable; coverage is lower.
  }

  return next
}

function latestClickIds(stored) {
  const touches = [
    ...(Array.isArray(stored?.touch_path) ? stored.touch_path : []),
    stored?.last_touch,
    stored?.first_touch,
  ].filter(Boolean).reverse()

  for (const touch of touches) {
    if (hasPaidClickId(touch)) {
      return {
        gclid: touch.gclid || '',
        gbraid: touch.gbraid || '',
        wbraid: touch.wbraid || '',
      }
    }
  }

  return { gclid: '', gbraid: '', wbraid: '' }
}

function compactPath(stored) {
  const path = Array.isArray(stored?.touch_path) ? stored.touch_path : []
  return path
    .map((touch) => `${touch.source || '?'}:${touch.medium || '?'}`)
    .join('>')
    .slice(0, 500)
}

function buildAttributionPageLocation(stored, extra = {}) {
  let url
  try {
    url = new URL(window.location.href)
  } catch {
    return window.location.href.slice(0, 1000)
  }

  const first = stored?.first_touch || INITIAL_TOUCH || {}
  const last = stored?.last_touch || first
  const decisive = stored?.last_non_direct || last || first
  const clickIds = latestClickIds(stored)

  const meta = {
    fr_jid: stored?.journey_id,
    fr_src: decisive?.source,
    fr_med: decisive?.medium,
    fr_first_src: first?.source,
    fr_first_med: first?.medium,
    fr_last_src: last?.source,
    fr_last_med: last?.medium,
    fr_first_lp: first?.landing_page,
    fr_last_lp: last?.landing_page,
    fr_path: compactPath(stored),
    fr_basis: 'first_party',
    fr_service: extra.service,
    gclid: clickIds.gclid,
    gbraid: clickIds.gbraid,
    wbraid: clickIds.wbraid,
    utm_campaign: decisive?.utm_campaign,
    utm_term: decisive?.utm_term,
  }

  for (const [key, value] of Object.entries(meta)) {
    if (value) url.searchParams.set(key, String(value).slice(0, 500))
  }

  return url.toString().slice(0, 1800)
}

function eventAttributionParams(extra = {}) {
  const stored = persistAttributionIfAllowed()
  const first = stored?.first_touch || INITIAL_TOUCH || {}
  const last = stored?.last_touch || first
  const decisive = stored?.last_non_direct || last || first
  const clickIds = latestClickIds(stored)

  return {
    traffic_source: decisive?.source,
    traffic_medium: decisive?.medium,
    first_touch_source: first?.source,
    first_touch_medium: first?.medium,
    last_touch_source: last?.source,
    last_touch_medium: last?.medium,
    attribution_basis: 'first_party',
    journey_id: stored?.journey_id,
    touch_path: compactPath(stored),

    campaign_source: decisive?.source,
    campaign_medium: decisive?.medium,
    campaign_name: decisive?.utm_campaign,
    campaign_term: decisive?.utm_term,
    campaign_content: decisive?.utm_content,
    campaign_id: decisive?.utm_id,

    gclid: clickIds.gclid,
    gbraid: clickIds.gbraid,
    wbraid: clickIds.wbraid,
    landing_page: first?.landing_page,
    current_page: window.location.pathname,

    // Built-in GA4 dimensions are a recovery channel for CRM sync. This avoids
    // depending on custom-dimension registration for critical attribution data.
    page_location: buildAttributionPageLocation(stored, extra),
    page_referrer: (decisive?.referrer || first?.referrer || document.referrer || '').slice(0, 1000),
  }
}

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )
}

export function trackEvent(name, params = {}) {
  if (!hasAnalyticsConsent()) return false
  if (typeof window.gtag !== 'function') return false

  window.gtag('event', name, compactParams({
    ...eventAttributionParams(params),
    ...params,
  }))
  return true
}

function serviceFromPath() {
  const path = window.location.pathname
  if (path.includes('umzugsreinigung')) return 'umzugsreinigung'
  if (path.includes('fensterreinigung')) return 'fensterreinigung'
  return 'allgemeine_reinigung'
}

function installContactTracking() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a')
    if (!link) return

    const href = link.getAttribute('href') || ''
    const label = (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120)
    const common = {
      service: serviceFromPath(),
      link_label: label,
      contact_page: window.location.pathname,
    }

    if (href.startsWith('tel:')) {
      trackEvent('phone_click', common)
      return
    }

    if (href.includes('wa.me/') || href.includes('api.whatsapp.com/')) {
      trackEvent('whatsapp_click', common)
    }
  }, { capture: true })
}

function installCalculatorTracking() {
  if (!window.location.pathname.includes('umzugsreinigung')) return

  let sent = false
  const check = () => {
    if (sent) return
    const result = document.querySelector('.lp-result.ready')
    if (!result) return

    sent = trackEvent('calculator_complete', {
      service: 'umzugsreinigung',
    })
  }

  const observer = new MutationObserver(check)
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class'],
  })

  document.addEventListener('click', () => {
    window.setTimeout(check, 0)
  }, { capture: true })

  check()
}

export function initTracking() {
  persistAttributionIfAllowed()
  installContactTracking()
  installCalculatorTracking()

  window.fleissigTracking = {
    getAttribution: readStoredAttribution,
    captureAttribution: persistAttributionIfAllowed,
    trackEvent,
  }
}
