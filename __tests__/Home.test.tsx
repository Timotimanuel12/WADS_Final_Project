import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Lab Week 2 Submission', () => {
  it('should pass a basic sanity check', () => {
    const sum = 1 + 1;
    expect(sum).toBe(2);
  });

  it('should render a heading in the document', () => {
    render(<h1>Welcome to FocusFlow</h1>)
    
    const heading = screen.getByRole('heading', { level: 1 })
    
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Welcome to FocusFlow')
  })
})