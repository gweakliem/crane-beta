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
    
    console.log('Admin OTP verification attempt:', { identifier, code })

    // Find valid OTP
    const otpRecord = await db.select().from(otpCodes).where(
      and(
        eq(otpCodes.identifier, identifier),
        eq(otpCodes.code, code),
        eq(otpCodes.userType, 'admin'),
        eq(otpCodes.isUsed, false),
        gt(otpCodes.expiresAt, new Date())
      )
    ).limit(1)

    if (otpRecord.length === 0) {
      console.log('OTP verification failed: Invalid or expired OTP')
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired OTP',
      })
    }
    
    console.log('Valid OTP found:', otpRecord[0].id)

    // Mark OTP as used
    await db.update(otpCodes)
      .set({ isUsed: true })
      .where(eq(otpCodes.id, otpRecord[0].id))

    // Find admin user
    const adminUser = await db.select().from(users).where(
      and(eq(users.email, identifier), eq(users.role, 'admin'))
    ).limit(1)

    if (adminUser.length === 0) {
      console.log('Admin user not found for:', identifier)
      throw createError({
        statusCode: 404,
        statusMessage: 'Admin not found',
      })
    }
    
    console.log('Admin user found:', adminUser[0].id)

    // Create session
    const session = createUserSession(adminUser[0])
    const token = createJWT(session)

    // Set HTTP-only cookie
    setCookie(event, 'auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })
    
    console.log('Cookie set successfully, returning success response')

    return {
      success: true,
      user: {
        id: adminUser[0].id,
        email: adminUser[0].email,
        name: adminUser[0].name,
        role: adminUser[0].role,
      },
    }
  } catch (error) {
    console.error('Admin OTP verification error:', error)
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request',
    })
  }
})