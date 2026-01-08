# Environment Variables Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
# Get these from your Supabase project settings: https://app.supabase.com/project/_/settings/api

# Your Supabase project URL
# Example: https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here

# Your Supabase anonymous/public key (safe to expose in client-side code)
# This key is used for client-side operations and is restricted by Row Level Security (RLS)
# Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Your Supabase service role key (KEEP THIS SECRET - server-side only!)
# This key bypasses RLS and should NEVER be exposed in client-side code
# Only use this for admin operations or server-side functions
# Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Optional: Only needed if you're using server-side admin operations
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## Setup Instructions

1. **Copy the template:**
   ```bash
   cp ENV_SETUP.md .env.local
   ```

2. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the Project URL and anon/public key
   - Copy the service_role key (keep this secret!)

3. **Fill in `.env.local`:**
   - Replace `your_supabase_project_url_here` with your actual URL
   - Replace `your_supabase_anon_key_here` with your actual anon key
   - Replace `your_supabase_service_role_key_here` with your service role key (optional)

4. **Verify the setup:**
   - The `.env.local` file is already in `.gitignore` and won't be committed
   - Restart your development server after creating/updating `.env.local`

## Security Notes

- ✅ `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe to expose in client-side code
- ❌ `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed in client-side code
- The anon key is protected by Row Level Security (RLS) policies in your database
- Always use the anon key for client-side operations
- Only use the service role key for server-side admin operations

