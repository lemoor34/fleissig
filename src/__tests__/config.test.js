import { describe, it, expect } from 'vitest'
import { CONFIG, PRICES, PAKETE, PAGES } from '../App.jsx'

describe('CONFIG', () => {
  it('has a WA_NUMBER', () => {
    expect(CONFIG.WA_NUMBER).toBeTruthy()
  })

  it('has a valid email address', () => {
    expect(CONFIG.EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  })

  it('has a PHONE number', () => {
    expect(CONFIG.PHONE).toBeTruthy()
  })

  it('has a UID (company registration number)', () => {
    expect(CONFIG.UID).toBeTruthy()
  })

  it('OFFER_END is a valid Date object', () => {
    expect(CONFIG.OFFER_END).toBeInstanceOf(Date)
    expect(isNaN(CONFIG.OFFER_END.getTime())).toBe(false)
  })
})

describe('PRICES.unterhalt', () => {
  it('has all four tiers', () => {
    expect(PRICES.unterhalt.einmalig).toBeGreaterThan(0)
    expect(PRICES.unterhalt.basis).toBeGreaterThan(0)
    expect(PRICES.unterhalt.komfort).toBeGreaterThan(0)
    expect(PRICES.unterhalt.premium).toBeGreaterThan(0)
  })

  it('monthly tiers increase in price (basis < komfort < premium)', () => {
    expect(PRICES.unterhalt.komfort).toBeGreaterThan(PRICES.unterhalt.basis)
    expect(PRICES.unterhalt.premium).toBeGreaterThan(PRICES.unterhalt.komfort)
  })
})

describe('PRICES.garten', () => {
  it('has all required garten prices', () => {
    expect(PRICES.garten.stunde_abo).toBeGreaterThan(0)
    expect(PRICES.garten.stunde_einmalig).toBeGreaterThan(0)
    expect(PRICES.garten.fruehling).toBeGreaterThan(0)
    expect(PRICES.garten.herbst).toBeGreaterThan(0)
    expect(PRICES.garten.abo_monat).toBeGreaterThan(0)
  })
})

describe('PAKETE', () => {
  it('is an empty array', () => {
    expect(PAKETE).toHaveLength(0)
  })
})

describe('PAGES', () => {
  it('every page has an id and a label', () => {
    PAGES.forEach(p => {
      expect(p.id).toBeTruthy()
      expect(p.label).toBeTruthy()
    })
  })

  it('has no duplicate page IDs', () => {
    const ids = PAGES.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes a home page', () => {
    expect(PAGES.some(p => p.id === 'home')).toBe(true)
  })

  it('includes kontakt page', () => {
    expect(PAGES.some(p => p.id === 'kontakt')).toBe(true)
  })

  it('does not include umzugsreinigung', () => {
    expect(PAGES.some(p => p.id === 'umzugsreinigung')).toBe(false)
  })
})
