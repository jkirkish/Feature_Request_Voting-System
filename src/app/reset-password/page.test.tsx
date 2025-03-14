import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { useRouter, useSearchParams } from 'next/navigation'
import ResetPasswordPage from './page'
import axios from 'axios'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

describe('ResetPasswordPage', () => {
  const mockPush = jest.fn()
  const mockToken = 'valid-reset-token'

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush,
    }))
    ;(useSearchParams as jest.Mock).mockImplementation(() => ({
      get: jest.fn().mockReturnValue(mockToken),
    }))
  })

  it('renders reset password form', () => {
    render(<ResetPasswordPage />)
    
    expect(screen.getByText('Reset your password')).toBeInTheDocument()
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
  })

  it('displays password requirements', () => {
    render(<ResetPasswordPage />)
    
    expect(screen.getByText('Password Requirements:')).toBeInTheDocument()
    expect(screen.getByText('Minimum 8 characters long')).toBeInTheDocument()
    expect(screen.getByText('At least one uppercase letter (A-Z)')).toBeInTheDocument()
    expect(screen.getByText('At least one lowercase letter (a-z)')).toBeInTheDocument()
    expect(screen.getByText('At least one number (0-9)')).toBeInTheDocument()
    expect(screen.getByText('At least one special character')).toBeInTheDocument()
  })

  it('validates matching passwords', async () => {
    render(<ResetPasswordPage />)
    
    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      const errorDiv = screen.getByRole('alert')
      expect(errorDiv).toHaveTextContent('Passwords do not match')
    })
  })

  it('validates password requirements', async () => {
    render(<ResetPasswordPage />)
    
    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(passwordInput, { target: { value: 'weak' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'weak' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      const errorDiv = screen.getByRole('alert')
      expect(errorDiv).toHaveTextContent('Password must be at least 8 characters')
      expect(errorDiv).toHaveTextContent('Password must include uppercase letter')
      expect(errorDiv).toHaveTextContent('Password must include number')
      expect(errorDiv).toHaveTextContent('Password must include special character')
    })
  })

  it('handles successful password reset', async () => {
    render(<ResetPasswordPage />)
    
    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPass123!' } })

    const mockPost = jest.fn().mockResolvedValueOnce({ data: { message: 'Password reset successful' } })
    ;(axios.post as jest.Mock) = mockPost

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Password reset successful')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    }, { timeout: 2500 })
  })

  it('handles reset error', async () => {
    const errorMessage = 'Invalid or expired reset token'
    const mockPost = jest.fn().mockRejectedValueOnce({
      response: { data: { error: errorMessage } }
    })
    ;(axios.post as jest.Mock) = mockPost
    
    render(<ResetPasswordPage />)
    
    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPass123!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      const errorDiv = screen.getByRole('alert')
      expect(errorDiv).toHaveTextContent(errorMessage)
    })
  })

  it('handles missing token', async () => {
    ;(useSearchParams as jest.Mock).mockImplementation(() => ({
      get: jest.fn().mockReturnValue(null),
    }))
    
    render(<ResetPasswordPage />)
    
    const passwordInput = screen.getByLabelText(/new password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPass123!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      const errorDiv = screen.getByRole('alert')
      expect(errorDiv).toHaveTextContent('Invalid reset link')
    })
  })
}) 