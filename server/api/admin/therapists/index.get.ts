import { db } from '~/server/db'
import { users, clients } from '~/server/db/schema'
import { eq, count } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Get all therapists with client counts
    const therapistsWithCounts = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        isActive: users.isActive,
        createdAt: users.createdAt,
        clientCount: count(clients.id),
      })
      .from(users)
      .leftJoin(clients, eq(users.id, clients.therapistId))
      .where(eq(users.role, 'therapist'))
      .groupBy(users.id, users.email, users.name, users.isActive, users.createdAt)
      .orderBy(users.createdAt)

    return therapistsWithCounts
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch therapists',
    })
  }
})