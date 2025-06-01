import { z } from 'zod'
import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { hashPassword } from '~/utils/auth'
import { eq } from 'drizzle-orm'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, email, password } = schema.parse(body)

    // Check if email already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existingUser.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email already exists',
      })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create therapist
    const [newTherapist] = await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: 'therapist',
    }).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })

    return newTherapist
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