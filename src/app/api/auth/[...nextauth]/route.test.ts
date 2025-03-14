import { GET, POST } from './route'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcrypt'
import { authOptions } from './auth'

describe('NextAuth Route Handler', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET handler', () => {
    it('should return 405 Method Not Allowed', async () => {
      const response = await GET(new Request('http://localhost:3000/api/auth'))
      expect(response.status).toBe(405)
    })
  })

  describe('POST handler', () => {
    it('should return 405 Method Not Allowed', async () => {
      const response = await POST(new Request('http://localhost:3000/api/auth'))
      expect(response.status).toBe(405)
    })
  })

  describe('authOptions', () => {
    it('should configure NextAuth with correct options', () => {
      expect(authOptions).toBeDefined()
      expect(authOptions.providers).toHaveLength(1)
      expect(authOptions.providers[0].name).toBe('credentials')
      expect(authOptions.session.strategy).toBe('jwt')
      expect(authOptions.pages.signIn).toBe('/login')
      expect(authOptions.pages.error).toBe('/login')
    })

    it('should handle successful authentication', async () => {
      // Mock prisma findUnique to return user
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      
      // Mock bcrypt compare to return true
      ;(compare as jest.Mock).mockResolvedValue(true)

      const credentials = {
        email: mockUser.email,
        password: 'correctPassword',
      }

      const result = await authOptions.providers[0].authorize(credentials)

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      })
    })

    it('should handle missing credentials', async () => {
      const result = await authOptions.providers[0].authorize({})
      expect(result).toBeNull()
    })

    it('should handle user not found', async () => {
      // Mock prisma findUnique to return null
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      }

      const result = await authOptions.providers[0].authorize(credentials)
      expect(result).toBeNull()
    })

    it('should handle invalid password', async () => {
      // Mock prisma findUnique to return user
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      
      // Mock bcrypt compare to return false
      ;(compare as jest.Mock).mockResolvedValue(false)

      const credentials = {
        email: mockUser.email,
        password: 'wrongPassword',
      }

      const result = await authOptions.providers[0].authorize(credentials)
      expect(result).toBeNull()
    })

    it('should handle database errors', async () => {
      // Mock prisma findUnique to throw error
      ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

      const credentials = {
        email: mockUser.email,
        password: 'password123',
      }

      const result = await authOptions.providers[0].authorize(credentials)
      expect(result).toBeNull()
    })

    it('should handle JWT callback', async () => {
      const token = {}
      const user = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      }

      const result = await authOptions.callbacks.jwt({ token, user })
      expect(result).toEqual({
        id: mockUser.id,
      })
    })

    it('should handle session callback', async () => {
      const session = {
        user: {},
      }
      const token = {
        id: mockUser.id,
      }

      const result = await authOptions.callbacks.session({ session, token })
      expect(result).toEqual({
        user: {
          id: mockUser.id,
        },
      })
    })
  })
}) 