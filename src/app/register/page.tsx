"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { signIn } from 'next-auth/react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setUser, setLoading, setError } from '@/store/slices/userSlice'

export default function RegisterPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector((state) => state.user)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const validateForm = () => {
    const newErrors: string[] = []
    if (!name) {
      newErrors.push('Name is required')
    }
    if (!email) {
      newErrors.push('Email is required')
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.push('Please enter a valid email address')
    }
    if (!password) {
      newErrors.push('Password is required')
    } else if (password.length < 8) {
      newErrors.push('Password must be at least 8 characters long')
    }
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    dispatch(setLoading(true))
    dispatch(setError(null))
    setErrors([])

    try {
      // Register the user
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
      })

      if (response.data.message === 'User registered successfully') {
        // Sign in the user after successful registration
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setErrors([result.error])
          dispatch(setError(result.error))
        } else if (result?.ok) {
          // Get the user data from the session
          const sessionResponse = await fetch('/api/auth/session')
          const session = await sessionResponse.json()
          
          if (session?.user) {
            dispatch(setUser(session.user))
            router.push('/features')
          }
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to register'
      setErrors([errorMessage])
      dispatch(setError(errorMessage))
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-tropical-beach bg-cover bg-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

          </div>

          {errors.length > 0 && (
            <div className="text-red-500 text-sm" data-testid="error-message">
              {errors[0]}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
