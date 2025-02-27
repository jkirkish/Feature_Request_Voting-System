import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { featureId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const existingVote = await prisma.featureVote.findUnique({
      where: {
        featureId_userId: {
          featureId: params.featureId,
          userId: session.user.id,
        },
      },
    })

    if (existingVote) {
      await prisma.featureVote.delete({
        where: {
          id: existingVote.id,
        },
      })
      return NextResponse.json({ message: "Vote removed" })
    }

    const vote = await prisma.featureVote.create({
      data: {
        featureId: params.featureId,
        userId: session.user.id,
      },
    })

    return NextResponse.json(vote)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 