'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {message || 'Verifying your email...'}
          </h2>
          <p className="mt-2 text-gray-600">
            You can now close this window.
          </p>
        </div>
      </div>
    </div>
  )
} 