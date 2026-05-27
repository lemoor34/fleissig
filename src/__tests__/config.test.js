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

describe('PRICES.endreinigung', () => {
  const roomSizes = ['2.5', '3.5', '4.5', '5.5', 'EFH']

  roomSizes.forEach(size => {
    it(`${size}-Zi has a positive basic price`, () => {
      expect(PRICES.endreinigung[size].basic).toBeGreaterThan(0)
    })

    it(`${size}-Zi has a positive komplett price`, () => {
      expect(PRICES.endreinigung[size].komplett).toBeGreaterThan(0)
    })

    it(`${size}-Zi: komplett is more expensive than basic`, () => {
      expect(PRICES.endreinigung[size].komplett).toBeGreaterThan(
        PRICES.endreinigung[size].basic
      )
    })
  })

  it('prices increase with apartment size (basic)', () => {
    const sizes = ['2.5', '3.5', '4.5', '5.5', 'EFH']
    for (let i = 0; i < sizes.length - 1; i++) {
      expect(PRICES.endreinigung[sizes[i + 1]].basic).toBeGreaterThan(
        PRICES.endreinigung[sizes[i]].basic
      )
    }
  })
})

describe('PRICES.extras', () => {
  it('entsorgung has a positive price', () => {
    expect(PRICES.extras.entsorgung).toBeGreaterThan(0)
  })

  it('teppich has a positive price', () => {
    expect(PRICES.extras.teppich).toBeGreaterThan(0)
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

describe('PAKETE', () => {
  it('contains exactly 4 packages', () => {
    expect(PAKETE).toHaveLength(4)
  })

  PAKETE.forEach((p, i) => {
    it(`package ${i} (${p.name}) has a name, items, einzeln and paket`, () => {
      expect(p.name).toBeTruthy()
      expect(p.items).toBeTruthy()
      expect(p.einzeln).toBeGreaterThan(0)
      expect(p.paket).toBeGreaterThan(0)
    })

    it(`package ${i} (${p.name}): paket price is less than einzeln (real discount)`, () => {
      expect(p.paket).toBeLessThan(p.einzeln)
    })
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
})
