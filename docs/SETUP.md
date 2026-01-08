# 🚀 Farm2City Setup Guide

This guide will help you set up the Farm2City platform on your local machine and deploy it to production.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **Supabase account** - [Sign up here](https://supabase.com/)

## 🏗️ Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/farm2city.git
cd farm2city
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Set Up Supabase Project

1. **Create a new Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name: `farm2city`
   - Set a strong database password
   - Choose a region close to your users

2. **Get your project credentials:**
   - Go to Settings → API
   - Copy your Project URL and anon/public key
   - Go to Settings → Database
   - Copy your service role key (keep this secret!)

### Step 4: Set Up Database Schema

1. **In your Supabase dashboard, go to SQL Editor**
2. **Copy and paste the contents of `database/schema.sql`**
3. **Run the SQL to create all tables and relationships**

```sql
-- Copy the entire contents of database/schema.sql here
```

4. **Optional: Add sample data by running `database/seed.sql`**

### Step 5: Configure Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp env.example .env.local
   ```

2. **Update `.env.local` with your Supabase credentials:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### Step 6: Configure Supabase Realtime

1. **In your Supabase dashboard, go to Database → Replication**
2. **Enable realtime for the following tables:**
   - `chats`
   - `notifications`
   - `orders`

### Step 7: Start the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Production Deployment

### Option 1: Vercel (Recommended)

Vercel provides the easiest deployment experience for Next.js applications.

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository

3. **Configure environment variables:**
   - In Vercel dashboard, go to your project settings
   - Add the following environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
     NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
     ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Option 2: Manual Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

3. **Set up a reverse proxy** (nginx recommended):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔧 Supabase Production Configuration

### Database Setup

1. **Create a production Supabase project**
2. **Run the schema setup** (same as local development)
3. **Configure RLS policies** (already included in schema.sql)

### Authentication Setup

1. **Configure email templates:**
   - Go to Authentication → Email Templates
   - Customize confirmation and reset password emails

2. **Set up OAuth providers** (optional):
   - Go to Authentication → Providers
   - Enable Google, GitHub, or other providers

### Storage Setup (Optional)

1. **Create storage buckets:**
   ```sql
   INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
   ```

2. **Set up storage policies:**
   ```sql
   CREATE POLICY "Product images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
   CREATE POLICY "Users can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
   ```

## 📊 Monitoring and Analytics

### Supabase Dashboard

Monitor your application through the Supabase dashboard:
- **Database**: View tables, run queries, monitor performance
- **Auth**: Monitor user registrations and sessions
- **Realtime**: Check realtime connections and usage
- **Storage**: Monitor file uploads and storage usage

### Application Monitoring

Consider setting up:
- **Error tracking**: Sentry, Bugsnag
- **Performance monitoring**: Vercel Analytics, Google Analytics
- **Uptime monitoring**: UptimeRobot, Pingdom

## 🔐 Security Considerations

### Environment Variables

- Never commit `.env.local` to version control
- Use different Supabase projects for development and production
- Rotate service role keys regularly
- Use strong database passwords

### Database Security

- RLS policies are already configured in the schema
- Regularly review and update RLS policies
- Monitor database access logs
- Use connection pooling for production

### Application Security

- Enable HTTPS in production
- Implement rate limiting
- Use Content Security Policy (CSP) headers
- Regularly update dependencies

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid API key" error:**
   - Check your Supabase URL and keys in `.env.local`
   - Ensure you're using the correct anon key (not service role key)

2. **Realtime not working:**
   - Verify realtime is enabled for the required tables
   - Check your network connection
   - Ensure you're using the correct Supabase URL

3. **Authentication issues:**
   - Check if email confirmation is required
   - Verify email templates are configured
   - Check Supabase Auth settings

4. **Build errors:**
   - Clear Next.js cache: `rm -rf .next`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for TypeScript errors: `npm run type-check`

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Review [Next.js documentation](https://nextjs.org/docs)
- Open an issue on GitHub
- Join the Supabase Discord community

## 📈 Performance Optimization

### Database Optimization

1. **Add indexes** for frequently queried columns:
   ```sql
   CREATE INDEX idx_products_category ON products(category);
   CREATE INDEX idx_orders_status ON orders(status);
   ```

2. **Use connection pooling:**
   - Enable Supabase connection pooling
   - Configure appropriate pool size

### Application Optimization

1. **Enable Next.js optimizations:**
   ```javascript
   // next.config.js
   module.exports = {
     experimental: {
       optimizeCss: true,
     },
     images: {
       domains: ['your-supabase-url.supabase.co'],
     },
   }
   ```

2. **Implement caching:**
   - Use Supabase query caching
   - Implement Redis for session storage (optional)

## 🔄 Backup and Recovery

### Database Backups

1. **Enable automatic backups** in Supabase dashboard
2. **Set up point-in-time recovery**
3. **Export data regularly:**
   ```bash
   pg_dump "postgresql://postgres:[password]@[host]:5432/postgres" > backup.sql
   ```

### Application Backups

1. **Version control**: Keep your code in Git
2. **Environment backups**: Document all configuration
3. **Asset backups**: Backup uploaded images and files

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

---

Need help? Open an issue or contact the development team!



