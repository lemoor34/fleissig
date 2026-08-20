import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  window.localStorage.clear()
  window.history.replaceState({}, '', '/?gclid=TEST-GCLID&utm_campaign=qa&utm_term=endreinigung')
  document.body.innerHTML = '<a id="wa" href="https://wa.me/41779588526">WhatsApp</a>'
  document.getElementById('wa').addEventListener('click', (event) => event.preventDefault())
  window.gtag = vi.fn()
  delete window.fleissigTracking
})

describe('first-party attribution', () => {
  it('persists the original paid touch immediately when consent changes to accepted', async () => {
    const { initTracking } = await import('../tracking.js')

    initTracking()
    initTracking()

    expect(window.localStorage.getItem('fleissig-attribution-v3')).toBeNull()

    window.localStorage.setItem('fleissig-consent', 'accepted')
    window.dispatchEvent(new CustomEvent('fleissig-consent-changed', {
      detail: { choice: 'accepted' },
    }))

    const stored = JSON.parse(window.localStorage.getItem('fleissig-attribution-v3'))

    expect(stored.first_touch.gclid).toBe('TEST-GCLID')
    expect(stored.first_touch.source).toBe('google')
    expect(stored.first_touch.medium).toBe('cpc')
    expect(stored.first_touch.utm_campaign).toBe('qa')
    expect(stored.first_touch.utm_term).toBe('endreinigung')
    expect(stored.last_non_direct.gclid).toBe('TEST-GCLID')

    document.getElementById('wa').dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }))

    const contactCalls = window.gtag.mock.calls.filter(
      ([command, eventName]) => command === 'event' && eventName === 'whatsapp_click'
    )

    expect(contactCalls).toHaveLength(1)
    expect(contactCalls[0][2]).toMatchObject({
      gclid: 'TEST-GCLID',
      campaign_name: 'qa',
      campaign_term: 'endreinigung',
      first_touch_source: 'google',
      traffic_source: 'google',
    })
    expect(contactCalls[0][2].page_location).toContain('gclid=TEST-GCLID')
  })
})
