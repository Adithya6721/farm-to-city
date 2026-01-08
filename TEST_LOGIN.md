# Testing Login - Step by Step Guide

## ✅ Build Status
- ✅ TypeScript compilation: **PASSED**
- ✅ Build: **SUCCESSFUL**
- ✅ All routes compiled successfully

## 🔍 Testing Login Flow

### Step 1: Verify Environment Setup

1. **Check `.env.local` exists:**
   ```bash
   # Should be in root directory
   ls .env.local  # or dir .env.local on Windows
   ```

2. **Verify variables are set:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Step 2: Start Development Server

```bash
npm run dev
```

### Step 3: Test Login

#### Option A: Use Existing User

1. **Check if user exists in Supabase:**
   - Go to Supabase Dashboard > Authentication > Users
   - Verify user email exists
   - Check if email is confirmed

2. **Check if profile exists:**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM users WHERE email = 'your-email@example.com';
   ```

3. **If profile doesn't exist, create it:**
   ```sql
   -- Get user ID from auth.users
   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
   
   -- Create profile (replace USER_ID with actual ID)
   INSERT INTO users (id, email, name, role, created_at)
   VALUES (
     'USER_ID_FROM_AUTH',
     'your-email@example.com',
     'Your Name',
     'trader',  -- or 'farmer' or 'shopkeeper'
     NOW()
   );
   ```

#### Option B: Create New User

1. **Go to signup page:**
   - Navigate to `http://localhost:3000/auth/signup`
   - Fill in the form
   - Select a role
   - Submit

2. **Check Supabase:**
   - Verify user was created in Authentication > Users
   - Verify profile was created in users table

3. **Try logging in:**
   - Go to `http://localhost:3000/auth/login`
   - Enter email and password
   - Click "Sign In"

### Step 4: Debug Login Issues

#### Check Browser Console

Open DevTools (F12) and look for:
- ✅ No errors in Console tab
- ✅ Network requests succeed (200 status)
- ✅ Check for any Supabase errors

#### Common Issues & Fixes

**Issue: "Invalid email or password"**
- ✅ User doesn't exist → Create user via signup
- ✅ Wrong password → Reset password in Supabase
- ✅ Email not confirmed → Disable email confirmation in Supabase settings

**Issue: Login succeeds but redirects back to login**
- ✅ Profile doesn't exist → Create profile (see SQL above)
- ✅ RLS policy blocking → Check RLS policies
- ✅ Auth state not updating → Check browser console

**Issue: "Missing environment variables"**
- ✅ `.env.local` not created → Create it
- ✅ Variables not set → Add them
- ✅ Server not restarted → Restart `npm run dev`

### Step 5: Verify Login Success

After successful login, you should:
1. ✅ See "Welcome back!" toast message
2. ✅ Be redirected to `/dashboard`
3. ✅ See your role-specific dashboard
4. ✅ See your name in the navbar
5. ✅ Be able to navigate to other pages

### Step 6: Test Protected Routes

1. **Try accessing dashboard without login:**
   - Log out
   - Go to `http://localhost:3000/dashboard`
   - Should redirect to `/auth/login`

2. **Test role-based access:**
   - Login as farmer → Should see farmer dashboard
   - Login as trader → Should see trader dashboard
   - Login as shopkeeper → Should see shopkeeper dashboard

## 🔧 Quick Fixes

### Fix 1: Create Missing User Profile

If login works but user is null, run this in Supabase SQL Editor:

```sql
-- Get auth user ID
DO $$
DECLARE
  auth_user_id UUID;
  auth_user_email TEXT;
BEGIN
  -- Replace with your actual email
  SELECT id, email INTO auth_user_id, auth_user_email
  FROM auth.users
  WHERE email = 'your-email@example.com'
  LIMIT 1;
  
  -- Create profile if it doesn't exist
  INSERT INTO users (id, email, name, role, created_at)
  VALUES (
    auth_user_id,
    auth_user_email,
    SPLIT_PART(auth_user_email, '@', 1),
    'trader',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
END $$;
```

### Fix 2: Verify RLS Policies

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- If missing, create policies
CREATE POLICY "Users can view all profiles" ON users 
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users 
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Fix 3: Test Direct Supabase Connection

Open browser console on login page and run:

```javascript
// Test Supabase connection
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'your-email@example.com',
  password: 'your-password'
})
console.log('Login test:', { data, error })

// Check session
const { data: session } = await supabase.auth.getSession()
console.log('Session:', session)

// Check user profile
if (session?.user) {
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()
  console.log('Profile:', { profile, profileError })
}
```

## 📋 Expected Behavior

### Successful Login Flow:
1. User enters email/password
2. Click "Sign In" → Button shows "Signing in..."
3. Toast appears: "Welcome back!"
4. Redirects to `/dashboard`
5. Dashboard loads with user's role-specific view
6. Navbar shows user's name and role

### If Something Goes Wrong:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Check Supabase logs
4. Verify environment variables
5. Verify database setup

## 🎯 Next Steps After Login Works

1. ✅ Test creating a product (farmer)
2. ✅ Test browsing marketplace (trader)
3. ✅ Test placing an order
4. ✅ Test chat functionality
5. ✅ Test notifications

---

**If login still doesn't work after following this guide, check:**
- Browser console errors
- Supabase dashboard logs
- Network requests in DevTools
- Environment variables are correct

