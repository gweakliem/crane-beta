import { z } from 'zod'
import { db } from '~/server/db'
import { otpCodes, users } from '~/server/db/schema'
import { createJWT, createUserSession } from '~/utils/auth'
import { eq, and, gt } from 'drizzle-orm'

const schema = z.object({
  identifier: z.string().min(1),
  code: z.string().length(6),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { identifier, code } = schema.parse(body)

    // Find valid OTP
    const otpRecord = await db.select().from(otpCodes).where(
      and(
        eq(otpCodes.identifier, identifier),
        eq(otpCodes.code, code),
        eq(otpCodes.userType, 'therapist'),
        eq(otpCodes.isUsed, false),
        gt(otpCodes.expiresAt, new Date())
      )
    ).limit(1)

    if (otpRecord.length === 0) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired OTP',
      })
    }

    // Mark OTP as used
    await db.update(otpCodes)
      .set({ isUsed: true })
      .where(eq(otpCodes.id, otpRecord[0].id))

    // Find therapist user
    const therapistUser = await db.select().from(users).where(
      and(eq(users.email, identifier), eq(users.role, 'therapist'))
    ).limit(1)

    if (therapistUser.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Therapist not found',
      })
    }

    // Check if user is active
    if (!therapistUser[0].isActive) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Account is deactivated',
      })
    }

    // Create session
    const session = createUserSession(therapistUser[0])
    const token = createJWT(session)

    // Set HTTP-only cookie
    setCookie(event, 'auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return {
      success: true,
      user: {
        id: therapistUser[0].id,
        email: therapistUser[0].email,
        name: therapistUser[0].name,
        role: therapistUser[0].role,
      },
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request',
    })
  }
})