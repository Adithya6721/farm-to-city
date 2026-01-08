# 🚀 Farm2City Deployment Guide

This guide covers deploying the Farm2City application to various platforms and environments.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Completed local development setup
- [ ] Set up production Supabase project
- [ ] Configured environment variables
- [ ] Tested all features locally
- [ ] Set up domain name (optional)
- [ ] Configured SSL certificate (if needed)

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the easiest deployment experience for Next.js applications with automatic builds, preview deployments, and edge functions.

#### Prerequisites
- GitHub, GitLab, or Bitbucket account
- Vercel account

#### Steps

1. **Push code to repository:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your Git provider
   - Click "New Project"
   - Import your repository

3. **Configure project:**
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Set environment variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be available at `https://your-project.vercel.app`

#### Custom Domain (Optional)

1. In Vercel dashboard, go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

### Option 2: Netlify

Netlify offers similar features to Vercel with continuous deployment and form handling.

#### Steps

1. **Connect repository** to Netlify
2. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18

3. **Environment variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
   ```

4. **Deploy** - Netlify will automatically build and deploy

### Option 3: AWS Amplify

AWS Amplify provides full-stack deployment with backend capabilities.

#### Steps

1. **Connect repository** to AWS Amplify
2. **Configure build settings:**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
         - .next/cache/**/*
   ```

3. **Set environment variables** in Amplify console
4. **Deploy**

### Option 4: Self-Hosted (VPS/Cloud Server)

For full control over the deployment environment.

#### Prerequisites
- VPS or cloud server (Ubuntu 20.04+ recommended)
- Domain name (optional)
- SSL certificate (Let's Encrypt recommended)

#### Steps

1. **Set up server:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx -y
   ```

2. **Clone and build application:**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/farm2city.git
   cd farm2city
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   ```

3. **Configure environment:**
   ```bash
   # Create environment file
   cp env.example .env.local
   
   # Edit environment variables
   nano .env.local
   ```

4. **Set up PM2:**
   ```bash
   # Create PM2 ecosystem file
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'farm2city',
       script: 'npm',
       args: 'start',
       cwd: '/path/to/farm2city',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   EOF
   
   # Start application
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx:**
   ```bash
   # Create Nginx configuration
   sudo nano /etc/nginx/sites-available/farm2city
   ```
   
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
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/farm2city /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Set up SSL with Let's Encrypt:**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx -y
   
   # Obtain SSL certificate
   sudo certbot --nginx -d your-domain.com
   
   # Test auto-renewal
   sudo certbot renew --dry-run
   ```

### Option 5: Docker Deployment

Containerized deployment for consistent environments.

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  farm2city:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - farm2city
    restart: unless-stopped
```

#### Deploy with Docker
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Update application
git pull
docker-compose build
docker-compose up -d
```

## 🔧 Production Configuration

### Environment Variables

Create a `.env.production` file with production values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Optional: Analytics and Monitoring
NEXT_PUBLIC_GA_ID=your-google-analytics-id
SENTRY_DSN=your-sentry-dsn
```

### Next.js Configuration

Update `next.config.js` for production:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-supabase-url.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Compression
  compress: true,
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### Supabase Production Setup

1. **Create production project** in Supabase dashboard
2. **Run database schema:**
   ```sql
   -- Copy and run database/schema.sql
   ```
3. **Configure authentication:**
   - Set up email templates
   - Configure OAuth providers (optional)
   - Set up custom SMTP (optional)
4. **Enable realtime** for required tables
5. **Set up storage buckets** (optional)
6. **Configure RLS policies**

## 📊 Monitoring and Analytics

### Application Monitoring

#### Vercel Analytics
```bash
npm install @vercel/analytics
```

```javascript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

#### Sentry Error Tracking
```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

### Performance Monitoring

#### Web Vitals
```bash
npm install web-vitals
```

```javascript
// app/layout.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric)
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

### Uptime Monitoring

Set up uptime monitoring with services like:
- UptimeRobot
- Pingdom
- StatusCake
- Better Uptime

## 🔒 Security Considerations

### HTTPS Configuration

Ensure all deployments use HTTPS:

```nginx
# Nginx HTTPS redirect
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    location / {
        proxy_pass http://localhost:3000;
        # ... proxy settings
    }
}
```

### Environment Security

- Never commit `.env` files to version control
- Use different Supabase projects for development and production
- Rotate API keys regularly
- Use strong database passwords
- Enable Supabase security features

### Rate Limiting

Implement rate limiting at the application or infrastructure level:

```javascript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Implement rate limiting logic
  const ip = request.ip ?? '127.0.0.1'
  
  // Check rate limit for IP
  // Return 429 if rate limit exceeded
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 📈 Scaling Considerations

### Database Scaling

- Use Supabase connection pooling
- Implement database indexes for frequently queried columns
- Consider read replicas for heavy read workloads
- Monitor database performance and query optimization

### Application Scaling

- Use horizontal scaling with multiple instances
- Implement caching strategies (Redis, CDN)
- Use edge functions for global distribution
- Monitor application performance and memory usage

### CDN Configuration

Set up a CDN for static assets:

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://your-cdn-domain.com' : '',
}
```

## 🆘 Troubleshooting

### Common Deployment Issues

1. **Build failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment variable issues:**
   - Verify all required variables are set
   - Check variable naming (case sensitivity)
   - Ensure variables are available at build time

3. **Database connection issues:**
   - Verify Supabase URL and keys
   - Check network connectivity
   - Verify RLS policies

4. **Performance issues:**
   - Monitor bundle size
   - Check for memory leaks
   - Optimize database queries
   - Implement caching

### Debugging Tools

- Vercel: Use Vercel dashboard for logs and analytics
- Netlify: Check Netlify dashboard for build logs
- Self-hosted: Use PM2 logs and Nginx access logs
- Database: Monitor Supabase dashboard for query performance

## 📞 Support

For deployment issues:
- Check platform-specific documentation
- Review application logs
- Test locally with production environment variables
- Contact platform support if needed

---

Remember to always test your deployment in a staging environment before deploying to production!



