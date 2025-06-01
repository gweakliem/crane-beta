import { db } from '~/server/db'
import { users, clients, worksheetInstances } from '~/server/db/schema'
import { eq, count, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Get total therapists
    const [{ count: totalTherapists }] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'therapist'))

    // Get active clients
    const [{ count: activeClients }] = await db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.isActive, true))

    // Get pending worksheets
    const [{ count: pendingWorksheets }] = await db
      .select({ count: count() })
      .from(worksheetInstances)
      .where(
        and(
          eq(worksheetInstances.status, 'assigned'),
        )
      )

    return {
      totalTherapists,
      activeClients,
      pendingWorksheets,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch statistics',
    })
  }
})