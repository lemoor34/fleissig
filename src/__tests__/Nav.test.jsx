import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Nav } from '../App.jsx'

describe('Nav', () => {
  it('renders the Fleissig logo image', () => {
    render(<Nav currentPage="home" setPage={vi.fn()} />)
    expect(screen.getByAltText('Fleissig Reinigung')).toBeInTheDocument()
  })

  it('calls setPage("home") when the logo is clicked', () => {
    const setPage = vi.fn()
    render(<Nav currentPage="home" setPage={setPage} />)
    fireEvent.click(screen.getByRole('button', { name: /Fleissig/i }))
    expect(setPage).toHaveBeenCalledWith('home')
  })

  it('renders a WhatsApp link in the mobile menu', () => {
    render(<Nav currentPage="home" setPage={vi.fn()} />)
    fireEvent.click(screen.getByTestId('burger-btn'))
    const waLinks = screen.getAllByRole('link')
    const waLink = waLinks.find(l => l.getAttribute('href')?.includes('wa.me'))
    expect(waLink).toBeTruthy()
  })

  it('desktop nav shows Umzugsreinigung link', () => {
    render(<Nav currentPage="home" setPage={vi.fn()} />)
    const link = screen.getAllByRole('link').find(l => l.textContent === 'Umzugsreinigung')
    expect(link).toBeTruthy()
  })

  it('mobile menu is closed by default (no Start link visible)', () => {
    render(<Nav currentPage="home" setPage={vi.fn()} />)
    expect(screen.queryByText('Start')).not.toBeInTheDocument()
  })

  it('opens mobile menu when burger button is clicked', () => {
    render(<Nav currentPage="home" setPage={vi.fn()} />)
    fireEvent.click(screen.getByTestId('burger-btn'))
    expect(screen.getByText('Start')).toBeInTheDocument()
  })

  it('closes mobile menu after a page is selected from it', () => {
    const setPage = vi.fn()
    render(<Nav currentPage="home" setPage={setPage} />)
    fireEvent.click(screen.getByTestId('burger-btn'))
    fireEvent.click(screen.getByText('Start'))
    expect(screen.queryByText('Start')).not.toBeInTheDocument()
  })

  it('calls setPage when a mobile menu item is clicked', () => {
    const setPage = vi.fn()
    render(<Nav currentPage="home" setPage={setPage} />)
    fireEvent.click(screen.getByTestId('burger-btn'))
    fireEvent.click(screen.getByText('Kontakt'))
    expect(setPage).toHaveBeenCalledWith('kontakt')
  })

  it('calls setPage when a desktop nav link is clicked', () => {
    const setPage = vi.fn()
    render(<Nav currentPage="home" setPage={setPage} />)
    const link = screen.getAllByRole('link').find(l => l.textContent === 'Umzugsreinigung')
    fireEvent.click(link)
    expect(setPage).toHaveBeenCalledWith('umzugsreinigung')
  })

  it('highlights the currently active page link', () => {
    render(<Nav currentPage="umzugsreinigung" setPage={vi.fn()} />)
    const activeLink = screen.getAllByRole('link').find(l => l.textContent === 'Umzugsreinigung')
    expect(activeLink.style.color).toBe('rgb(61, 123, 79)')
  })
})
