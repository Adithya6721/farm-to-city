# Farm2City Application Verification Checklist

## Pre-Deployment Verification

### ✅ Build & Compilation
- [ ] `npm install` completes without errors
- [ ] `npm run type-check` passes (no TypeScript errors)
- [ ] `npm run lint` passes (no linting errors)
- [ ] `npm run build` completes successfully
- [ ] No console errors during build

### ✅ Environment Setup
- [ ] `.env.local` file exists with all required variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
- [ ] Environment variables are validated on app start
- [ ] No environment variable warnings in console

### ✅ Database Setup
- [ ] Supabase project is created and configured
- [ ] Database schema (`database/schema.sql`) is executed
- [ ] All tables are created successfully
- [ ] Row Level Security (RLS) policies are enabled
- [ ] Foreign key constraints are properly set up
- [ ] Indexes are created for performance

### ✅ Authentication
- [ ] Sign up page loads and works (`/auth/signup`)
- [ ] Login page loads and works (`/auth/login`)
- [ ] Users can create accounts successfully
- [ ] Users can log in with correct credentials
- [ ] Users cannot log in with incorrect credentials
- [ ] Logout functionality works
- [ ] Protected routes redirect to login when not authenticated
- [ ] User profile is created correctly after signup
- [ ] Auth state persists across page refreshes

### ✅ Routes & Navigation
- [ ] Home page (`/`) loads correctly
- [ ] Dashboard (`/dashboard`) loads correctly
- [ ] Products page (`/dashboard/products`) works for farmers
- [ ] Marketplace page (`/dashboard/marketplace`) works for traders/shopkeepers
- [ ] Inventory page (`/dashboard/inventory`) works for shopkeepers
- [ ] Orders page (`/dashboard/orders`) works for all roles
- [ ] Navbar links work correctly
- [ ] Role-based navigation shows correct links
- [ ] Mobile menu works on small screens

### ✅ Farmer Features
- [ ] Can view dashboard with stats
- [ ] Can add new products
- [ ] Can edit existing products
- [ ] Can delete products (with confirmation)
- [ ] Can view incoming orders
- [ ] Can confirm orders
- [ ] Can reject orders
- [ ] Can mark orders as delivered
- [ ] Product form validation works
- [ ] Error messages display correctly

### ✅ Trader Features
- [ ] Can view marketplace
- [ ] Can search products
- [ ] Can filter by category
- [ ] Can filter by price range
- [ ] Search debouncing works (no excessive API calls)
- [ ] Can add products to wishlist
- [ ] Can remove products from wishlist
- [ ] Can place orders
- [ ] Can view order history
- [ ] Can view order details

### ✅ Shopkeeper Features
- [ ] All trader features work
- [ ] Can view inventory
- [ ] Can update inventory stock
- [ ] Can view low stock alerts
- [ ] Can configure auto-reorder settings
- [ ] Can view and manage reviews
- [ ] Can create reviews for farmers
- [ ] Analytics tabs work correctly

### ✅ Real-time Features
- [ ] Chat messages send and receive in real-time
- [ ] Notifications appear in real-time
- [ ] Chat subscriptions clean up properly (no memory leaks)
- [ ] Multiple chat rooms work correctly
- [ ] Order status updates reflect in real-time

### ✅ Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Database errors show appropriate messages
- [ ] Form validation errors display correctly
- [ ] Error boundaries catch component errors
- [ ] Toast notifications work for errors
- [ ] Loading states appear during async operations
- [ ] Buttons are disabled during operations

### ✅ UI/UX
- [ ] Loading spinners appear where needed
- [ ] Confirmation dialogs work for destructive actions
- [ ] Forms have proper validation feedback
- [ ] Error messages are clear and actionable
- [ ] Success messages appear after operations
- [ ] Responsive design works on mobile
- [ ] Responsive design works on tablet
- [ ] Responsive design works on desktop

### ✅ Performance
- [ ] Page load times are acceptable (< 3 seconds)
- [ ] No excessive API calls (debouncing works)
- [ ] Images load efficiently
- [ ] No memory leaks (check browser DevTools)
- [ ] Bundle size is reasonable

### ✅ Security
- [ ] Environment variables are not exposed in client code
- [ ] Service role key is not used in client-side code
- [ ] RLS policies prevent unauthorized access
- [ ] User can only access their own data
- [ ] Protected routes require authentication

### ✅ TypeScript
- [ ] No `any` types in production code
- [ ] All components have proper types
- [ ] All functions have return types
- [ ] Type errors are caught at compile time

### ✅ Code Quality
- [ ] No console.log statements in production code
- [ ] No commented-out code blocks
- [ ] Code follows consistent formatting
- [ ] Components are properly organized
- [ ] Constants are in constants file (not hardcoded)

## Post-Deployment Verification

### ✅ Production Build
- [ ] Production build completes successfully
- [ ] Production server starts without errors
- [ ] Health check endpoint works (`/api/health`)
- [ ] All routes work in production mode

### ✅ Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Mobile browsers work correctly

### ✅ Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility (basic)
- [ ] Focus management works
- [ ] ARIA labels are present where needed

## Common Issues & Solutions

### Issue: Foreign Key References Fail
**Solution**: Verify foreign key constraint names in Supabase match the code. If not, update queries to use simpler syntax like `trader:users(*)` instead of `trader:users!orders_trader_id_fkey(*)`.

### Issue: Environment Variables Not Loading
**Solution**: 
1. Ensure `.env.local` exists in root directory
2. Restart development server after creating/updating `.env.local`
3. Verify variable names start with `NEXT_PUBLIC_` for client-side access

### Issue: RLS Policies Blocking Queries
**Solution**: 
1. Verify RLS policies are correctly set up in Supabase
2. Check that user is authenticated
3. Verify policies allow the operation you're trying to perform

### Issue: Real-time Subscriptions Not Working
**Solution**:
1. Enable Realtime for the table in Supabase dashboard
2. Verify subscription cleanup is working
3. Check browser console for subscription errors

### Issue: TypeScript Errors
**Solution**:
1. Run `npm run type-check` to see all errors
2. Fix type mismatches
3. Add proper type annotations
4. Use type assertions only when necessary

## Final Verification Commands

```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Start production server
npm start

# Or start development server
npm run dev
```

## Manual Testing Flow

1. **Sign Up**: Create a new account as a farmer
2. **Add Product**: Add a product to the marketplace
3. **Sign Out**: Log out and sign in as a trader
4. **Browse**: Search and filter products
5. **Order**: Place an order for a product
6. **Chat**: Send a message to the farmer
7. **Sign In as Farmer**: Confirm the order
8. **Check Notifications**: Verify notifications appear
9. **Complete Order**: Mark order as delivered
10. **Verify**: Check all data persists correctly

---

**Last Updated**: After completing all 6 phases of fixes and improvements

