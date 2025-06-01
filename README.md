# Crane Beta

A mobile-responsive web application for therapists to manage worksheets for clients. Built with Nuxt.js and TypeScript, deployed to Vercel.

## Tech Stack

- **Frontend**: Nuxt.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom OTP system (SMS/Email) + Email/Password
- **Styling**: TailwindCSS
- **Deployment**: Vercel
- **Services**: Twilio (SMS), Resend (Email)

## Initial Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start PostgreSQL Database
```bash
# Start PostgreSQL in Docker container
npm run db:up

# Generate database schema
npm run db:generate

# Run migrations to create tables
npm run db:migrate
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and update with your credentials:

```bash
# Database (default works with Docker setup)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crane_beta_dev"

# JWT Secret (change in production)
JWT_SECRET="dev-jwt-secret-key-change-in-production"

# Twilio (for SMS OTP) - Get from twilio.com
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token" 
TWILIO_PHONE_NUMBER="your-twilio-phone-number"

# Resend (for Email OTP) - Get from resend.com
RESEND_API_KEY="your-resend-api-key"
```

### 5. Start Development Server

```bash
npm run dev
```

One time setup, to create the admin user:
```bash
# Create the initial admin user (requires dev server to be running)
node scripts/create-admin.js admin@example.com "System Admin"

# Or with just email (name defaults to "System Admin")
node scripts/create-admin.js your-email@example.com
```


Visit `http://localhost:3000` and login with:
- **Admin**: `admin@example.com` (OTP via email)
- **Therapist**: Create via admin dashboard
- **Client**: Create via therapist dashboard

## Development Commands

```bash
# Database management
npm run db:up          # Start PostgreSQL container
npm run db:down        # Stop database
npm run db:reset       # Reset database (delete all data)
npm run db:studio      # Open Drizzle Studio (database UI)

# Development
npm run dev            # Start dev server
npm run build          # Build for production
npm run lint           # Run ESLint
npm run typecheck      # Run TypeScript checks
```

## User Flows

- **Admin Flow**: OTP Login → Dashboard → Manage therapists → System oversight
- **Therapist Flow**: Email/Password Login → Dashboard → Manage clients/worksheets → Review submissions  
- **Client Flow**: OTP Login → Dashboard → Complete worksheets → Submit
