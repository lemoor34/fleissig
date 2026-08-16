import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppV4 from './AppV4.jsx'
import UmzugsreinigungLanding from './UmzugsreinigungLanding.jsx'
import FensterreinigungLanding from './FensterreinigungLanding.jsx'

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

let page = <AppV4 />
if (isUmzugsreinigungLanding) page = <UmzugsreinigungLanding />
if (isFensterreinigungLanding) page = <FensterreinigungLanding />

createRoot(document.getElementById('root')).render(
  <StrictMode>{page}</StrictMode>,
)
