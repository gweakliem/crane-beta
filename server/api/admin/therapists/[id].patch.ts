import { z } from 'zod'
import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

const schema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const updates = schema.parse(body)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Therapist ID is required',
      })
    }

    // Update therapist
    const [updatedTherapist] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        isActive: users.isActive,
        updatedAt: users.updatedAt,
      })

    if (!updatedTherapist) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Therapist not found',
      })
    }

    return updatedTherapist
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