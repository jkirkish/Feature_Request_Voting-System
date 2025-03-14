import { POST } from './route'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}))

describe('POST /api/auth/register', () => {
  const mockRequest = (body: any) =>
    new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register a new user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
    }

    const hashedPassword = 'hashedPassword123'
    ;(hash as jest.Mock).mockResolvedValue(hashedPassword)
    ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockResolvedValue({
      id: 1,
      ...userData,
      password: hashedPassword,
    })

    const response = await POST(mockRequest(userData))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ message: 'User registered successfully' })
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: userData.email },
    })
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      },
    })
  })

  it('should return 400 if email already exists', async () => {
    const userData = {
      name: 'Test User',
      email: 'existing@example.com',
      password: 'Password123!',
    }

    ;(prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 1, email: userData.email })

    const response = await POST(mockRequest(userData))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Email already registered' })
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('should return 400 if required fields are missing', async () => {
    const response = await POST(mockRequest({
      name: 'Test User',
      // missing email and password
    }))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Name, email, and password are required' })
    expect(prisma.user.findFirst).not.toHaveBeenCalled()
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('should handle database errors gracefully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
    }

    ;(prisma.user.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'))

    const response = await POST(mockRequest(userData))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Error registering user' })
    expect(prisma.user.create).not.toHaveBeenCalled()
  })
}) 