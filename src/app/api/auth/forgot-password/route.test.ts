import { POST } from './route'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import { NextResponse } from 'next/server'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

const mockSendMail = jest.fn().mockResolvedValue(true)
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}))

describe('Forgot Password Route Handler', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    resetToken: null,
    resetTokenExpiry: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.EMAIL_FROM = 'noreply@example.com'
  })

  it('should return 404 if user is not found', async () => {
    // Mock prisma findUnique to return null
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const response = await POST(new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@example.com' }),
    }))

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.error).toBe('No account found with this email')
  })

  it('should send reset email and update user with reset token', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser)
    ;(prisma.user.update as jest.Mock).mockResolvedValueOnce({
      ...mockUser,
      resetToken: 'valid-token',
      resetTokenExpiry: new Date(),
    })

    const request = new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: mockUser.email }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Password reset email sent')

    // Verify email was sent
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: process.env.EMAIL_FROM,
        to: mockUser.email,
        subject: 'Reset Your Password',
      })
    )
  })

  it('should handle errors gracefully', async () => {
    // Mock prisma findUnique to throw an error
    ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

    const response = await POST(new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: mockUser.email }),
    }))

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Error processing request')
  })

  it('should handle invalid request body', async () => {
    const response = await POST(new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: 'invalid json',
    }))

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Error processing request')
  })

  it('should handle missing email in request body', async () => {
    const request = new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Email is required')
  })

  it('should handle email sending failure', async () => {
    // Mock prisma findUnique to return a user
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    
    // Mock prisma update
    ;(prisma.user.update as jest.Mock).mockResolvedValue({
      ...mockUser,
      resetToken: expect.any(String),
      resetTokenExpiry: expect.any(Date),
    })

    // Mock nodemailer to throw an error
    const mockTransporter = {
      sendMail: jest.fn().mockRejectedValue(new Error('Email sending failed')),
    }
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter)

    const response = await POST(new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: mockUser.email }),
    }))

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Error processing request')
  })
}) 