import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppV4 from './AppV4.jsx'
import UmzugsreinigungLanding from './UmzugsreinigungLanding.jsx'

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'
const isUmzugsreinigungLanding = normalizedPath === '/umzugsreinigung-aargau' || normalizedPath === '/umzugsreinigung'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isUmzugsreinigungLanding ? <UmzugsreinigungLanding /> : <AppV4 />}
  </StrictMode>,
)
