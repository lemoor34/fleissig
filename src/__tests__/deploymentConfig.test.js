import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'))

describe('Vercel production config', () => {
  it('does not rewrite every unknown URL to the homepage', () => {
    const rewrites = config.rewrites || []
    expect(rewrites.some((rule) => rule.source === '/(.*)' && rule.destination === '/index.html')).toBe(false)
  })

  it('keeps explicit rewrites for the two service landings', () => {
    expect(config.rewrites).toEqual(expect.arrayContaining([
      expect.objectContaining({
        source: '/umzugsreinigung-aargau',
        destination: '/umzugsreinigung-aargau/index.html',
      }),
      expect.objectContaining({
        source: '/fensterreinigung-aargau',
        destination: '/fensterreinigung-aargau/index.html',
      }),
    ]))
  })

  it('sets baseline browser hardening headers', () => {
    const globalRule = (config.headers || []).find((rule) => rule.source === '/(.*)')
    const headers = Object.fromEntries((globalRule?.headers || []).map(({ key, value }) => [key, value]))

    expect(headers['X-Content-Type-Options']).toBe('nosniff')
    expect(headers['X-Frame-Options']).toBe('DENY')
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['Permissions-Policy']).toContain('camera=()')
  })
})
