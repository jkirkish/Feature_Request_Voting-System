import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Update user with verification token
    await prisma.user.update({
      where: { email },
      data: {
        verificationToken,
      },
    })

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    // Send verification email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}">
          Verify Email
        </a>
        <p>If you didn't create an account, please ignore this email.</p>
      `,
    })

    return NextResponse.json(
      { message: 'Verification email sent' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Error sending verification email' },
      { status: 500 }
    )
  }
} 