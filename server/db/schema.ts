import { pgTable, text, timestamp, uuid, varchar, boolean, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Users table - for therapists and admins
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'), // null for admin users (OTP only)
  role: varchar('role', { length: 20 }).notNull().default('therapist'), // 'therapist' | 'admin'
  name: varchar('name', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Clients table - managed by therapists
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  therapistId: uuid('therapist_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Worksheet templates
export const worksheetTemplates = pgTable('worksheet_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  prompts: jsonb('prompts').notNull(), // Array of prompt objects
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Worksheet instances - assigned to clients
export const worksheetInstances = pgTable('worksheet_instances', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').notNull().references(() => worksheetTemplates.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  therapistId: uuid('therapist_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  responses: jsonb('responses'), // Client responses to prompts
  therapistNotes: text('therapist_notes'),
  status: varchar('status', { length: 20 }).notNull().default('assigned'), // 'assigned' | 'in_progress' | 'completed' | 'reviewed'
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// OTP codes for authentication
export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: varchar('identifier', { length: 255 }).notNull(), // email or phone
  code: varchar('code', { length: 10 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'sms' | 'email'
  userType: varchar('user_type', { length: 20 }).notNull(), // 'client' | 'admin'
  expiresAt: timestamp('expires_at').notNull(),
  isUsed: boolean('is_used').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  worksheetInstances: many(worksheetInstances),
}))

export const clientsRelations = relations(clients, ({ one, many }) => ({
  therapist: one(users, {
    fields: [clients.therapistId],
    references: [users.id],
  }),
  worksheetInstances: many(worksheetInstances),
}))

export const worksheetTemplatesRelations = relations(worksheetTemplates, ({ many }) => ({
  instances: many(worksheetInstances),
}))

export const worksheetInstancesRelations = relations(worksheetInstances, ({ one }) => ({
  template: one(worksheetTemplates, {
    fields: [worksheetInstances.templateId],
    references: [worksheetTemplates.id],
  }),
  client: one(clients, {
    fields: [worksheetInstances.clientId],
    references: [clients.id],
  }),
  therapist: one(users, {
    fields: [worksheetInstances.therapistId],
    references: [users.id],
  }),
}))