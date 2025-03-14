import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function PUT(request: Request, { params }: { params: { featureId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await request.json()
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updatedFeature = await prisma.feature.update({
      where: { id: params.featureId },
      data: { status },
    })

    return NextResponse.json(updatedFeature)
  } catch (error) {
    console.error('Error updating feature status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
} 