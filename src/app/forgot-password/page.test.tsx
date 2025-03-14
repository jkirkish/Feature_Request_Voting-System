import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { useRouter } from 'next/navigation'
import ForgotPasswordPage from './page'
import axios from 'axios'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('axios')

describe('ForgotPasswordPage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush,
    }))
  })

  it('validates required email field', async () => {
    render(<ForgotPasswordPage />)
    
    const submitButton = screen.getByRole('button', { name: /send reset link/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toHaveTextContent('Email is required')
    })
  })

  it('validates email format', async () => {
    render(<ForgotPasswordPage />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toHaveTextContent('Invalid email format')
    })
  })

  it('handles successful reset link request', async () => {
    const successMessage = 'Password reset link sent successfully'
    const mockAxiosPost = jest.fn().mockResolvedValueOnce({
      data: { message: successMessage }
    })
    ;(axios.post as jest.Mock).mockImplementation(mockAxiosPost)

    render(<ForgotPasswordPage />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalledWith('/api/auth/forgot-password', {
        email: 'test@example.com',
      })
      expect(screen.getByText(successMessage)).toBeInTheDocument()
    })
  })

  it('handles reset link request error', async () => {
    const errorMessage = 'An error occurred. Please try again.'
    const mockAxiosPost = jest.fn().mockRejectedValueOnce({
      response: { data: { error: 'Email not found' } }
    })
    ;(axios.post as jest.Mock).mockImplementation(mockAxiosPost)

    render(<ForgotPasswordPage />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toHaveTextContent('An error occurred. Please try again.')
    })
  })

  it('navigates to login page', () => {
    render(<ForgotPasswordPage />)
    
    const loginLink = screen.getByText(/back to login/i)
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.getAttribute('href')).toBe('/login')
  })
}) 