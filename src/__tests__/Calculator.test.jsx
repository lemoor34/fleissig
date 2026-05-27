import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Calculator, PRICES, formatPrice } from '../App.jsx'

const fmt = (n) => `CHF ${formatPrice(n)}`
// Price appears in both the variant button and the summary total,
// so we assert at least one element shows the expected price.
const expectPrice = (n) =>
  expect(screen.getAllByText(fmt(n)).length).toBeGreaterThan(0)

describe('Calculator', () => {
  it('renders the calculator heading', () => {
    render(<Calculator />)
    expect(screen.getByText(/Preis berechnen/i)).toBeInTheDocument()
  })

  it('shows initial price for 3.5-Zi komplett', () => {
    render(<Calculator />)
    const expected = PRICES.endreinigung['3.5'].komplett
    expectPrice(expected)
  })

  it('updates price when a different room size is selected', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByRole('button', { name: /2\.5-Zi/i }))
    const expected = PRICES.endreinigung['2.5'].komplett
    expectPrice(expected)
  })

  it('updates price when EFH is selected', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByRole('button', { name: /EFH/i }))
    const expected = PRICES.endreinigung['EFH'].komplett
    expectPrice(expected)
  })

  it('switches to Basic variant and shows correct price', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByRole('button', { name: /Basic/i }))
    const expected = PRICES.endreinigung['3.5'].basic
    expectPrice(expected)
  })


  it('renders the WhatsApp CTA link pointing to wa.me', () => {
    render(<Calculator />)
    const link = screen.getByRole('link', { name: /Offerte per WhatsApp/i })
    expect(link.getAttribute('href')).toMatch(/wa\.me/)
  })

  it('CTA link opens in a new tab', () => {
    render(<Calculator />)
    const link = screen.getByRole('link', { name: /Offerte per WhatsApp/i })
    expect(link.getAttribute('target')).toBe('_blank')
  })

  it('shows confirmation message after clicking the CTA', () => {
    render(<Calculator />)
    const link = screen.getByRole('link', { name: /Offerte per WhatsApp/i })
    fireEvent.click(link)
    expect(screen.getByText(/WhatsApp geöffnet/i)).toBeInTheDocument()
  })
})
