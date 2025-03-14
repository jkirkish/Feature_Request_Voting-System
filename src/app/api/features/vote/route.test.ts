import { POST } from './route'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'

jest.mock('@/lib/prisma', () => ({
  vote: {
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

describe('POST /api/features/vote', () => {
  const mockRequest = (body: any) =>
    new Request('http://localhost:3000/api/features/vote', {
      method: 'POST',
      body: JSON.stringify(body),
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

  it('should create a new vote when user has not voted', async () => {
    const voteData = {
      featureId: 1,
    }

    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.vote.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.vote.create as jest.Mock).mockResolvedValue({
      id: 1,
      featureId: voteData.featureId,
      userId: mockSession.user.id,
    })

    const response = await POST(mockRequest(voteData))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ message: 'Vote recorded' })
    expect(prisma.vote.create).toHaveBeenCalledWith({
      data: {
        featureId: voteData.featureId,
        userId: mockSession.user.id,
      },
    })
  })

  it('should remove vote when user has already voted', async () => {
    const voteData = {
      featureId: 1,
    }

    const existingVote = {
      id: 1,
      featureId: voteData.featureId,
      userId: mockSession.user.id,
    }

    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.vote.findFirst as jest.Mock).mockResolvedValue(existingVote)
    ;(prisma.vote.delete as jest.Mock).mockResolvedValue(existingVote)

    const response = await POST(mockRequest(voteData))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ message: 'Vote removed' })
    expect(prisma.vote.delete).toHaveBeenCalledWith({
      where: {
        id: existingVote.id,
      },
    })
  })

  it('should return 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const response = await POST(mockRequest({ featureId: 1 }))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Not authenticated' })
    expect(prisma.vote.create).not.toHaveBeenCalled()
    expect(prisma.vote.delete).not.toHaveBeenCalled()
  })

  it('should return 400 if featureId is missing', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

    const response = await POST(mockRequest({}))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Feature ID is required' })
    expect(prisma.vote.create).not.toHaveBeenCalled()
    expect(prisma.vote.delete).not.toHaveBeenCalled()
  })

  it('should handle database errors gracefully', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.vote.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'))

    const response = await POST(mockRequest({ featureId: 1 }))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to process vote' })
    expect(prisma.vote.create).not.toHaveBeenCalled()
    expect(prisma.vote.delete).not.toHaveBeenCalled()
  })
}) 