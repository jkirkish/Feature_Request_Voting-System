import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 10)

    // Create user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Error registering user' },
      { status: 500 }
    )
  }
} 