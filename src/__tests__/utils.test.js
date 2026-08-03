import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  buildWaLink,
  buildWaOrderLink,
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

describe('buildWaOrderLink', () => {
  it('returns a wa.me URL with the configured number', () => {
    const link = buildWaOrderLink('Grüezi! Testbestellung.')
    expect(link).toMatch(/^https:\/\/wa\.me\//)
    expect(link).toContain(CONFIG.WA_NUMBER)
  })

  it('URL-encodes the custom message', () => {
    const link = buildWaOrderLink('Grüezi! Ich möchte 3 Stunden buchen (CHF 165).')
    const textParam = link.split('?text=')[1]
    expect(textParam).not.toContain(' ')
    expect(decodeURIComponent(textParam)).toContain('3 Stunden')
  })
})
