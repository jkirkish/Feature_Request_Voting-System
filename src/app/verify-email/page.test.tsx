import { render, screen } from '@/test-utils'
import { useSearchParams, useRouter } from 'next/navigation'
import VerifyEmailPage from './page'

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('displays success message when provided', () => {
    ;(useSearchParams as jest.Mock).mockImplementation(() => ({
      get: jest.fn().mockReturnValue('Your email has been verified'),
    }))

    render(<VerifyEmailPage />)
    
    expect(screen.getByText('Your email has been verified')).toBeInTheDocument()
    expect(screen.getByText(/you can now close this window/i)).toBeInTheDocument()
  })

  it('displays error message when provided', () => {
    ;(useSearchParams as jest.Mock).mockImplementation(() => ({
      get: jest.fn().mockReturnValue('Invalid verification link'),
    }))

    render(<VerifyEmailPage />)
    
    expect(screen.getByText('Invalid verification link')).toBeInTheDocument()
    expect(screen.getByText(/you can now close this window/i)).toBeInTheDocument()
  })

  it('displays default message when no message provided', () => {
    ;(useSearchParams as jest.Mock).mockImplementation(() => ({
      get: jest.fn().mockReturnValue(null),
    }))

    render(<VerifyEmailPage />)
    
    expect(screen.getByText(/verifying your email/i)).toBeInTheDocument()
    expect(screen.getByText(/you can now close this window/i)).toBeInTheDocument()
  })
}) 