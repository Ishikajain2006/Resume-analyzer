# Setup Guide

## Prerequisites

1. **Node.js** (v18+)
2. **PostgreSQL** database (can be local, Supabase, or any PostgreSQL provider)
3. **Clerk** account for authentication
4. **Supabase** account for file storage (optional - you can use local storage for testing)
5. **NVIDIA API key** or **OpenRouter API key** for AI features

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
DIRECT_URL=postgresql://username:password@localhost:5432/database_name

# Supabase (for file storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=resumes

# AI Provider (NVIDIA or OpenRouter)
NVIDIA_API_KEY=your_nvidia_or_openrouter_api_key
NVIDIA_BASE_URL=https://api.nvidia.com/v1  # or https://openrouter.ai/api/v1 for OpenRouter
NVIDIA_MODEL=nvidia/nemotron-3-super-120b-a12b
```

## Database Setup

### Option 1: Local PostgreSQL
1. Install PostgreSQL: https://www.postgresql.org/download/
2. Create a database: `createdb resume_analyzer`
3. Update DATABASE_URL in .env.local:
   ```
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/resume_analyzer
   ```

### Option 2: Supabase (Recommended)
1. Create a Supabase project: https://supabase.com/
2. Get your database connection string from Project Settings → Database
3. Update DATABASE_URL in .env.local

### Option 3: Other PostgreSQL Provider
Use your provider's connection string format.

## Installation & Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to: http://localhost:3000

## Important Notes

- The application uses server-side only API keys - none are exposed to the client
- All authentication is handled by Clerk
- File uploads are stored in Supabase Storage (configured via SUPABASE_* variables)
- AI features require a valid NVIDIA or OpenRouter API key
- For testing without AI, you can modify the AI services to return mock data (not recommended for production)

## Troubleshooting

**Database connection failed:**
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure username/password are correct
- Confirm database exists

**Clerk authentication issues:**
- Verify Clerk keys are correct
- Ensure localhost:3000 is added to authorized domains in Clerk dashboard

**Supabase storage issues:**
- Verify Supabase URL and service role key
- Ensure storage bucket exists and is public
- Check bucket name matches SUPABASE_STORAGE_BUCKET

**AI service errors:**
- Verify NVIDIA/OpenRouter API key is valid
- Check API key has sufficient credits/quota
- Ensure BASE_URL is correct for your provider