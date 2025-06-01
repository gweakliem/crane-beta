import { z } from 'zod'
import { db } from '~/server/db'
import { otpCodes, users } from '~/server/db/schema'
import { generateOTP, sendOTPEmail, sendOTPSMS } from '~/utils/notifications'
import { eq, and, gt } from 'drizzle-orm'

const schema = z.object({
  identifier: z.string().min(1),
  type: z.enum(['email', 'sms']),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { identifier, type } = schema.parse(body)

    // Check if this is a valid admin identifier
    if (type === 'email') {
      const user = await db.select().from(users).where(
        and(eq(users.email, identifier), eq(users.role, 'admin'))
      ).limit(1)

      if (user.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Admin not found',
        })
      }
    }

    // Generate OTP
    const code = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Save OTP to database
    await db.insert(otpCodes).values({
      identifier,
      code,
      type,
      userType: 'admin',
      expiresAt,
    })

    // Send OTP
    let sent = false
    if (type === 'email') {
      sent = await sendOTPEmail(identifier, code, 'admin')
    } else {
      sent = await sendOTPSMS(identifier, code)
    }

    if (!sent) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to send OTP',
      })
    }

    return { success: true }
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