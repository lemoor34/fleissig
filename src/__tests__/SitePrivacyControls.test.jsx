import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import SitePrivacyControls from '../SitePrivacyControls.jsx'

beforeEach(() => {
  window.localStorage.clear()
  window.localStorage.setItem('fleissig-consent', 'accepted')
  window.localStorage.setItem('fleissig-consent-version', '2')
})

describe('SitePrivacyControls', () => {
  it('moves focus into the privacy dialog, closes on Escape, and restores focus', async () => {
    const opener = document.createElement('button')
    opener.textContent = 'Datenschutz'
    document.body.appendChild(opener)
    opener.focus()

    render(<SitePrivacyControls />)
    fireEvent.click(opener)

    expect(screen.getByRole('heading', { name: 'Datenschutzerklärung', level: 1 })).toBeInTheDocument()

    const close = screen.getByRole('button', { name: 'Schliessen' })
    await waitFor(() => expect(close).toHaveFocus())

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Datenschutzerklärung', level: 1 })).not.toBeInTheDocument()
      expect(opener).toHaveFocus()
    })
  })
})
