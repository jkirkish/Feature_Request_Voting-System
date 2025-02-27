import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: { featureId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const { status } = json

    if (!status || !["PENDING", "PLANNED", "COMPLETED"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 })
    }

    const feature = await prisma.feature.update({
      where: {
        id: params.featureId,
      },
      data: {
        status,
      },
    })

    return NextResponse.json(feature)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 