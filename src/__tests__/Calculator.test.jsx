import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Calculator, PRICES, formatPrice } from '../App.jsx'

// Freeze time so the offer is always active for these tests
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-01T12:00:00'))
})

afterEach(() => {
  vi.useRealTimers()
})

const fmt = (n) => `CHF ${formatPrice(n)}`

describe('Calculator', () => {
  it('renders the calculator heading', () => {
    render(<Calculator />)
    expect(screen.getByText(/Preis berechnen/i)).toBeInTheDocument()
  })

  it('shows initial price for 3.5-Zi komplett with offer discount', () => {
    render(<Calculator />)
    // Default: 3.5-Zi, komplett, no extras, offer active → 1090 - 100 = 990
    const expected = PRICES.endreinigung['3.5'].komplett - 100
    expect(screen.getByText(fmt(expected))).toBeInTheDocument()
  })

  it('updates price when a different room size is selected', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByRole('button', { name: /2\.5-Zi/i }))
    // 2.5-Zi komplett - 50 (smaller discount) = 840
    const expected = PRICES.endreinigung['2.5'].komplett - 50
    expect(screen.getByText(fmt(expected))).toBeInTheDocument()
  })

  it('updates price when EFH is selected', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByRole('button', { name: /EFH/i }))
    const expected = PRICES.endreinigung['EFH'].komplett - 100
    expect(screen.getByText(fmt(expected))).toBeInTheDocument()
  })

  it('switches to Basic variant and shows correct price', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByRole('button', { name: /Basic/i }))
    // 3.5-Zi basic - 100 discount = 790
    const expected = PRICES.endreinigung['3.5'].basic - 100
    expect(screen.getByText(fmt(expected))).toBeInTheDocument()
  })

  it('adds entsorgung extra to total when checked', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByRole('checkbox', { name: /Grüngutentsorgung/i }))
    const expected =
      PRICES.endreinigung['3.5'].komplett + PRICES.extras.entsorgung - 100
    expect(screen.getByText(fmt(expected))).toBeInTheDocument()
  })

  it('adds teppich extra to total when checked', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByRole('checkbox', { name: /Teppichreinigung/i }))
    const expected =
      PRICES.endreinigung['3.5'].komplett + PRICES.extras.teppich - 100
    expect(screen.getByText(fmt(expected))).toBeInTheDocument()
  })

  it('adds both extras correctly', () => {
    render(<Calculator />)
    fireEvent.click(screen.getByRole('checkbox', { name: /Grüngutentsorgung/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Teppichreinigung/i }))
    const expected =
      PRICES.endreinigung['3.5'].komplett +
      PRICES.extras.entsorgung +
      PRICES.extras.teppich -
      100
    expect(screen.getByText(fmt(expected))).toBeInTheDocument()
  })

  it('removes extra from total when checkbox is unchecked', () => {
    render(<Calculator />)
    const checkbox = screen.getByRole('checkbox', { name: /Grüngutentsorgung/i })
    fireEvent.click(checkbox) // check
    fireEvent.click(checkbox) // uncheck
    const expected = PRICES.endreinigung['3.5'].komplett - 100
    expect(screen.getByText(fmt(expected))).toBeInTheDocument()
  })

  it('shows the Eröffnungsrabatt line when offer is active', () => {
    render(<Calculator />)
    expect(screen.getByText(/Eröffnungsrabatt/i)).toBeInTheDocument()
  })

  it('does not show Eröffnungsrabatt when offer has expired', () => {
    vi.setSystemTime(new Date('2026-07-01T00:00:00'))
    render(<Calculator />)
    expect(screen.queryByText(/Eröffnungsrabatt/i)).not.toBeInTheDocument()
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
