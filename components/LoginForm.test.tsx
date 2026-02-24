import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import LoginForm from './LoginForm'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock('@/lib/firebase', () => ({
  auth: {},
}))

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
}))

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

  it('switches to create account mode', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole('button', { name: /create one/i }))

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Create Account')
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })
})