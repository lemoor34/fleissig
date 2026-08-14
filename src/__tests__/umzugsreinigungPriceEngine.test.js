import { describe, expect, it } from 'vitest'
import {
  buildWhatsAppMessage,
  calculateUmzugsreinigungEstimate,
  isEstimateFormComplete,
} from '../umzugsreinigungPriceEngine.js'

const baseForm = {
  rooms: '3-3.5',
  area: '80',
  dirt: 'normal',
  pets: 'no',
  windows: 'normal',
  blinds: 'roller',
  extras: [],
  handoverDate: '2026-08-31',
}

describe('calculateUmzugsreinigungEstimate', () => {
  it('prices a normal 3.5-room apartment at CHF 850–900', () => {
    const result = calculateUmzugsreinigungEstimate(baseForm)
    expect(result.raw).toBe(849)
    expect(result.lower).toBe(850)
    expect(result.upper).toBe(900)
  })

  it('adds area surcharge in started 10 m² steps above the room threshold', () => {
    const result = calculateUmzugsreinigungEstimate({ ...baseForm, area: '105' })
    expect(result.excessArea).toBe(15)
    expect(result.raw).toBe(949)
    expect(result.lower).toBe(950)
  })

  it('widens the range for higher-uncertainty apartments', () => {
    const result = calculateUmzugsreinigungEstimate({
      ...baseForm,
      dirt: 'strong',
      pets: 'yes',
      windows: 'panorama',
      blinds: 'lamella',
      extras: ['balcony'],
    })
    expect(result.raw).toBe(1189)
    expect(result.lower).toBe(1200)
    expect(result.upper).toBe(1300)
    expect(result.higherUncertainty).toBe(true)
  })

  it('adds optional areas independently', () => {
    const result = calculateUmzugsreinigungEstimate({
      ...baseForm,
      extras: ['balcony', 'cellar', 'garage'],
    })
    expect(result.raw).toBe(999)
    expect(result.lower).toBe(1000)
    expect(result.upper).toBe(1050)
  })
})

describe('form and WhatsApp handoff', () => {
  it('requires all core fields before showing an estimate', () => {
    expect(isEstimateFormComplete(baseForm)).toBe(true)
    expect(isEstimateFormComplete({ ...baseForm, handoverDate: '' })).toBe(false)
  })

  it('includes the answers and estimate in the WhatsApp message', () => {
    const estimate = calculateUmzugsreinigungEstimate(baseForm)
    const message = buildWhatsAppMessage(baseForm, estimate)
    expect(message).toContain('3–3.5 Zimmer')
    expect(message).toContain('80 m²')
    expect(message).toContain('31.08.2026')
    expect(message).toContain('CHF 850–900')
  })
})
