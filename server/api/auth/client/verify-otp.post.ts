import { z } from 'zod'
import { db } from '~/server/db'
import { otpCodes, clients } from '~/server/db/schema'
import { createJWT, createClientSession } from '~/utils/auth'
import { eq, and, or, gt } from 'drizzle-orm'

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
        eq(otpCodes.userType, 'client'),
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

    // Find client
    const client = await db.select().from(clients).where(
      and(
        or(eq(clients.email, identifier), eq(clients.phone, identifier)),
        eq(clients.isActive, true)
      )
    ).limit(1)

    if (client.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Client not found',
      })
    }

    // Create session
    const session = createClientSession(client[0])
    const token = createJWT(session)

    // Set HTTP-only cookie
    setCookie(event, 'client-auth-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return {
      success: true,
      client: {
        id: client[0].id,
        name: client[0].name,
        therapistId: client[0].therapistId,
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