import { GET, POST } from './route'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'

jest.mock('@/lib/prisma', () => ({
  feature: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  vote: {
    findMany: jest.fn(),
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

describe('Features API', () => {
  const mockRequest = (method: string, body?: any) =>
    new Request('http://localhost:3000/api/features', {
      method,
      body: body ? JSON.stringify(body) : undefined,
    })

  const mockSession = {
    user: {
      id: 1,
      email: 'test@example.com',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/features', () => {
    it('should return all features with vote counts', async () => {
      const mockFeatures = [
        { id: 1, title: 'Feature 1', description: 'Description 1', status: 'PENDING' },
        { id: 2, title: 'Feature 2', description: 'Description 2', status: 'IN_PROGRESS' },
      ]

      const mockVotes = [
        { featureId: 1, userId: 1 },
        { featureId: 1, userId: 2 },
        { featureId: 2, userId: 1 },
      ]

      ;(prisma.feature.findMany as jest.Mock).mockResolvedValue(mockFeatures)
      ;(prisma.vote.findMany as jest.Mock).mockResolvedValue(mockVotes)
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const response = await GET(mockRequest('GET'))
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        features: mockFeatures.map(feature => ({
          ...feature,
          votes: feature.id === 1 ? 2 : 1,
          hasVoted: true,
        })),
      })
    })

    it('should handle database errors gracefully', async () => {
      ;(prisma.feature.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const response = await GET(mockRequest('GET'))
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch features' })
    })
  })

  describe('POST /api/features', () => {
    it('should create a new feature when authenticated', async () => {
      const newFeature = {
        title: 'New Feature',
        description: 'Feature Description',
      }

      const createdFeature = {
        id: 1,
        ...newFeature,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
      ;(prisma.feature.create as jest.Mock).mockResolvedValue(createdFeature)

      const response = await POST(mockRequest('POST', newFeature))
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(createdFeature)
      expect(prisma.feature.create).toHaveBeenCalledWith({
        data: {
          ...newFeature,
          status: 'PENDING',
          userId: mockSession.user.id,
        },
      })
    })

    it('should return 401 when not authenticated', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const response = await POST(mockRequest('POST', {
        title: 'New Feature',
        description: 'Feature Description',
      }))
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Not authenticated' })
      expect(prisma.feature.create).not.toHaveBeenCalled()
    })

    it('should return 400 if required fields are missing', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const response = await POST(mockRequest('POST', {
        // missing title and description
      }))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Title and description are required' })
      expect(prisma.feature.create).not.toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
      ;(prisma.feature.create as jest.Mock).mockRejectedValue(new Error('Database error'))

      const response = await POST(mockRequest('POST', {
        title: 'New Feature',
        description: 'Feature Description',
      }))
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create feature' })
    })
  })
}) 