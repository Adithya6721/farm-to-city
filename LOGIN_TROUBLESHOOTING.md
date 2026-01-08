# Login Troubleshooting Guide

## Common Login Issues & Solutions

### Issue 1: Login Redirects but User Not Loaded

**Symptoms:**
- Login appears successful
- Redirects to dashboard
- Dashboard shows loading or redirects back to login

**Possible Causes:**
1. User profile doesn't exist in `users` table
2. Auth state updates before profile is fetched
3. RLS policies blocking profile fetch

**Solutions:**

#### Check if User Profile Exists
```sql
-- Run in Supabase SQL Editor
SELECT * FROM users WHERE email = 'your-email@example.com';
```

If no profile exists, the app will try to create one automatically, but you can also create it manually:
```sql
-- Get user ID from auth.users
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Create profile (replace USER_ID with actual ID)
INSERT INTO users (id, email, name, role)
VALUES ('USER_ID', 'your-email@example.com', 'Your Name', 'trader');
```

#### Verify RLS Policies
Ensure the RLS policy allows users to read their own profile:
```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- If missing, create policy
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
```

### Issue 2: "Invalid email or password" Error

**Possible Causes:**
1. User doesn't exist in Supabase Auth
2. Wrong password
3. Email not confirmed (if email confirmation is enabled)

**Solutions:**
1. **Check if user exists in Auth:**
   - Go to Supabase Dashboard > Authentication > Users
   - Verify user exists and email is confirmed

2. **Reset password:**
   - Use Supabase password reset flow
   - Or manually set password in Supabase Dashboard

3. **Disable email confirmation (for development):**
   - Go to Supabase Dashboard > Authentication > Settings
   - Disable "Enable email confirmations"

### Issue 3: TypeScript/Build Errors

**Solution:**
All TypeScript errors have been fixed. If you see errors:
```bash
npm run type-check
```

Common fixes:
- Ensure all imports are correct
- Check that environment variables are set
- Verify Supabase client is initialized

### Issue 4: Environment Variables Not Loading

**Symptoms:**
- "Missing env.NEXT_PUBLIC_SUPABASE_URL" error
- Supabase client fails to initialize

**Solution:**
1. Create `.env.local` file in root directory
2. Add variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
3. Restart development server:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### Issue 5: User Profile Creation Fails

**Symptoms:**
- Login succeeds but user profile is null
- Dashboard shows "No user logged in"

**Solution:**
The app now automatically creates a profile if it doesn't exist. If it still fails:

1. **Check RLS policies:**
   ```sql
   -- Allow users to insert their own profile
   CREATE POLICY "Users can insert own profile" ON users
     FOR INSERT WITH CHECK (auth.uid() = id);
   ```

2. **Manually create profile:**
   ```sql
   -- After login, get the user ID from browser console or Supabase
   INSERT INTO users (id, email, name, role)
   VALUES ('user-id-from-auth', 'email@example.com', 'Name', 'trader');
   ```

### Issue 6: Redirect Loop

**Symptoms:**
- Login → Dashboard → Login → Dashboard (loop)

**Possible Causes:**
1. User profile fetch fails
2. Protected route checks before user loads
3. Auth state not persisting

**Solution:**
The app now waits for user profile to load before redirecting. If issue persists:

1. Check browser console for errors
2. Verify Supabase connection
3. Check network tab for failed requests
4. Verify RLS policies allow profile read

## Debugging Steps

### 1. Check Browser Console
Open DevTools (F12) and check for:
- Errors in Console tab
- Failed network requests in Network tab
- Application state in React DevTools

### 2. Check Supabase Logs
- Go to Supabase Dashboard > Logs
- Check for authentication errors
- Check for database query errors

### 3. Verify Database Setup
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if user exists
SELECT * FROM users LIMIT 5;

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
```

### 4. Test Authentication Directly
```javascript
// In browser console on login page
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password123'
})
console.log('Auth result:', { data, error })
```

## Quick Fixes

### Reset Everything
1. Clear browser cache and localStorage
2. Restart development server
3. Verify `.env.local` exists and has correct values
4. Try logging in again

### Create Test User
```sql
-- In Supabase SQL Editor
-- First create auth user (use Supabase Dashboard > Authentication)
-- Then create profile:
INSERT INTO users (id, email, name, role, created_at)
VALUES (
  'user-id-from-auth-users',
  'test@example.com',
  'Test User',
  'trader',
  NOW()
);
```

## Still Having Issues?

1. **Check the logs:**
   - Browser console
   - Supabase logs
   - Terminal output

2. **Verify setup:**
   - Environment variables are set
   - Database schema is applied
   - RLS policies are correct

3. **Test with a fresh user:**
   - Sign up a new account
   - Try logging in with that account

---

**Last Updated**: After fixing all TypeScript errors and improving login flow

