import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import App from '../App.jsx'

vi.mock('@formspree/react', () => ({
  useForm: () => [{ succeeded: false, errors: [], submitting: false }, vi.fn()],
}))

beforeEach(() => {
  window.scrollTo = vi.fn()
})

const getNav = () => document.querySelector('nav')

describe('App router', () => {
  it('renders the home page by default', () => {
    render(<App />)
    expect(screen.getAllByText('Fleissig').length).toBeGreaterThan(0)
  })

  it('renders the Nav on all pages', () => {
    render(<App />)
    expect(getNav()).toBeInTheDocument()
  })

  it('renders the Footer on all pages', () => {
    render(<App />)
    expect(document.querySelector('footer')).toBeInTheDocument()
  })

  it('calls window.scrollTo when the page changes', () => {
    render(<App />)
    fireEvent.click(within(getNav()).getByRole('button', { name: 'Preise' }))
    expect(window.scrollTo).toHaveBeenCalled()
  })

  it('navigates to FAQ page via desktop nav', () => {
    render(<App />)
    fireEvent.click(within(getNav()).getByRole('button', { name: 'FAQ' }))
    expect(screen.getByText(/Häufige Fragen/i)).toBeInTheDocument()
  })

  it('navigates to Umzugsreinigung page via desktop nav', () => {
    render(<App />)
    fireEvent.click(within(getNav()).getByRole('button', { name: 'Umzugsreinigung' }))
    expect(screen.getAllByText(/Umzugsreinigung/i).length).toBeGreaterThan(0)
  })

  it('navigates to Kontakt page via mobile menu', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('burger-btn'))
    fireEvent.click(within(getNav()).getByText('Kontakt'))
    expect(screen.getAllByText(/Kontakt/i).length).toBeGreaterThan(0)
  })

  it('navigates back to home when logo is clicked', () => {
    render(<App />)
    fireEvent.click(within(getNav()).getByRole('button', { name: 'FAQ' }))
    fireEvent.click(within(getNav()).getByRole('button', { name: /Fleissig/i }))
    // initial render + FAQ click + home click = 3
    expect(window.scrollTo).toHaveBeenCalledTimes(3)
  })
})
