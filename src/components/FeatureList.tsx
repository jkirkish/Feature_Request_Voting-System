"use client"

import { Feature, FeatureStatus } from '@prisma/client'
import { useState } from 'react'

interface FeatureListProps {
  features: (Feature & {
    creator: {
      name: string | null
      email: string | null
    }
    _count: {
      votes: number
    }
  })[]
  isAdmin: boolean
}

export default function FeatureList({ features, isAdmin }: FeatureListProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleVote = async (featureId: string) => {
    setLoading(featureId)
    try {
      await fetch(`/api/features/${featureId}/vote`, {
        method: 'POST',
      })
      window.location.reload()
    } catch (error) {
      console.error('Error voting:', error)
    }
    setLoading(null)
  }

  const handleStatusChange = async (featureId: string, status: FeatureStatus) => {
    setLoading(featureId)
    try {
      await fetch(`/api/features/${featureId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      window.location.reload()
    } catch (error) {
      console.error('Error updating status:', error)
    }
    setLoading(null)
  }

  return (
    <div className="space-y-4">
      {features.map((feature) => (
        <div
          key={feature.id}
          className="border rounded-lg p-4 bg-white shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                Submitted by {feature.creator.name || feature.creator.email}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVote(feature.id)}
                disabled={loading === feature.id}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                ↑ {feature._count.votes}
              </button>
              {isAdmin && (
                <select
                  value={feature.status}
                  onChange={(e) =>
                    handleStatusChange(
                      feature.id,
                      e.target.value as FeatureStatus
                    )
                  }
                  disabled={loading === feature.id}
                  className="border rounded p-1"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PLANNED">Planned</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              )}
            </div>
          </div>
          <div className="mt-2">
            <span
              className={`text-sm px-2 py-1 rounded ${
                feature.status === 'COMPLETED'
                  ? 'bg-green-100 text-green-800'
                  : feature.status === 'PLANNED'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {feature.status.charAt(0) + feature.status.slice(1).toLowerCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
} 