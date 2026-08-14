import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppV4 from './AppV4.jsx'
import UmzugsreinigungLanding from './UmzugsreinigungLanding.jsx'

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'
const isUmzugsreinigungLanding = normalizedPath === '/umzugsreinigung-aargau' || normalizedPath === '/umzugsreinigung'

const canonicalPath = isUmzugsreinigungLanding ? '/umzugsreinigung-aargau' : '/'
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isUmzugsreinigungLanding ? <UmzugsreinigungLanding /> : <AppV4 />}
  </StrictMode>,
)
