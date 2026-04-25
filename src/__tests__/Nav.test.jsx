import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Nav } from '../App.jsx'

describe('Nav', () => {
  it('renders the Fleissig brand name', () => {
    render(<Nav currentPage="home" setPage={vi.fn()} />)
    expect(screen.getByText('Fleissig')).toBeInTheDocument()
  })

  it('calls setPage("home") when the logo is clicked', () => {
    const setPage = vi.fn()
    render(<Nav currentPage="home" setPage={setPage} />)
    fireEvent.click(screen.getByRole('button', { name: /Fleissig/i }))
    expect(setPage).toHaveBeenCalledWith('home')
  })

  it('renders a WhatsApp link in the header', () => {
    render(<Nav currentPage="home" setPage={vi.fn()} />)
    const waLinks = screen.getAllByRole('link')
    const waLink = waLinks.find(l => l.textContent.includes('WhatsApp'))
    expect(waLink).toBeTruthy()
    expect(waLink.getAttribute('href')).toMatch(/wa\.me/)
  })

  it('desktop nav shows Umzugsreinigung button', () => {
    render(<Nav currentPage="home" setPage={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Umzugsreinigung' })).toBeInTheDocument()
  })

  it('mobile menu is closed by default (no Start button visible)', () => {
    render(<Nav currentPage="home" setPage={vi.fn()} />)
    // "Start" only appears in the mobile menu (desktop nav shows slice(1,6))
    expect(screen.queryByText('Start')).not.toBeInTheDocument()
  })

  it('opens mobile menu when burger button is clicked', () => {
    render(<Nav currentPage="home" setPage={vi.fn()} />)
    fireEvent.click(screen.getByTestId('burger-btn'))
    // Mobile menu shows all PAGES including "Start"
    expect(screen.getByText('Start')).toBeInTheDocument()
  })

  it('closes mobile menu after a page is selected from it', () => {
    const setPage = vi.fn()
    render(<Nav currentPage="home" setPage={setPage} />)
    fireEvent.click(screen.getByTestId('burger-btn'))
    fireEvent.click(screen.getByText('Start'))
    // Menu should be closed — "Start" disappears
    expect(screen.queryByText('Start')).not.toBeInTheDocument()
  })

  it('calls setPage when a mobile menu item is clicked', () => {
    const setPage = vi.fn()
    render(<Nav currentPage="home" setPage={setPage} />)
    fireEvent.click(screen.getByTestId('burger-btn'))
    fireEvent.click(screen.getByText('Kontakt'))
    expect(setPage).toHaveBeenCalledWith('kontakt')
  })

  it('calls setPage when a desktop nav button is clicked', () => {
    const setPage = vi.fn()
    render(<Nav currentPage="home" setPage={setPage} />)
    fireEvent.click(screen.getByRole('button', { name: 'Umzugsreinigung' }))
    expect(setPage).toHaveBeenCalledWith('umzugsreinigung')
  })

  it('highlights the currently active page', () => {
    render(<Nav currentPage="umzugsreinigung" setPage={vi.fn()} />)
    const activeBtn = screen.getByRole('button', { name: 'Umzugsreinigung' })
    expect(activeBtn.style.color).toBe('rgb(61, 123, 79)')
  })
})
