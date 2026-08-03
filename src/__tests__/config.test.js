import { describe, it, expect } from 'vitest'
import { CONFIG, PRICES, PAGES } from '../App.jsx'

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

describe('PRICES hourly rates', () => {
  it('cleaning hourly rate is positive', () => {
    expect(PRICES.reinigung.stunde).toBeGreaterThan(0)
  })

  it('garden hourly rate is positive and higher than cleaning', () => {
    expect(PRICES.garten.stunde).toBeGreaterThan(0)
    expect(PRICES.garten.stunde).toBeGreaterThan(PRICES.reinigung.stunde)
  })

  it('garden packages have positive prices', () => {
    expect(PRICES.garten.fruehling).toBeGreaterThan(0)
    expect(PRICES.garten.herbst).toBeGreaterThan(0)
  })
})

describe('PRICES.fenster', () => {
  const sizes = ['2.5', '3.5', '4.5', '5.5']

  sizes.forEach(size => {
    it(`${size}-Zi has a positive pauschal price`, () => {
      expect(PRICES.fenster[size]).toBeGreaterThan(0)
    })
  })

  it('prices increase with apartment size', () => {
    for (let i = 0; i < sizes.length - 1; i++) {
      expect(PRICES.fenster[sizes[i + 1]]).toBeGreaterThan(PRICES.fenster[sizes[i]])
    }
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
