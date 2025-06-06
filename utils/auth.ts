import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { User, Client, AuthSession } from '~/types/auth'

const config = useRuntimeConfig()

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function createJWT(payload: any): string {
  // Log the payload for debugging
  console.log('Creating JWT with payload:', JSON.stringify(payload, null, 2))
  
  // Ensure payload is a proper object with prototype
  const safePayload = payload === null || typeof payload !== 'object' ? {} : { ...payload };
  
  // Calculate expiration time from payload.expires if it exists
  let expiresIn: number | undefined = undefined;
  if (safePayload.expires) {
    try {
      const expiresDate = typeof safePayload.expires === 'string' 
        ? new Date(safePayload.expires) 
        : safePayload.expires;
      
      // Calculate seconds from now until expiration
      expiresIn = Math.floor((expiresDate.getTime() - Date.now()) / 1000);
      console.log(`JWT will expire in ${expiresIn} seconds`);
    } catch (error) {
      console.error('Error calculating JWT expiration:', error);
      // Default to 7 days if there's an error
      expiresIn = 7 * 24 * 60 * 60;
      console.log(`Using default expiration of ${expiresIn} seconds`);
    }
  }
  
  // Include expiration in JWT options to ensure proper validation
  return jwt.sign(safePayload, config.jwtSecret, { expiresIn: expiresIn || 7 * 24 * 60 * 60 });
}

export function verifyJWT(token: string): any {
  if (!token) {
    console.error('JWT verification failed: No token provided');
    return null;
  }
  
  try {
    console.log('Verifying JWT token (first 20 chars):', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Ensure the decoded value is a proper object
    if (decoded === null || typeof decoded !== 'object') {
      console.error('JWT verification returned non-object value:', decoded);
      return null;
    }
    
    // Create a safe object with proper prototype to avoid hasOwnProperty issues
    const safeDecoded = { ...decoded };
    
    console.log('JWT verification successful, decoded payload:', JSON.stringify(safeDecoded, null, 2));
    return safeDecoded;
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return null;
  }
}

export function createUserSession(user: User): AuthSession {
  return {
    user,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  }
}

export function createClientSession(client: Client & { therapistId: string }): AuthSession {
  return {
    client,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  }
}

export function isSessionValid(session: AuthSession): boolean {
  console.log('Checking session validity:')
  
  // Check if session is a valid object
  if (!session || typeof session !== 'object') {
    console.error('- Invalid session object:', session)
    return false
  }
  
  // Check if expires property exists
  if (!session.expires) {
    console.error('- Session missing expires property')
    return false
  }
  
  console.log('- Session expires:', session.expires)
  console.log('- Current time:', new Date().toISOString())
  
  try {
    // Convert expires to Date object if it's a string
    const expiresDate = typeof session.expires === 'string' 
      ? new Date(session.expires) 
      : session.expires
    
    // Check if expiresDate is a valid Date
    if (!(expiresDate instanceof Date) || isNaN(expiresDate.getTime())) {
      console.error('- Invalid expires date:', expiresDate)
      return false
    }
    
    const isValid = expiresDate > new Date()
    console.log('- Session valid:', isValid)
    
    return isValid
  } catch (error) {
    console.error('- Error validating session:', error)
    return false
  }
}