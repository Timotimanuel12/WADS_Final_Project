import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import LoginForm from '@/components/LoginForm'
import * as auth from 'firebase/auth'

jest.mock('firebase/auth')

describe('LoginForm Component', () => {
  beforeEach(() => {
    // Mock onAuthStateChanged to immediately resolve (no user logged in)
    (auth.onAuthStateChanged as jest.Mock).mockImplementation((_, callback) => {
      callback(null)
      return jest.fn()
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
  
  it('renders the login form heading', async () => {
    render(<LoginForm />)
    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Welcome Back')
    })
  })

  it('contains email and password inputs', async () => {
    render(<LoginForm />)
    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText('example@email.com')
      const passwordInput = screen.getByPlaceholderText('password123')
      expect(emailInput).toBeInTheDocument()
      expect(passwordInput).toBeInTheDocument()
    })
  })

  it('renders the Sign In button', async () => {
    render(<LoginForm />)
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /sign in/i })
      expect(button).toBeInTheDocument()
    })
  })

  it('switches to create account mode', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create one/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /create one/i }))

    expect(await screen.findByRole('heading', { level: 1, name: /create account/i })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /create account/i })).toBeInTheDocument()
  })
})
