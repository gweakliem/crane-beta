export interface User {
  id: string
  email: string
  role: 'therapist' | 'admin'
  name: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  therapistId: string
  name: string
  email?: string
  phone?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AuthSession {
  user?: User
  client?: Client & { therapistId: string }
  expires: Date
}

export interface OTPRequest {
  identifier: string // email or phone
  type: 'sms' | 'email'
  userType: 'client' | 'admin'
}

export interface OTPVerification {
  identifier: string
  code: string
  userType: 'client' | 'admin'
}

export interface LoginCredentials {
  email: string
  password: string
}