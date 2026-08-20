import { beforeEach, describe, expect, it } from 'vitest'
import {
  getConsentChoice,
  initConsentMode,
  setConsentChoice,
} from '../privacyConsent.js'

function calls() {
  return (window.dataLayer || []).map((entry) => Array.from(entry))
}

beforeEach(() => {
  window.localStorage.clear()
  window.dataLayer = []
  delete window.gtag
  delete window.fbq
  delete window._fbq
  document.head.innerHTML = ''
  document.body.innerHTML = '<script id="bootstrap"></script>'
})

describe('Consent Mode v2', () => {
  it('starts denied and does not load optional measurement tags before consent', () => {
    initConsentMode()

    const defaultCall = calls().find(
      ([command, phase]) => command === 'consent' && phase === 'default'
    )

    expect(defaultCall).toBeTruthy()
    expect(defaultCall[2]).toMatchObject({
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    expect(document.getElementById('ga-script')).toBeNull()
    expect(getConsentChoice()).toBeNull()
  })

  it('grants measurement but keeps ad personalization denied after acceptance', () => {
    initConsentMode()
    setConsentChoice('accepted')

    const updateCall = calls().find(
      ([command, phase, payload]) =>
        command === 'consent' &&
        phase === 'update' &&
        payload?.analytics_storage === 'granted'
    )

    expect(updateCall[2]).toMatchObject({
      ad_storage: 'granted',
      analytics_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'denied',
    })
    expect(document.getElementById('ga-script')).not.toBeNull()
    expect(getConsentChoice()).toBe('accepted')
  })

  it('suppresses historical duplicate contact events at the central gtag boundary', () => {
    initConsentMode()
    setConsentChoice('accepted')

    window.gtag('event', 'conversion_event_contact', { contact_type: 'legacy' })
    window.gtag('event', 'umzug_whatsapp_click', { legacy: true })
    window.gtag('event', 'whatsapp_click', { canonical: true })

    const eventNames = calls()
      .filter(([command]) => command === 'event')
      .map(([, name]) => name)

    expect(eventNames).not.toContain('conversion_event_contact')
    expect(eventNames).not.toContain('umzug_whatsapp_click')
    expect(eventNames).toContain('whatsapp_click')
  })

  it('keeps optional measurement denied after rejection', () => {
    initConsentMode()
    setConsentChoice('rejected')

    const updateCalls = calls().filter(
      ([command, phase]) => command === 'consent' && phase === 'update'
    )
    const last = updateCalls.at(-1)

    expect(last[2]).toMatchObject({
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    expect(document.getElementById('ga-script')).toBeNull()
    expect(getConsentChoice()).toBe('rejected')
  })
})
