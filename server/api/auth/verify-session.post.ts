import { z } from 'zod'
import { verifyJWT, isSessionValid } from '~/utils/auth'
import type { AuthSession } from '~/types/auth'

const schema = z.object({
  token: z.string(),
  type: z.enum(['user', 'client']).optional().default('user'),
})

export default defineEventHandler(async (event) => {
  try {
    console.log('verify-session: Received verification request')
    const body = await readBody(event)
    console.log('verify-session: Request body:', body)
    const { token, type } = schema.parse(body)
    console.log(`verify-session: Token received (first 20 chars): ${token.substring(0, 20)}..., type: ${type}`)

    // Verify the JWT token
    const session = verifyJWT(token) as AuthSession
    console.log('verify-session: JWT verification result:', session ? 'valid token' : 'invalid token')
    
    if (!session) {
      console.log('verify-session: Token could not be verified')
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token',
      })
    }
    
    // Ensure session has the expected structure
    if (typeof session !== 'object') {
      console.error('verify-session: Session is not an object:', typeof session)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid session format',
      })
    }
    
    // Check if the session is valid (not expired)
    const isValid = isSessionValid(session)
    console.log('verify-session: Session validity check result:', isValid)
    
    if (!isValid) {
      console.log('verify-session: Session is expired')
      throw createError({
        statusCode: 401,
        statusMessage: 'Expired session',
      })
    }
    
    console.log('verify-session: Session is valid, expires:', session.expires)
    console.log('verify-session: Session user data exists:', !!session.user)
    if (session.user) {
      console.log('verify-session: User role:', session.user.role)
    }

    // Validate session structure based on type
    if (type === 'user' && !session.user) {
      console.log('verify-session: Missing user data in session')
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid user session',
      })
    }

    if (type === 'client' && !session.client) {
      console.log('verify-session: Missing client data in session')
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid client session',
      })
    }

    console.log('verify-session: Verification successful')
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