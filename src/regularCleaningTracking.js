const REGULAR_FREQUENCIES = new Set([
  'Wöchentlich',
  'Alle 2 Wochen',
  'Monatlich',
])

let trackingInitialized = false

export function frequencyFromWhatsAppHref(href) {
  try {
    const url = new URL(href, window.location.href)
    const text = url.searchParams.get('text') || ''
    const match = text.match(/^Häufigkeit:\s*(.+)$/m)
    return (match?.[1] || '').trim()
  } catch {
    return ''
  }
}

export function isRegularCleaningFrequency(frequency) {
  return REGULAR_FREQUENCIES.has(String(frequency || '').trim())
}

export function initRegularCleaningTracking() {
  if (trackingInitialized) return
  trackingInitialized = true

  document.addEventListener('click', (event) => {
    if (!window.location.pathname.includes('wohnungsreinigung')) return

    const link = event.target.closest?.('a')
    if (!link) return

    const href = link.getAttribute('href') || ''
    if (!href.includes('wa.me/') && !href.includes('api.whatsapp.com/')) return

    const frequency = frequencyFromWhatsAppHref(href)
    if (!isRegularCleaningFrequency(frequency)) return

    window.fleissigTracking?.trackEvent?.('regular_cleaning_whatsapp_click', {
      service: 'wohnungsreinigung',
      frequency,
      contact_page: window.location.pathname,
      link_label: (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120),
    })
  }, { capture: true })
}
