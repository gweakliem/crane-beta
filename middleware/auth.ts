export default defineNuxtRouteMiddleware(async (to) => {
  // Skip auth for public routes
  const publicRoutes = ['/', '/auth/admin', '/auth/therapist', '/auth/client']
  console.log(`Auth middleware: Checking route ${to.path}, public routes: ${publicRoutes}`)
  if (publicRoutes.includes(to.path)) {
    console.log('Auth middleware: Public route, skipping auth check')
    return
  }

  // Try to get the auth token from cookies in multiple ways to ensure we have it
  const authToken = useCookie('auth-token')
  const clientAuthToken = useCookie('client-auth-token')
  
  // Log cookie details
  console.log(`Auth middleware: Auth token from useCookie exists: ${!!authToken.value}`)
  if (authToken.value) {
    console.log(`Auth middleware: Auth token length: ${authToken.value.length}, first 20 chars: ${authToken.value.substring(0, 20)}...`)
  }
  
  // Try to read the cookie directly from the request headers if available
  const cookieHeader = useRequestHeaders(['cookie']).cookie
  console.log('Auth middleware: Cookie header:', cookieHeader)
  
  // If we don't have a token from useCookie but we have a cookie header, try to extract it
  if (!authToken.value && cookieHeader) {
    const match = cookieHeader.match(/auth-token=([^;]+)/)
    if (match) {
      console.log('Auth middleware: Found auth token in cookie header, value:', match[1].substring(0, 20) + '...')
      // Set the authToken.value manually
      authToken.value = match[1]
    } else {
      console.log('Auth middleware: No auth-token found in cookie header')
    }
  }
  
  // Log all cookies for debugging (only on client side)
  if (process.client) {
    console.log('Auth middleware: All cookies:', document.cookie || 'No cookies')
  } else {
    console.log('Auth middleware: Running on server side, document.cookie not available')
  }

  // Check for admin/therapist authentication
  if (to.path.startsWith('/admin') || to.path.startsWith('/therapist')) {
    console.log(`Auth middleware: Checking admin/therapist auth for ${to.path}`)
    if (!authToken.value) {
      console.log('Auth middleware: No auth token found, redirecting to login')
      // Redirect to appropriate login page based on route
      if (to.path.startsWith('/admin')) {
        return navigateTo('/auth/admin')
      } else {
        return navigateTo('/auth/therapist')
      }
    }

    // Verify token on server side to avoid browser compatibility issues
    try {
      console.log('Auth middleware: Verifying token with server')
      console.log('Auth middleware: Token value exists:', !!authToken.value)
      if (authToken.value) {
        console.log('Auth middleware: Token length:', authToken.value.length)
      }
      
      const response = await $fetch('/api/auth/verify-session', {
        method: 'POST',
        body: { token: authToken.value }
      })
      
      console.log('Auth middleware: Full verification response:', response)
      const { data: session } = response
      console.log('Auth middleware: Session data:', session)

      if (!session || !session.user) {
        console.log('Auth middleware: Invalid session or missing user data, clearing token')
        authToken.value = null
        return navigateTo('/auth/admin')
      }
      
      console.log('Auth middleware: Valid session found, user role:', session.user.role)

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
      // Redirect to appropriate login page based on route
      if (to.path.startsWith('/admin')) {
        return navigateTo('/auth/admin')
      } else {
        return navigateTo('/auth/therapist')
      }
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