import { POST } from './route'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}))

describe('Reset Password Route Handler', () => {
  const mockUser = {
    id: '1',
    resetToken: 'validToken',
    resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle missing token or password', async () => {
    const request = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Token and password are required')
  })

  it('should successfully reset password with valid token', async () => {
    const request = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: mockUser.resetToken,
        password: 'newPassword123!',
      }),
    })

    ;(prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(mockUser)
    ;(prisma.user.update as jest.Mock).mockResolvedValueOnce({ ...mockUser, password: 'hashedPassword' })
    ;(hash as jest.Mock).mockResolvedValueOnce('hashedPassword')

    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Password reset successful')

    // Verify password was hashed
    expect(hash).toHaveBeenCalledWith('newPassword123!', 12)

    // Verify user was updated
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      data: {
        password: 'hashedPassword',
        resetToken: null,
        resetTokenExpiry: null,
      },
    })
  })

  it('should handle expired reset token', async () => {
    const expiredUser = {
      ...mockUser,
      resetTokenExpiry: new Date(Date.now() - 3600000), // 1 hour ago
    }

    const request = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: expiredUser.resetToken,
        password: 'newPassword123!',
      }),
    })

    ;(prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null)

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Invalid or expired reset token')
  })
}) 