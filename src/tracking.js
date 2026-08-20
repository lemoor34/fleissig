const CONSENT_KEY = 'fleissig-consent'
const ATTRIBUTION_KEY = 'fleissig-attribution-v2'
const HISTORY_KEY = '__fleissig_attribution_v2'

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

function hasPaidClickId(incoming) {
  return Boolean(incoming?.gclid || incoming?.gbraid || incoming?.wbraid)
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
    if (host.includes('google.')) return { source: 'google', medium: 'organic' }
    if (host.includes('bing.') || host.includes('duckduckgo.')) {
      return { source: host, medium: 'organic' }
    }
    if (host === window.location.hostname.replace(/^www\./, '')) {
      return { source: 'internal', medium: 'navigation' }
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
    // Losing the pre-consent snapshot is non-fatal; GA4 can still use the URL.
  }
}

function captureInitialTouch() {
  const existing = readHistoryTouch()
  if (existing) return existing

  const touch = createCurrentTouch()
  persistHistoryTouch(touch)
  return touch
}

// Captured before the cookie banner can reload the page. history.state survives
// same-page reloads, so the original Google/referrer context is not lost while
// analytics itself still remains disabled until consent is accepted.
const INITIAL_TOUCH = captureInitialTouch()

function readStoredAttribution() {
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persistAttributionIfAllowed() {
  if (!hasAnalyticsConsent()) return readStoredAttribution()

  const existing = readStoredAttribution() || {}
  const currentIncoming = readIncomingAttribution()
  const hasCurrentCampaign = Object.keys(currentIncoming).length > 0
  const currentTouch = hasCurrentCampaign ? createCurrentTouch() : INITIAL_TOUCH

  const next = {
    first_touch: existing.first_touch || INITIAL_TOUCH || currentTouch,
    last_touch: hasCurrentCampaign
      ? currentTouch
      : (existing.last_touch || INITIAL_TOUCH || currentTouch),
  }

  try {
    window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(next))
  } catch {
    // Analytics still works even if browser storage is unavailable.
  }

  return next
}

function eventAttributionParams() {
  const stored = persistAttributionIfAllowed()
  const incoming = readIncomingAttribution()
  const touch = stored?.last_touch || stored?.first_touch || INITIAL_TOUCH || {}
  const source = incoming.utm_source || touch.source
  const medium = incoming.utm_medium || touch.medium

  return {
    // Human attribution helpers used by our CRM sync.
    traffic_source: source,
    traffic_medium: medium,

    // Standard campaign parameter names improve GA4's own attribution too.
    campaign_source: source,
    campaign_medium: medium,
    campaign_name: incoming.utm_campaign || touch.utm_campaign,
    campaign_term: incoming.utm_term || touch.utm_term,
    campaign_content: incoming.utm_content || touch.utm_content,
    campaign_id: incoming.utm_id || touch.utm_id,

    gclid: incoming.gclid || touch.gclid,
    gbraid: incoming.gbraid || touch.gbraid,
    wbraid: incoming.wbraid || touch.wbraid,
    landing_page: stored?.first_touch?.landing_page || touch.landing_page,
    current_page: window.location.pathname,

    // Explicit built-in page fields give the GA4 Data API a second recovery
    // path when session source/medium are unavailable after consent handling.
    page_location: window.location.href.slice(0, 1000),
    page_referrer: (touch.referrer || document.referrer || '').slice(0, 1000),
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
    ...eventAttributionParams(),
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

    if (href.startsWith('tel:')) {
      trackEvent('phone_click', {
        service: serviceFromPath(),
        link_label: label,
      })
      return
    }

    if (href.includes('wa.me/') || href.includes('api.whatsapp.com/')) {
      trackEvent('whatsapp_click', {
        service: serviceFromPath(),
        link_label: label,
      })
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

  // If consent is accepted after the calculator is already complete, retry on
  // the next click. The event is sent only once after gtag is available.
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
