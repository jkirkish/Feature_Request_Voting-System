"use client"

import { useState } from 'react'
import Link from 'next/link'
import axios from 'axios'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState('')

  const validateForm = () => {
    const newErrors: string[] = []
    
    if (!email) newErrors.push('Email is required')
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.push('Invalid email format')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      const response = await axios.post('/api/auth/forgot-password', { email })
      setSuccessMessage(response.data.message)
      setErrors([])
    } catch (error: any) {
      setErrors(['An error occurred. Please try again.'])
      setSuccessMessage('')
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
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div>
              <h2 className="text-center text-3xl font-extrabold text-gray-900 border-b-2 border-blue-500 pb-2 mb-8">
                Reset your password
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.length > 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                  {errors.map((error, index) => (
                    <div key={index} data-testid="error-message">{error}</div>
                  ))}
                </div>
              )}
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
                  <div data-testid="success-message">{successMessage}</div>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send reset link
              </button>
              
              <div className="text-center text-sm">
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Back to login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 