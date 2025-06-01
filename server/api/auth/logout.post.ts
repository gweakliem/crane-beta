export default defineEventHandler(async (event) => {
  // Clear authentication cookies
  setCookie(event, 'auth-token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0,
  })

  setCookie(event, 'client-auth-token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0,
  })

  return { success: true }
})