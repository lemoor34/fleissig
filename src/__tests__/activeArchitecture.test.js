import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const activeFiles = [
  'src/AppV4.jsx',
  'src/UmzugsreinigungLanding.jsx',
  'src/FensterreinigungLanding.jsx',
]

function source(path) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('active production architecture', () => {
  it.each(activeFiles)('%s does not own a page-local analytics loader or cookie banner', (path) => {
    const text = source(path)
    expect(text).not.toContain('loadAnalyticsAfterConsent')
    expect(text).not.toContain('function CookieBanner')
    expect(text).not.toContain('gtag/js?id=')
  })

  it('active pages do not emit superseded contact conversion events', () => {
    const text = activeFiles.map(source).join('\n')
    expect(text).not.toContain('conversion_event_contact')
    expect(text).not.toContain('umzug_whatsapp_click')
    expect(text).not.toContain('fenster_whatsapp_click')
  })
})
