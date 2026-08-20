import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import AppV4 from '../AppV4.jsx'
import UmzugsreinigungLanding from '../UmzugsreinigungLanding.jsx'
import FensterreinigungLanding from '../FensterreinigungLanding.jsx'
import WohnungsreinigungLanding from '../WohnungsreinigungLanding.jsx'

beforeEach(() => {
  window.localStorage.clear()
  window.history.replaceState({}, '', '/')
})

describe('current production pages', () => {
  it('renders the current homepage with service navigation and contact actions', () => {
    render(<AppV4 />)

    expect(screen.getByRole('heading', { level: 1, name: 'Reinigungsfirma im Kanton Aargau' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Wohnungsreinigung/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Umzugsreinigung/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Fensterreinigung/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Google/i }).some((link) => link.href.includes('maps.app.goo.gl'))).toBe(true)
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

  it('renders the Wohnungsreinigung landing with all frequency choices and Neukundenpreis', () => {
    window.history.replaceState({}, '', '/wohnungsreinigung-aargau')
    render(<WohnungsreinigungLanding />)

    expect(screen.getByRole('heading', { level: 1, name: 'Wohnungsreinigung im Aargau' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Einmalig' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Wöchentlich' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Alle 2 Wochen' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Monatlich' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Individuell' })).toBeInTheDocument()
    expect(screen.getAllByText(/CHF 50/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/CHF 55/).length).toBeGreaterThan(0)
  })
})
