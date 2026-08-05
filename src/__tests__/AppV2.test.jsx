import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AppV2 from '../AppV2.jsx'

describe('Conversion-focused homepage', () => {
  it('renders the primary cleaning offer', () => {
    render(<AppV2 />)
    expect(screen.getByText(/Ihre Reinigung/i)).toBeInTheDocument()
    expect(screen.getAllByText(/CHF 55/i).length).toBeGreaterThan(0)
  })

  it('provides WhatsApp conversion links', () => {
    render(<AppV2 />)
    const links = screen.getAllByRole('link').filter(link => /wa\.me/.test(link.getAttribute('href') || ''))
    expect(links.length).toBeGreaterThan(2)
  })

  it('shows the three core services', () => {
    render(<AppV2 />)
    expect(screen.getAllByText('Wohnungsreinigung').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Umzugsreinigung').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Gartenpflege').length).toBeGreaterThan(0)
  })
})
