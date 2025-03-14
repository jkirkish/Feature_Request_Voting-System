"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const passwordRequirements = [
    'Minimum 8 characters long',
    'At least one uppercase letter (A-Z)',
    'At least one lowercase letter (a-z)',
    'At least one number (0-9)',
    'At least one special character'
  ]

  const validatePassword = (password: string) => {
    const errors = []
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must include uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must include lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must include number')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must include special character')
    }
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!token) {
      setError('Invalid reset link')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const passwordErrors = validatePassword(password)
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('\n'))
      return
    }

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        password,
      })
      setMessage(response.data.message)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || 'Failed to reset password')
      } else {
        setError('An error occurred')
      }
    }
  }

  return (
    <div className="tropical-background min-h-screen">
      <nav className="bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">
                Feature Voting
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-blue-600 hover:text-blue-800">
                Login
              </Link>
              <Link href="/register" className="text-blue-600 hover:text-blue-800">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl space-y-6">
            <div>
              <h2 className="text-center text-3xl font-extrabold text-gray-900 border-b-2 border-blue-500 pb-2 mb-6">
                Reset your password
              </h2>
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50/90 backdrop-blur-sm p-4 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h3>
              <ul className="text-sm text-blue-700 list-disc list-inside">
                {passwordRequirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <div role="alert" className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {message}
                </div>
              )}
              {error && (
                <div role="alert" className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded whitespace-pre-line">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 