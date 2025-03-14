import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: body.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Save reset token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    // Send reset email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Reset Your Password',
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password. This link will expire in 24 hours.</p>
        <a href="${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    })

    return NextResponse.json(
      { message: 'Password reset email sent' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    )
  }
} 