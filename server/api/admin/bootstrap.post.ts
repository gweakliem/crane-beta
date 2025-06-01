import { z } from 'zod'
import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, name } = schema.parse(body)

    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(
      eq(users.email, email)
    ).limit(1)

    if (existingAdmin.length > 0) {
      return { success: true, message: 'Admin already exists' }
    }

    // Create admin user (no password - OTP only)
    const [newAdmin] = await db.insert(users).values({
      email,
      name,
      role: 'admin',
      passwordHash: null, // Admin uses OTP only
      isActive: true,
    }).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    })

    return { 
      success: true, 
      message: 'Admin user created successfully',
      admin: newAdmin
    }
  } catch (error) {
    console.error('Bootstrap error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create admin user',
    })
  }
})