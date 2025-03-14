"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

type Feature = {
  id: string
  title: string
  description: string
  createdAt: string
  user: {
    name: string | null
    email: string | null
  }
  _count: {
    votes: number
  }
  hasVoted?: boolean
}

export default function FeatureListPage() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { data: session } = useSession()
  const [isVoting, setIsVoting] = useState<string | null>(null)

  useEffect(() => {
    fetchFeatures()
  }, [session]) // Refetch when session changes

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/features')
      if (!response.ok) {
        throw new Error('Failed to fetch features')
      }
      const data = await response.json()
      setFeatures(data)
    } catch (err) {
      setError('Failed to load feature requests')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVote = async (featureId: string) => {
    if (!session) {
      // Redirect to login if not authenticated
      window.location.href = '/login'
      return
    }

    setIsVoting(featureId)
    setError('') // Clear any previous errors
    
    try {
      const response = await fetch(`/api/features/${featureId}/vote`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to process vote')
      }

      // Update the local state optimistically
      setFeatures(prevFeatures => 
        prevFeatures.map(feature => {
          if (feature.id === featureId) {
            const hasVoted = !feature.hasVoted
            return {
              ...feature,
              hasVoted,
              _count: {
                ...feature._count,
                votes: hasVoted 
                  ? feature._count.votes + 1 
                  : feature._count.votes - 1
              }
            }
          }
          return feature
        })
      )
    } catch (err) {
      console.error('Voting error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process vote')
      // Refresh features to ensure correct state
      await fetchFeatures()
    } finally {
      setIsVoting(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="tropical-background min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-2xl text-white">Loading feature requests...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="tropical-background min-h-screen">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Feature Requests</h1>
          {session && (
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Submit New Feature
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6 transition-transform hover:scale-[1.01]"
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="text-sm text-gray-500">
                    Submitted by {feature.user.name || feature.user.email} on{' '}
                    {formatDate(feature.createdAt)}
                  </div>
                </div>
                <div className="flex flex-col items-center ml-6">
                  <button
                    onClick={() => handleVote(feature.id)}
                    disabled={isVoting === feature.id}
                    className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                      feature.hasVoted
                        ? 'bg-blue-100 text-blue-600'
                        : 'hover:bg-gray-100'
                    } ${!session ? 'cursor-pointer' : ''}`}
                    title={session ? (feature.hasVoted ? 'Remove vote' : 'Click to vote') : 'Login to vote'}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        feature.hasVoted ? 'text-blue-600' : 'text-gray-400'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="text-2xl font-bold mt-1">
                      {feature._count.votes}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isVoting === feature.id ? 'Processing...' : 'votes'}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {features.length === 0 && (
            <div className="text-center py-12 text-white">
              No feature requests have been submitted yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 