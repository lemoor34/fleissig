import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  window.history.replaceState({}, '', '/wohnungsreinigung-aargau')
  document.body.innerHTML = ''
  window.fleissigTracking = { trackEvent: vi.fn() }
})

describe('regular cleaning tracking', () => {
  it('tracks recurring Wohnungsreinigung WhatsApp intent separately', async () => {
    const { initRegularCleaningTracking } = await import('../regularCleaningTracking.js')

    document.body.innerHTML = `
      <a id="wa" href="https://wa.me/41779588526?text=${encodeURIComponent('Grüezi!\nHäufigkeit: Wöchentlich\nWohnfläche: 80 m²')}">
        Anfrage per WhatsApp senden
      </a>
    `

    initRegularCleaningTracking()
    document.getElementById('wa').dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }))

    expect(window.fleissigTracking.trackEvent).toHaveBeenCalledTimes(1)
    expect(window.fleissigTracking.trackEvent).toHaveBeenCalledWith(
      'regular_cleaning_whatsapp_click',
      expect.objectContaining({
        service: 'wohnungsreinigung',
        frequency: 'Wöchentlich',
        contact_page: '/wohnungsreinigung-aargau',
      }),
    )
  })

  it('does not classify a one-time cleaning as regular', async () => {
    const { initRegularCleaningTracking } = await import('../regularCleaningTracking.js')

    document.body.innerHTML = `
      <a id="wa" href="https://wa.me/41779588526?text=${encodeURIComponent('Grüezi!\nHäufigkeit: Einmalig')}">WhatsApp</a>
    `

    initRegularCleaningTracking()
    document.getElementById('wa').dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }))

    expect(window.fleissigTracking.trackEvent).not.toHaveBeenCalled()
  })
})
