import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FAQAccordion } from '../App.jsx'

const items = [
  { q: 'Was ist Frage 1?', a: 'Das ist Antwort 1.' },
  { q: 'Was ist Frage 2?', a: 'Das ist Antwort 2.' },
  { q: 'Was ist Frage 3?', a: 'Das ist Antwort 3.' },
]

describe('FAQAccordion', () => {
  it('renders all questions', () => {
    render(<FAQAccordion items={items} />)
    items.forEach(item => {
      expect(screen.getByText(item.q)).toBeInTheDocument()
    })
  })

  it('all answers are hidden by default', () => {
    render(<FAQAccordion items={items} />)
    items.forEach(item => {
      expect(screen.queryByText(item.a)).not.toBeInTheDocument()
    })
  })

  it('shows an answer when its question is clicked', () => {
    render(<FAQAccordion items={items} />)
    fireEvent.click(screen.getByText(items[0].q))
    expect(screen.getByText(items[0].a)).toBeInTheDocument()
  })

  it('hides an answer when the same question is clicked again', () => {
    render(<FAQAccordion items={items} />)
    fireEvent.click(screen.getByText(items[0].q))
    fireEvent.click(screen.getByText(items[0].q))
    expect(screen.queryByText(items[0].a)).not.toBeInTheDocument()
  })

  it('only one answer is open at a time', () => {
    render(<FAQAccordion items={items} />)
    fireEvent.click(screen.getByText(items[0].q))
    fireEvent.click(screen.getByText(items[1].q))
    expect(screen.queryByText(items[0].a)).not.toBeInTheDocument()
    expect(screen.getByText(items[1].a)).toBeInTheDocument()
  })

  it('closing one item and opening another works correctly', () => {
    render(<FAQAccordion items={items} />)
    fireEvent.click(screen.getByText(items[2].q))
    expect(screen.getByText(items[2].a)).toBeInTheDocument()
    fireEvent.click(screen.getByText(items[0].q))
    expect(screen.queryByText(items[2].a)).not.toBeInTheDocument()
    expect(screen.getByText(items[0].a)).toBeInTheDocument()
  })

  it('renders without errors when given an empty array', () => {
    const { container } = render(<FAQAccordion items={[]} />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
