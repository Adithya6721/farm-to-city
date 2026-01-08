# 🌾 Farm2City - Connect Farmers with City Traders

Farm2City is a comprehensive full-stack web application that connects farmers with city traders and shopkeepers, enabling direct trade of fresh produce. The platform features role-based dashboards, real-time chat, order management, and analytics.

## ✨ Features

### 🌾 Farmer Dashboard
- **Product Management**: Add, edit, and manage product listings with details like price, quantity, availability, and harvest dates
- **Order Management**: View incoming orders from traders and shopkeepers with accept/reject functionality
- **Real-time Notifications**: Get instant notifications for new orders and messages
- **Analytics**: Track sales performance, revenue trends, and top-selling products

### 🚚 Trader Dashboard
- **Marketplace**: Browse and search products from farmers with advanced filters
- **Order Placement**: Place bulk orders with delivery date specifications
- **Real-time Chat**: Communicate with farmers before and after ordering
- **Wishlist**: Save favorite products and farmers for future purchases
- **Order History**: Track all orders with status updates and analytics

### 🏪 Shopkeeper Dashboard
- **Advanced Features**: All trader features plus specialized shopkeeper tools
- **Inventory Management**: Track stock levels, manage incoming/outgoing quantities
- **Auto-Reorder Settings**: Set up automatic reordering based on stock levels
- **Retail Packaging**: Request custom packaging sizes (e.g., 5kg packs)
- **Reviews & Ratings**: Rate and review farmers for quality and reliability
- **Analytics Dashboard**: Comprehensive sales and purchase analytics

### 💬 Real-time Communication
- **Chat System**: Instant messaging between farmers, traders, and shopkeepers
- **Order-related Chats**: Context-aware conversations linked to specific orders
- **Notifications**: Real-time updates for messages, orders, and system alerts

### 📊 Analytics & Insights
- **Sales Analytics**: Revenue trends, order volumes, and top products
- **Purchase Analytics**: Spending patterns, favorite farmers, and order history
- **Performance Metrics**: Track success rates, delivery times, and customer satisfaction

### 💳 Payment Integration
- **Multiple Payment Methods**: UPI, Credit/Debit Cards, Net Banking, Digital Wallets
- **Secure Transactions**: Mock payment gateway integration (ready for production)
- **Payment Tracking**: Monitor payment status and transaction history

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **Recharts**: Data visualization and analytics charts
- **React Hook Form**: Form management with validation
- **Zustand**: State management

### Backend & Database
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Row Level Security (RLS)
- **Next.js API Routes**: Server-side logic

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/farm2city.git
   cd farm2city
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the database schema from `database/schema.sql`
   - Optionally, run the seed data from `database/seed.sql`

4. **Environment Configuration**
   
   See `ENV_SETUP.md` for detailed instructions, or:
   ```bash
   # Create .env.local file
   cp ENV_SETUP.md .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here (optional)
   ```
   
   **Important**: Never commit `.env.local` to version control!

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
farm2city/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── analytics/         # Analytics and charts
│   │   ├── auth/              # Authentication components
│   │   ├── chat/              # Chat system components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── layout/            # Layout components
│   │   ├── payments/          # Payment components
│   │   └── ui/                # Reusable UI components
│   ├── lib/                   # Utility libraries
│   │   ├── supabase.ts        # Supabase client
│   │   ├── payments.ts        # Payment service
│   │   └── utils.ts           # Helper functions
│   ├── types/                 # TypeScript type definitions
│   └── hooks/                 # Custom React hooks
├── database/                  # Database files
│   ├── schema.sql             # Database schema
│   └── seed.sql               # Sample data
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🗄️ Database Schema

The application uses a PostgreSQL database with the following main tables:

- **users**: User profiles with role-based access (farmer, trader, shopkeeper)
- **products**: Product listings with details and availability
- **orders**: Order management with status tracking
- **chats**: Real-time messaging system
- **reviews**: Rating and review system
- **notifications**: System notifications
- **wishlists**: Saved products for users
- **inventory**: Shopkeeper inventory management
- **auto_reorder_settings**: Automatic reordering configuration

See `database/schema.sql` for the complete schema with relationships and constraints.

## 🔐 Authentication & Authorization

The application uses Supabase Auth with role-based access control:

- **Farmers**: Can manage products and view orders
- **Traders**: Can browse products, place orders, and manage wishlists
- **Shopkeepers**: All trader features plus inventory management and reviews

Row Level Security (RLS) policies ensure users can only access their own data and appropriate shared data.

## 📱 Real-time Features

- **Live Chat**: Real-time messaging using Supabase Realtime
- **Notifications**: Instant updates for orders, messages, and system events
- **Order Updates**: Live status updates for order processing
- **Inventory Alerts**: Real-time low stock notifications

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme switching capability
- **Modern Interface**: Clean, intuitive design with shadcn/ui components
- **Accessibility**: WCAG compliant components and interactions
- **Loading States**: Smooth loading animations and skeleton screens

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🧪 Testing & Verification

### Run Type Checking
```bash
npm run type-check
```

### Run Linting
```bash
npm run lint
```

### Run Full Check (Type-check + Lint + Build)
```bash
npm run check
```

### Manual Testing Checklist

After setup, verify the following:

- [ ] App compiles without errors (`npm run build`)
- [ ] App runs without errors (`npm run dev`)
- [ ] All routes are accessible
- [ ] Authentication flow works (signup/login/logout)
- [ ] Protected routes redirect properly
- [ ] All CRUD operations work
- [ ] Real-time features work (chat, notifications)
- [ ] Forms validate properly
- [ ] Error handling works
- [ ] Loading states appear correctly
- [ ] No console errors in browser
- [ ] TypeScript compilation has no errors
- [ ] All imports resolve correctly

### Health Check

Visit `/api/health` to check system status:
```bash
curl http://localhost:3000/api/health
```

## 📈 Performance Optimization

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Supabase query caching and Next.js caching
- **Bundle Analysis**: Built-in bundle analyzer for optimization

## 🔧 Configuration

### Supabase Configuration

1. **Enable Realtime** for the following tables:
   - `chats`
   - `notifications`
   - `orders`

2. **Set up Storage** (optional) for product images:
   - Create a `product-images` bucket
   - Configure public access policies

3. **Configure Email Templates** for authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS
- [Recharts](https://recharts.org/) for the analytics charts

## 📞 Support

For support, email support@farm2city.com or join our Slack channel.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics with machine learning
- [ ] Integration with logistics providers
- [ ] Multi-language support
- [ ] Advanced search with AI
- [ ] Blockchain integration for supply chain transparency

---

Made with ❤️ for the farming community



