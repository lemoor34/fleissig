const CONSENT_KEY = 'fleissig-consent'
const ATTRIBUTION_KEY = 'fleissig-attribution-v1'

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

function readIncomingAttribution() {
  const params = new URLSearchParams(window.location.search)
  const incoming = {}

  for (const key of ATTRIBUTION_PARAMS) {
    const value = params.get(key)
    if (value) incoming[key] = value.slice(0, 250)
  }

  return incoming
}

function inferSource() {
  const referrer = document.referrer
  if (!referrer) return { source: 'direct', medium: '(none)' }

  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '')
    if (host.includes('google.')) return { source: 'google', medium: 'organic' }
    if (host.includes('bing.')) return { source: 'bing', medium: 'organic' }
    if (host === window.location.hostname.replace(/^www\./, '')) {
      return { source: 'internal', medium: 'navigation' }
    }
    return { source: host, medium: 'referral' }
  } catch {
    return { source: 'unknown', medium: 'referral' }
  }
}

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

  const incoming = readIncomingAttribution()
  const hasIncoming = Object.keys(incoming).length > 0
  const existing = readStoredAttribution() || {}
  const inferred = inferSource()
  const now = new Date().toISOString()

  const touch = {
    ...incoming,
    source: incoming.utm_source || inferred.source,
    medium: incoming.utm_medium || inferred.medium,
    landing_page: `${window.location.pathname}${window.location.search}`.slice(0, 500),
    captured_at: now,
  }

  const next = {
    first_touch: existing.first_touch || touch,
    last_touch: hasIncoming ? touch : (existing.last_touch || touch),
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
  const touch = stored?.last_touch || stored?.first_touch || {}

  return {
    traffic_source: incoming.utm_source || touch.source,
    traffic_medium: incoming.utm_medium || touch.medium,
    campaign_name: incoming.utm_campaign || touch.utm_campaign,
    campaign_term: incoming.utm_term || touch.utm_term,
    campaign_content: incoming.utm_content || touch.utm_content,
    campaign_id: incoming.utm_id || touch.utm_id,
    gclid: incoming.gclid || touch.gclid,
    gbraid: incoming.gbraid || touch.gbraid,
    wbraid: incoming.wbraid || touch.wbraid,
    landing_page: stored?.first_touch?.landing_page || touch.landing_page,
    current_page: window.location.pathname,
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
      const service = serviceFromPath()
      trackEvent('whatsapp_click', {
        service,
        link_label: label,
      })

      // Umzugsreinigung already emits its own detailed event with estimate values.
      if (service === 'fensterreinigung') {
        trackEvent('fenster_whatsapp_click', { service })
      }
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

  // If consent is accepted after the calculator is already complete,
  // retry immediately after the consent click handler has run.
  document.addEventListener('click', () => {
    window.setTimeout(check, 0)
  }, { capture: true })

  check()
}

export function initTracking() {
  persistAttributionIfAllowed()
  installContactTracking()
  installCalculatorTracking()

  // Helpful for manual QA in the browser console without exposing anything to customers.
  window.fleissigTracking = {
    getAttribution: readStoredAttribution,
    trackEvent,
  }
}
