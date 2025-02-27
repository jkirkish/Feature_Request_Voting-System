import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import FeatureList from "@/components/FeatureList"
import FeatureForm from "@/components/FeatureForm"

export default async function Home() {
  const session = await getServerSession(authOptions)
  
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

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Feature Requests</h1>
      {session && <FeatureForm />}
      <FeatureList features={features} isAdmin={session?.user.role === 'ADMIN'} />
    </main>
  )
} 