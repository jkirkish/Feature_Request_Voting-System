import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { title, description } = await req.json()

    // Validate input
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      )
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: "Title must be less than 100 characters" },
        { status: 400 }
      )
    }

    if (description.length > 500) {
      return NextResponse.json(
        { error: "Description must be less than 500 characters" },
        { status: 400 }
      )
    }

    const feature = await prisma.feature.create({
      data: {
        title,
        description,
        userId: session.user.id
      }
    })

    return NextResponse.json(feature, { status: 201 })
  } catch (error) {
    console.error("Feature creation error:", error)
    return NextResponse.json(
      { error: "Error creating feature" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const features = await prisma.feature.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        votes: userId ? {
          where: {
            userId: userId
          }
        } : false,
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: {
        votes: {
          _count: 'desc',
        },
      },
    })

    // Add hasVoted flag for the current user
    const featuresWithVoteStatus = features.map(feature => ({
      ...feature,
      hasVoted: feature.votes?.length > 0,
      votes: undefined, // Remove votes array from response
    }))

    return NextResponse.json(featuresWithVoteStatus)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 