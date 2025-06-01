export default defineNuxtRouteMiddleware(async (to) => {
  // Skip auth for public routes
  const publicRoutes = ['/', '/auth/admin', '/auth/therapist', '/auth/client']
  if (publicRoutes.includes(to.path)) {
    return
  }

  const authToken = useCookie('auth-token')
  const clientAuthToken = useCookie('client-auth-token')

  // Check for admin/therapist authentication
  if (to.path.startsWith('/admin') || to.path.startsWith('/therapist')) {
    if (!authToken.value) {
      return navigateTo('/auth/admin')
    }

    // Verify token on server side to avoid browser compatibility issues
    try {
      const { data: session } = await $fetch('/api/auth/verify-session', {
        method: 'POST',
        body: { token: authToken.value }
      })

      if (!session || !session.user) {
        authToken.value = null
        return navigateTo('/auth/admin')
      }

      // Role-based access control
      if (to.path.startsWith('/admin') && session.user.role !== 'admin') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access denied',
        })
      }

      if (to.path.startsWith('/therapist') && session.user.role !== 'therapist') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access denied',
        })
      }
    } catch (error) {
      authToken.value = null
      return navigateTo('/auth/admin')
    }
  }

  // Check for client authentication
  if (to.path.startsWith('/client')) {
    if (!clientAuthToken.value) {
      return navigateTo('/auth/client')
    }

    try {
      const { data: session } = await $fetch('/api/auth/verify-session', {
        method: 'POST',
        body: { token: clientAuthToken.value, type: 'client' }
      })

      if (!session || !session.client) {
        clientAuthToken.value = null
        return navigateTo('/auth/client')
      }
    } catch (error) {
      clientAuthToken.value = null
      return navigateTo('/auth/client')
    }
  }
})