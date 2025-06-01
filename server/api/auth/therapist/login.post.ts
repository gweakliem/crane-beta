import { z } from 'zod'
import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { createJWT, createUserSession, verifyPassword } from '~/utils/auth'
import { eq, and } from 'drizzle-orm'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = schema.parse(body)

    // Find therapist user
    const user = await db.select().from(users).where(
      and(eq(users.email, email), eq(users.role, 'therapist'))
    ).limit(1)

    if (user.length === 0 || !user[0].passwordHash) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials',
      })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user[0].passwordHash)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials',
      })
    }

    // Check if user is active
    if (!user[0].isActive) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Account is deactivated',
      })
    }

    // Create session
    const session = createUserSession(user[0])
    const token = createJWT(session)

    // Set HTTP-only cookie
    setCookie(event, 'auth-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return {
      success: true,
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
        role: user[0].role,
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