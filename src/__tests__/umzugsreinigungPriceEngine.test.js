import { describe, expect, it } from 'vitest'
import {
  buildWhatsAppMessage,
  calculateUmzugsreinigungEstimate,
  isEstimateFormComplete,
} from '../umzugsreinigungPriceEngine.js'

const baseForm = {
  rooms: '3-3.5',
  area: '80',
}

describe('calculateUmzugsreinigungEstimate', () => {
  it('shows CHF 650–750 for a smaller 3–3.5-room apartment', () => {
    const result = calculateUmzugsreinigungEstimate({ ...baseForm, area: '72' })
    expect(result.lower).toBe(650)
    expect(result.upper).toBe(750)
  })

  it('shows CHF 700–850 for a typical 3–3.5-room apartment', () => {
    const result = calculateUmzugsreinigungEstimate(baseForm)
    expect(result.lower).toBe(700)
    expect(result.upper).toBe(850)
  })

  it('adds an area surcharge above the normal room-size band', () => {
    const result = calculateUmzugsreinigungEstimate({ ...baseForm, area: '95' })
    expect(result.excessArea).toBe(5)
    expect(result.lower).toBe(750)
    expect(result.upper).toBe(900)
  })

  it('uses the agreed range for a typical 4–4.5-room apartment', () => {
    const result = calculateUmzugsreinigungEstimate({ rooms: '4-4.5', area: '100' })
    expect(result.lower).toBe(900)
    expect(result.upper).toBe(1050)
  })
})

describe('form and WhatsApp handoff', () => {
  it('requires only room count and living area before showing an estimate', () => {
    expect(isEstimateFormComplete(baseForm)).toBe(true)
    expect(isEstimateFormComplete({ ...baseForm, rooms: '' })).toBe(false)
    expect(isEstimateFormComplete({ ...baseForm, area: '' })).toBe(false)
  })

  it('includes the two answers and estimate in the WhatsApp message', () => {
    const estimate = calculateUmzugsreinigungEstimate(baseForm)
    const message = buildWhatsAppMessage(baseForm, estimate)
    expect(message).toContain('3–3.5 Zimmer')
    expect(message).toContain('80 m²')
    expect(message).toContain('CHF 700–850')
    expect(message).toContain('Fotos oder ein kurzes Video')
  })
})
