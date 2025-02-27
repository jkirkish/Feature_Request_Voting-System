import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const { title, description } = json

    if (!title || !description) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const feature = await prisma.feature.create({
      data: {
        title,
        description,
        creatorId: session.user.id,
      },
    })

    return NextResponse.json(feature)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET() {
  try {
    const features = await prisma.feature.findMany({
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
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

    return NextResponse.json(features)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 