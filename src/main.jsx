import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { initTracking } from './tracking.js'
import { initRegularCleaningTracking } from './regularCleaningTracking.js'
import { initConsentMode } from './privacyConsent.js'
import SitePrivacyControls from './SitePrivacyControls.jsx'

const AppV4 = lazy(() => import('./AppV4.jsx'))
const UmzugsreinigungLanding = lazy(() => import('./UmzugsreinigungLanding.jsx'))
const FensterreinigungLanding = lazy(() => import('./FensterreinigungLanding.jsx'))
const WohnungsreinigungLanding = lazy(() => import('./WohnungsreinigungLanding.jsx'))

// Consent Mode v2 defaults must be established before any Google tag loads.
initConsentMode()
initTracking()
initRegularCleaningTracking()

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'
const isUmzugsreinigungLanding =
  normalizedPath === '/umzugsreinigung-aargau' || normalizedPath === '/umzugsreinigung'
const isFensterreinigungLanding = normalizedPath === '/fensterreinigung-aargau'
const isWohnungsreinigungLanding =
  normalizedPath === '/wohnungsreinigung-aargau' || normalizedPath === '/wohnungsreinigung'

let canonicalPath = '/'
if (isUmzugsreinigungLanding) canonicalPath = '/umzugsreinigung-aargau'
if (isFensterreinigungLanding) canonicalPath = '/fensterreinigung-aargau'
if (isWohnungsreinigungLanding) canonicalPath = '/wohnungsreinigung-aargau'

const canonicalHref = `https://fleissig-reinigung.ch${canonicalPath}`
let canonical = document.querySelector('link[rel="canonical"]')
if (!canonical) {
  canonical = document.createElement('link')
  canonical.rel = 'canonical'
  document.head.appendChild(canonical)
}
canonical.href = canonicalHref

const ogUrl = document.querySelector('meta[property="og:url"]')
if (ogUrl) ogUrl.setAttribute('content', canonicalHref)

let Page = AppV4
if (isUmzugsreinigungLanding) Page = UmzugsreinigungLanding
if (isFensterreinigungLanding) Page = FensterreinigungLanding
if (isWohnungsreinigungLanding) Page = WohnungsreinigungLanding

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Page />
    </Suspense>
    <SitePrivacyControls />
  </StrictMode>,
)
