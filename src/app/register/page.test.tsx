import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { useRouter } from 'next/navigation'
import RegisterPage from './page'
import axios from 'axios'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('axios')

describe('RegisterPage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush,
    }))
  })

  it('renders registration form', () => {
    render(<RegisterPage />)
    
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<RegisterPage />)
    
    const submitButton = screen.getByRole('button', { name: /register/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      const errorMessages = screen.getAllByTestId('error-message')
      expect(errorMessages).toHaveLength(3)
      expect(errorMessages[0]).toHaveTextContent('Name is required')
      expect(errorMessages[1]).toHaveTextContent('Email is required')
      expect(errorMessages[2]).toHaveTextContent('Password is required')
    })
  })

  it('validates email format', async () => {
    render(<RegisterPage />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /register/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toHaveTextContent('Invalid email format')
    })
  })

  it('validates password requirements', async () => {
    render(<RegisterPage />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /register/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'weak' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      const errorMessages = screen.getAllByTestId('error-message')
      expect(errorMessages).toHaveLength(4)
      expect(errorMessages[0]).toHaveTextContent('Password must be at least 8 characters')
      expect(errorMessages[1]).toHaveTextContent('Password must include uppercase letter')
      expect(errorMessages[2]).toHaveTextContent('Password must include number')
      expect(errorMessages[3]).toHaveTextContent('Password must include special character')
    })
  })

  it('handles successful registration', async () => {
    const mockAxiosPost = jest.fn().mockResolvedValueOnce({})
    ;(axios.post as jest.Mock).mockImplementation(mockAxiosPost)

    render(<RegisterPage />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /register/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalledWith('/api/auth/register', {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'StrongPass123!'
      })
      expect(mockPush).toHaveBeenCalledWith('/login?message=Registration successful')
    })
  })

  it('handles registration error', async () => {
    const mockAxiosPost = jest.fn().mockRejectedValueOnce({
      response: { data: { error: 'Email already registered' } }
    })
    ;(axios.post as jest.Mock).mockImplementation(mockAxiosPost)

    render(<RegisterPage />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /register/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toHaveTextContent('Email already registered')
    })
  })

  it('navigates to login page', () => {
    render(<RegisterPage />)
    
    const loginLink = screen.getByText(/login here/i)
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.getAttribute('href')).toBe('/login')
  })
}) 