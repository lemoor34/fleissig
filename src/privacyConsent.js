const CONSENT_KEY = 'fleissig-consent'
const CONSENT_VERSION_KEY = 'fleissig-consent-version'
const CONSENT_VERSION = '2'
const ATTRIBUTION_KEYS = ['fleissig-attribution-v3', 'fleissig-attribution-v2']
const GA_MEASUREMENT_ID = 'G-GY6PDS53F7'
const META_PIXEL_ID = '1607333053899638'

const DENIED = {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
}

// We currently use Google for analytics and conversion measurement, not for
// personalized advertising. ad_personalization therefore stays denied even
// after the visitor accepts the optional measurement services.
const MEASUREMENT_GRANTED = {
  ad_storage: 'granted',
  analytics_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'denied',
}

function ensureGtag() {
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(){ window.dataLayer.push(arguments) }
  }
  return window.gtag
}

function clearOptionalAttributionStorage() {
  try {
    for (const key of ATTRIBUTION_KEYS) window.localStorage.removeItem(key)
  } catch {
    // Storage may be unavailable; consent signals still apply for this page.
  }
}

function invalidateLegacyConsent() {
  try {
    const rawChoice = window.localStorage.getItem(CONSENT_KEY)
    const version = window.localStorage.getItem(CONSENT_VERSION_KEY)
    if (rawChoice && version !== CONSENT_VERSION) {
      window.localStorage.removeItem(CONSENT_KEY)
      window.localStorage.removeItem(CONSENT_VERSION_KEY)
      clearOptionalAttributionStorage()
    }
  } catch {
    // No persisted choice available.
  }
}

export function getConsentChoice() {
  try {
    const version = window.localStorage.getItem(CONSENT_VERSION_KEY)
    if (version !== CONSENT_VERSION) return null
    const value = window.localStorage.getItem(CONSENT_KEY)
    return value === 'accepted' || value === 'rejected' ? value : null
  } catch {
    return null
  }
}

function updateGoogleConsent(choice) {
  const gtag = ensureGtag()
  gtag('consent', 'update', choice === 'accepted' ? MEASUREMENT_GRANTED : DENIED)
}

function loadGoogleAnalytics() {
  if (document.getElementById('ga-script')) return

  const gtag = ensureGtag()
  const script = document.createElement('script')
  script.id = 'ga-script'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  gtag('js', new Date())
  gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: true,
  })
}

function loadMetaPixel() {
  if (window.fbq) {
    window.fbq('consent', 'grant')
    return
  }

  !function(f,b,e,v,n,t,s){
    if(f.fbq)return
    n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)}
    if(!f._fbq)f._fbq=n
    n.push=n;n.loaded=true;n.version='2.0';n.queue=[]
    t=b.createElement(e);t.async=true;t.src=v
    s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
  }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js')

  window.fbq('consent', 'grant')
  window.fbq('init', META_PIXEL_ID)
  window.fbq('track', 'PageView')
}

function revokeMetaConsent() {
  if (typeof window.fbq === 'function') {
    window.fbq('consent', 'revoke')
  }
}

export function loadMeasurementServices() {
  if (getConsentChoice() !== 'accepted') return
  loadGoogleAnalytics()
  loadMetaPixel()
}

export function setConsentChoice(choice) {
  const normalized = choice === 'accepted' ? 'accepted' : 'rejected'
  try {
    window.localStorage.setItem(CONSENT_KEY, normalized)
    window.localStorage.setItem(CONSENT_VERSION_KEY, CONSENT_VERSION)
  } catch {
    // Consent still applies for the current page even when storage is blocked.
  }

  updateGoogleConsent(normalized)

  if (normalized === 'accepted') {
    loadMeasurementServices()
  } else {
    revokeMetaConsent()
    clearOptionalAttributionStorage()
  }

  window.dispatchEvent(new CustomEvent('fleissig-consent-changed', {
    detail: { choice: normalized },
  }))

  return normalized
}

export function initConsentMode() {
  invalidateLegacyConsent()
  const gtag = ensureGtag()

  // Consent Mode v2 default must be set before any Google tag is loaded.
  // We use Basic Consent Mode: optional measurement tags are not loaded until
  // the visitor actively accepts analytics/advertising measurement services.
  gtag('consent', 'default', {
    ...DENIED,
    wait_for_update: 500,
  })

  const choice = getConsentChoice()
  if (choice === 'accepted') {
    updateGoogleConsent('accepted')
    loadMeasurementServices()
  } else if (choice === 'rejected') {
    updateGoogleConsent('rejected')
  }

  window.fleissigConsent = {
    get: getConsentChoice,
    set: setConsentChoice,
    loadMeasurementServices,
  }

  return choice
}
