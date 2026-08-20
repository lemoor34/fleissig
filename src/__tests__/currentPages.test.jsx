import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import AppV4 from '../AppV4.jsx'
import UmzugsreinigungLanding from '../UmzugsreinigungLanding.jsx'
import FensterreinigungLanding from '../FensterreinigungLanding.jsx'

beforeEach(() => {
  window.localStorage.clear()
  window.history.replaceState({}, '', '/')
})

describe('current production pages', () => {
  it('renders the current homepage with service navigation and contact actions', () => {
    render(<AppV4 />)

    expect(screen.getByRole('heading', { level: 1, name: 'Reinigungsfirma im Kanton Aargau' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Umzugsreinigung/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Fensterreinigung/i }).length).toBeGreaterThan(0)
    expect(document.querySelector('a[href^="https://wa.me/"]')).toBeTruthy()
    expect(document.querySelector('a[href^="tel:"]')).toBeTruthy()
  })

  it('renders the current moving-cleaning landing and calculator inputs', () => {
    window.history.replaceState({}, '', '/umzugsreinigung-aargau')
    render(<UmzugsreinigungLanding />)

    expect(screen.getByRole('heading', { level: 1, name: /Umzugsreinigung Aargau/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Wohnfläche in Quadratmetern')).toBeInTheDocument()
    expect(screen.getByText(/vorläufige Preisschätzung/i)).toBeInTheDocument()
  })

  it('renders the current window-cleaning landing with WhatsApp CTA', () => {
    window.history.replaceState({}, '', '/fensterreinigung-aargau')
    render(<FensterreinigungLanding />)

    expect(screen.getByRole('heading', { level: 1, name: 'Fensterreinigung Aargau' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /WhatsApp/i }).length).toBeGreaterThan(0)
  })
})
