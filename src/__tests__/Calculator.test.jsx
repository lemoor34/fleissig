import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App.jsx'
import { PRICES, formatPrice } from '../App.jsx'

vi.mock('@formspree/react', () => ({
  useForm: () => [{ succeeded: false, errors: [], submitting: false }, vi.fn()],
}))

const fmt = (n) => `CHF ${formatPrice(n)}`

const navigateToPreise = () => {
  render(<App />)
  const link = screen.getAllByRole('link').find(l => l.textContent === 'Preise')
  fireEvent.click(link)
}

describe('PreisePage calculator', () => {
  it('renders the Preise page', () => {
    navigateToPreise()
    expect(screen.getAllByText(/Preise & Pakete/i).length).toBeGreaterThan(0)
  })

  it('shows Unterhaltsreinigung tab by default', () => {
    navigateToPreise()
    expect(screen.getAllByText('Unterhaltsreinigung').length).toBeGreaterThan(0)
  })

  it('shows Komfort abo price by default', () => {
    navigateToPreise()
    expect(screen.getAllByText(fmt(PRICES.unterhalt.komfort)).length).toBeGreaterThan(0)
  })

  it('switches to Gartenpflege tab', () => {
    navigateToPreise()
    fireEvent.click(screen.getByRole('button', { name: /Gartenpflege/i }))
    expect(screen.getAllByText(fmt(PRICES.garten.fruehling)).length).toBeGreaterThan(0)
  })

  it('renders the WhatsApp CTA link pointing to wa.me', () => {
    navigateToPreise()
    const links = screen.getAllByRole('link')
    const waLink = links.find(l => l.getAttribute('href')?.includes('wa.me'))
    expect(waLink).toBeTruthy()
  })

  it('CTA link opens in a new tab', () => {
    navigateToPreise()
    const links = screen.getAllByRole('link')
    const waLink = links.find(l => l.getAttribute('href')?.includes('wa.me'))
    expect(waLink.getAttribute('target')).toBe('_blank')
  })
})
