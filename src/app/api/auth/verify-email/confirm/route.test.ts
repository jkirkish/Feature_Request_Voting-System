import { POST } from './route'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('Email Verification Route Handler', () => {
  const mockUser = {
    id: '1',
    verificationToken: 'validToken',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 400 if token is invalid', async () => {
    const request = new Request('http://localhost:3000/api/auth/verify-email/confirm', {
      method: 'POST',
      body: JSON.stringify({ token: 'invalidToken' }),
    })

    ;(prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null)

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Invalid verification token')
  })

  it('should successfully verify email with valid token', async () => {
    const request = new Request('http://localhost:3000/api/auth/verify-email/confirm', {
      method: 'POST',
      body: JSON.stringify({ token: mockUser.verificationToken }),
    })

    ;(prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(mockUser)
    ;(prisma.user.update as jest.Mock).mockResolvedValueOnce({ ...mockUser, emailVerified: true })

    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Email verified successfully')

    // Verify prisma calls
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        verificationToken: mockUser.verificationToken,
        verificationTokenExpiry: {
          gt: expect.any(Date),
        },
      },
    })

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      data: {
        emailVerified: expect.any(Date),
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    })
  })

  it('should handle errors gracefully', async () => {
    const request = new Request('http://localhost:3000/api/auth/verify-email/confirm', {
      method: 'POST',
      body: JSON.stringify({ token: mockUser.verificationToken }),
    })

    ;(prisma.user.findFirst as jest.Mock).mockRejectedValueOnce(new Error('Database error'))

    const response = await POST(request)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Error verifying email')
  })

  it('should handle invalid request body', async () => {
    const request = new Request('http://localhost:3000/api/auth/verify-email/confirm', {
      method: 'POST',
      body: 'invalid json',
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Error verifying email')
  })

  it('should handle missing token', async () => {
    const request = new Request('http://localhost:3000/api/auth/verify-email/confirm', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Invalid verification token')
  })
}) 