import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoginPage from './page'

// Mock next-auth and next/navigation
const mockSignIn = signIn as jest.Mock
const mockRouter = useRouter as jest.Mock

describe('LoginPage', () => {
  const mockPush = jest.fn()
  const mockRefresh = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockRouter.mockImplementation(() => ({
      push: mockPush,
      refresh: mockRefresh,
    }))
  })

  it('renders login form', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('handles successful login', async () => {
    mockSignIn.mockResolvedValueOnce({ ok: true, error: null })
    
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
        callbackUrl: '/dashboard',
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('handles failed login', async () => {
    mockSignIn.mockResolvedValueOnce({ ok: false, error: 'Invalid credentials' })
    
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('handles login error', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Network error'))
    
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('An error occurred during login')).toBeInTheDocument()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('navigates to registration page', () => {
    render(<LoginPage />)
    
    const registerLink = screen.getByText(/register here/i)
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  it('navigates to forgot password page', () => {
    render(<LoginPage />)
    
    const forgotPasswordLink = screen.getByText(/forgot your password/i)
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
  })
}) 