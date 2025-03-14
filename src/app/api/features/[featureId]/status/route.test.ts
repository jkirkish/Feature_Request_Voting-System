import { PUT } from './route'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'

jest.mock('@/lib/prisma', () => ({
  feature: {
    update: jest.fn(),
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

describe('PUT /api/features/[featureId]/status', () => {
  const mockRequest = (featureId: number, body: any) =>
    new Request(`http://localhost:3000/api/features/${featureId}/status`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })

  const mockSession = {
    user: {
      id: 1,
      email: 'test@example.com',
      role: 'ADMIN',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update feature status when user is admin', async () => {
    const featureId = 1
    const newStatus = 'IN_PROGRESS'

    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.feature.update as jest.Mock).mockResolvedValue({
      id: featureId,
      status: newStatus,
    })

    const response = await PUT(mockRequest(featureId, { status: newStatus }), {
      params: { featureId: featureId.toString() },
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ message: 'Status updated successfully' })
    expect(prisma.feature.update).toHaveBeenCalledWith({
      where: { id: featureId },
      data: { status: newStatus },
    })
  })

  it('should return 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const response = await PUT(mockRequest(1, { status: 'IN_PROGRESS' }), {
      params: { featureId: '1' },
    })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Not authenticated' })
    expect(prisma.feature.update).not.toHaveBeenCalled()
  })

  it('should return 403 when user is not admin', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { ...mockSession.user, role: 'USER' },
    })

    const response = await PUT(mockRequest(1, { status: 'IN_PROGRESS' }), {
      params: { featureId: '1' },
    })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toEqual({ error: 'Not authorized' })
    expect(prisma.feature.update).not.toHaveBeenCalled()
  })

  it('should return 400 if status is missing', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

    const response = await PUT(mockRequest(1, {}), {
      params: { featureId: '1' },
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Status is required' })
    expect(prisma.feature.update).not.toHaveBeenCalled()
  })

  it('should return 400 if status is invalid', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

    const response = await PUT(mockRequest(1, { status: 'INVALID_STATUS' }), {
      params: { featureId: '1' },
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Invalid status' })
    expect(prisma.feature.update).not.toHaveBeenCalled()
  })

  it('should handle database errors gracefully', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.feature.update as jest.Mock).mockRejectedValue(new Error('Database error'))

    const response = await PUT(mockRequest(1, { status: 'IN_PROGRESS' }), {
      params: { featureId: '1' },
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to update status' })
  })
}) 