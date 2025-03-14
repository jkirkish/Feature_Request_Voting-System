import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { featureId } = await request.json()
    if (!featureId) {
      return NextResponse.json({ error: 'Feature ID is required' }, { status: 400 })
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        featureId,
        userId: session.user.id,
      },
    })

    if (existingVote) {
      await prisma.vote.delete({
        where: {
          id: existingVote.id,
        },
      })
      return NextResponse.json({ message: 'Vote removed' }, { status: 200 })
    }

    await prisma.vote.create({
      data: {
        featureId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: 'Vote recorded' }, { status: 200 })
  } catch (error) {
    console.error('Error processing vote:', error)
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 })
  }
} 