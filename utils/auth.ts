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
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' })
}

export function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, config.jwtSecret)
  } catch {
    return null
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
  return session.expires > new Date()
}