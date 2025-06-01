import { z } from 'zod'
import { verifyJWT, isSessionValid } from '~/utils/auth'
import type { AuthSession } from '~/types/auth'

const schema = z.object({
  token: z.string(),
  type: z.enum(['user', 'client']).optional().default('user'),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { token, type } = schema.parse(body)

    const session = verifyJWT(token) as AuthSession
    
    if (!session || !isSessionValid(session)) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired session',
      })
    }

    // Validate session structure based on type
    if (type === 'user' && !session.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid user session',
      })
    }

    if (type === 'client' && !session.client) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid client session',
      })
    }

    return {
      success: true,
      data: session,
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 401,
      statusMessage: 'Session verification failed',
    })
  }
})