# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A mobile-responsive web application for therapists to manage worksheets for clients. Built with Next.js and TypeScript, deployed to Vercel.

## Architecture

### Tech Stack
- **Frontend**: Next.js with TypeScript
- **Database**: PostgreSQL with Neon (serverless, Vercel-optimized)
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Deployment**: Vercel
- **Authentication**: Custom OTP system (SMS/Email)
- **SMS**: Twilio for OTP delivery
- **Email**: Resend for OTP delivery and notifications

### Core User Flows
1. **Admin Flow**: OTP Login → Dashboard → Manage therapists → System oversight
2. **Therapist Flow**: Email/Password Login → Dashboard → Manage clients/worksheets → Review submissions
3. **Client Flow**: OTP Login → Dashboard → Complete worksheets → Submit

### Key Data Models
- **Users**: Therapists (email/password auth) and system admins (OTP auth)
- **Clients**: Therapist-owned records with phone/email for OTP authentication
- **Worksheet Templates**: Form definitions with prompts and response fields
- **Worksheet Instances**: Client-completed worksheets with therapist notes
- **OTP Codes**: Time-limited (5min) authentication codes for clients and admins

## Authentication Strategy
- **Therapists**: Standard email/password authentication
- **Admins**: OTP-based authentication via SMS or email (same system as clients)
- **Clients**: OTP-based authentication via SMS or email
- **Access Control**: Therapists can only access their own clients' data, Admins can manage therapists

## Features

### User Authentication
- Therapist authentication via email/password
- Admin authentication via OTP (SMS/email) with 5-minute expiration
- Client authentication via OTP (SMS/email) with 5-minute expiration
- Secure access control ensuring therapists only see their clients and admins can manage therapists

### Admin Dashboard
- Therapist management interface (add, edit, remove therapists)
- System overview and management

### Therapist Dashboard
- Client management interface
- Worksheet to-do list with review links
- Worksheet template management access

### Client Management
- CRUD operations for client records
- Worksheet assignment with automatic notifications
- Therapist-scoped access control

### Worksheet System
- Template creation and management
- Form-based worksheets with prompt/response sections
- Assignment workflow with notifications
- Review system with therapist notes
- PDF export functionality

### Client Experience
- Simple dashboard showing assigned worksheets
- Direct worksheet completion interface
- Deep-link support for direct worksheet access

## Development Guidelines

### File Organization
When implementing:
- Use Next.js App Router structure
- Separate components for therapist and client interfaces
- Shared components for common UI elements
- API routes for backend functionality

### Security Considerations
- Implement proper session management
- Validate therapist-client relationships on all operations
- Secure OTP generation and validation
- Input validation and sanitization

### Mobile Responsiveness
- Design mobile-first approach
- Ensure all forms work well on mobile devices
- Touch-friendly interface elements

## Important Instructions
- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary
- ALWAYS prefer editing existing files over creating new ones
- NEVER proactively create documentation files unless explicitly requested

