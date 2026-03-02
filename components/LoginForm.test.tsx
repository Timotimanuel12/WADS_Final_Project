import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoginForm from './LoginForm'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('LoginForm Component', () => {

  it('renders the login form heading', () => {
    render(<LoginForm />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Welcome Back')
  })

  it('contains email and password inputs', () => {
    render(<LoginForm />)
    const emailInput = screen.getByPlaceholderText('alex@binus.ac.id')
    expect(emailInput).toBeInTheDocument()
  })

  it('renders the Sign In button', () => {
    render(<LoginForm />)
    const button = screen.getByRole('button', { name: /sign in/i })
    expect(button).toBeInTheDocument()
  })
})