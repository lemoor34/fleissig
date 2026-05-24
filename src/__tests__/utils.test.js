import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  formatPrice,
  isOfferActive,
  getOfferDiscount,
  buildWaLink,
  CONFIG,
} from '../App.jsx'

describe('formatPrice', () => {
  it('formats 1000 with Swiss apostrophe separator', () => {
    expect(formatPrice(1000)).toBe("1'000")
  })

  it('formats 1090', () => {
    expect(formatPrice(1090)).toBe("1'090")
  })

  it('formats large number with multiple separators', () => {
    expect(formatPrice(1000000)).toBe("1'000'000")
  })

  it('leaves numbers below 1000 unchanged', () => {
    expect(formatPrice(890)).toBe('890')
    expect(formatPrice(99)).toBe('99')
  })

  it('handles 0', () => {
    expect(formatPrice(0)).toBe('0')
  })
})

describe('isOfferActive', () => {
  afterEach(() => vi.useRealTimers())

  it('returns true when current date is before offer end', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00'))
    expect(isOfferActive()).toBe(true)
  })

  it('returns false when current date is after offer end', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-01T00:00:00'))
    expect(isOfferActive()).toBe(false)
  })

  it('returns false the day after offer ends (2026-07-01)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-01T10:00:00'))
    expect(isOfferActive()).toBe(false)
  })

  it('returns true on the last day of the offer (2026-06-30)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-30T12:00:00'))
    expect(isOfferActive()).toBe(true)
  })
})

describe('getOfferDiscount', () => {
  afterEach(() => vi.useRealTimers())

  it('returns 50 for 2.5-room apartment when offer is active', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01'))
    expect(getOfferDiscount('2.5')).toBe(50)
  })

  it('returns 100 for 3.5-room apartment when offer is active', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01'))
    expect(getOfferDiscount('3.5')).toBe(100)
  })

  it('returns 100 for 4.5-room apartment when offer is active', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01'))
    expect(getOfferDiscount('4.5')).toBe(100)
  })

  it('returns 100 for EFH when offer is active', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01'))
    expect(getOfferDiscount('EFH')).toBe(100)
  })

  it('returns 0 for all sizes when offer is expired', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-01'))
    expect(getOfferDiscount('2.5')).toBe(0)
    expect(getOfferDiscount('3.5')).toBe(0)
    expect(getOfferDiscount('EFH')).toBe(0)
  })
})

describe('buildWaLink', () => {
  it('returns a wa.me URL', () => {
    expect(buildWaLink('general')).toMatch(/^https:\/\/wa\.me\//)
  })

  it('includes the configured WA number', () => {
    expect(buildWaLink('general')).toContain(CONFIG.WA_NUMBER)
  })

  it('generates different links for each known service', () => {
    const services = ['general', 'endreinigung', 'unterhalt', 'garten', 'fenster']
    const links = services.map(s => buildWaLink(s))
    const unique = new Set(links)
    expect(unique.size).toBe(services.length)
  })

  it('falls back to general text for unknown service', () => {
    expect(buildWaLink('unknown_xyz')).toBe(buildWaLink('general'))
  })

  it('URL-encodes the message (no raw spaces)', () => {
    const link = buildWaLink('endreinigung')
    const textParam = link.split('?text=')[1]
    expect(textParam).not.toContain(' ')
  })

  it('includes a text query parameter', () => {
    expect(buildWaLink('general')).toContain('?text=')
  })
})
