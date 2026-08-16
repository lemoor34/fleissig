import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { initTracking } from './tracking.js'

const AppV4 = lazy(() => import('./AppV4.jsx'))
const UmzugsreinigungLanding = lazy(() => import('./UmzugsreinigungLanding.jsx'))
const FensterreinigungLanding = lazy(() => import('./FensterreinigungLanding.jsx'))

initTracking()

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'
const isUmzugsreinigungLanding =
  normalizedPath === '/umzugsreinigung-aargau' || normalizedPath === '/umzugsreinigung'
const isFensterreinigungLanding = normalizedPath === '/fensterreinigung-aargau'

let canonicalPath = '/'
if (isUmzugsreinigungLanding) canonicalPath = '/umzugsreinigung-aargau'
if (isFensterreinigungLanding) canonicalPath = '/fensterreinigung-aargau'

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  </StrictMode>,
)
