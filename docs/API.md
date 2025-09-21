# 📡 Farm2City API Documentation

This document describes the API endpoints and data structures used in the Farm2City application.

## 🔗 Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## 🔐 Authentication

All API endpoints require authentication via Supabase JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('farmer', 'trader', 'shopkeeper')) NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Products Table

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price > 0),
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  availability BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  category TEXT,
  unit TEXT DEFAULT 'kg',
  image_url TEXT,
  harvest_date DATE,
  expiry_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Orders Table

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trader_id UUID REFERENCES users(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status TEXT CHECK (status IN ('pending', 'confirmed', 'rejected', 'delivered')) DEFAULT 'pending',
  delivery_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_amount NUMERIC,
  notes TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Chats Table

```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL
);
```

## 🌾 Farmer API Endpoints

### Products

#### Get Farmer's Products
```http
GET /api/farmer/products
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Organic Tomatoes",
      "price": 45.00,
      "quantity": 100,
      "availability": true,
      "description": "Fresh organic tomatoes",
      "category": "Vegetables",
      "unit": "kg",
      "harvest_date": "2024-01-15",
      "expiry_date": "2024-01-25",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### Create Product
```http
POST /api/farmer/products
```

**Request Body:**
```json
{
  "name": "Organic Tomatoes",
  "price": 45.00,
  "quantity": 100,
  "description": "Fresh organic tomatoes",
  "category": "Vegetables",
  "unit": "kg",
  "harvest_date": "2024-01-15",
  "expiry_date": "2024-01-25"
}
```

#### Update Product
```http
PUT /api/farmer/products/{id}
```

#### Delete Product
```http
DELETE /api/farmer/products/{id}
```

### Orders

#### Get Farmer's Orders
```http
GET /api/farmer/orders
```

**Query Parameters:**
- `status` (optional): Filter by order status
- `limit` (optional): Number of orders to return
- `offset` (optional): Number of orders to skip

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "trader_id": "uuid",
      "product_id": "uuid",
      "quantity": 50,
      "status": "pending",
      "delivery_date": "2024-01-20",
      "total_amount": 2250.00,
      "notes": "Need delivery by weekend",
      "payment_status": "pending",
      "created_at": "2024-01-15T10:00:00Z",
      "trader": {
        "id": "uuid",
        "name": "Amit Verma",
        "email": "amit@example.com",
        "location": "Delhi, India"
      },
      "product": {
        "id": "uuid",
        "name": "Organic Tomatoes",
        "price": 45.00,
        "unit": "kg"
      }
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```

#### Update Order Status
```http
PATCH /api/farmer/orders/{id}
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

## 🚚 Trader/Shopkeeper API Endpoints

### Products

#### Get Available Products
```http
GET /api/products
```

**Query Parameters:**
- `search` (optional): Search term
- `category` (optional): Filter by category
- `min_price` (optional): Minimum price filter
- `max_price` (optional): Maximum price filter
- `location` (optional): Filter by farmer location
- `limit` (optional): Number of products to return
- `offset` (optional): Number of products to skip

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Organic Tomatoes",
      "price": 45.00,
      "quantity": 100,
      "availability": true,
      "description": "Fresh organic tomatoes",
      "category": "Vegetables",
      "unit": "kg",
      "harvest_date": "2024-01-15",
      "expiry_date": "2024-01-25",
      "farmer": {
        "id": "uuid",
        "name": "Rajesh Kumar",
        "location": "Punjab, India",
        "avatar_url": "https://example.com/avatar.jpg"
      }
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

### Orders

#### Create Order
```http
POST /api/orders
```

**Request Body:**
```json
{
  "farmer_id": "uuid",
  "product_id": "uuid",
  "quantity": 50,
  "delivery_date": "2024-01-20",
  "notes": "Need delivery by weekend"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "trader_id": "uuid",
    "farmer_id": "uuid",
    "product_id": "uuid",
    "quantity": 50,
    "status": "pending",
    "delivery_date": "2024-01-20",
    "total_amount": 2250.00,
    "notes": "Need delivery by weekend",
    "payment_status": "pending",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

#### Get Trader's Orders
```http
GET /api/trader/orders
```

### Wishlist

#### Get Wishlist
```http
GET /api/wishlist
```

#### Add to Wishlist
```http
POST /api/wishlist
```

**Request Body:**
```json
{
  "product_id": "uuid"
}
```

#### Remove from Wishlist
```http
DELETE /api/wishlist/{product_id}
```

## 🏪 Shopkeeper-Specific Endpoints

### Inventory

#### Get Inventory
```http
GET /api/shopkeeper/inventory
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "quantity_in": 100,
      "quantity_out": 80,
      "current_stock": 20,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z",
      "product": {
        "id": "uuid",
        "name": "Organic Tomatoes",
        "category": "Vegetables",
        "unit": "kg"
      }
    }
  ]
}
```

#### Update Inventory
```http
PATCH /api/shopkeeper/inventory/{id}
```

**Request Body:**
```json
{
  "quantity_in": 50,
  "quantity_out": 30,
  "current_stock": 40
}
```

### Auto-Reorder Settings

#### Get Auto-Reorder Settings
```http
GET /api/shopkeeper/auto-reorder
```

#### Create Auto-Reorder Setting
```http
POST /api/shopkeeper/auto-reorder
```

**Request Body:**
```json
{
  "product_id": "uuid",
  "min_stock": 10,
  "reorder_quantity": 50,
  "frequency": "weekly",
  "enabled": true
}
```

### Reviews

#### Get Reviews
```http
GET /api/reviews
```

#### Create Review
```http
POST /api/reviews
```

**Request Body:**
```json
{
  "farmer_id": "uuid",
  "rating": 5,
  "comment": "Excellent quality products!"
}
```

## 💬 Chat API Endpoints

#### Get Chat Messages
```http
GET /api/chat/{user_id}
```

**Query Parameters:**
- `order_id` (optional): Filter by order ID
- `limit` (optional): Number of messages to return
- `offset` (optional): Number of messages to skip

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "receiver_id": "uuid",
      "message": "Hello, I'm interested in your tomatoes",
      "read": false,
      "order_id": "uuid",
      "created_at": "2024-01-15T10:00:00Z",
      "sender": {
        "id": "uuid",
        "name": "Amit Verma",
        "avatar_url": "https://example.com/avatar.jpg"
      }
    }
  ]
}
```

#### Send Message
```http
POST /api/chat
```

**Request Body:**
```json
{
  "receiver_id": "uuid",
  "message": "Hello, I'm interested in your tomatoes",
  "order_id": "uuid"
}
```

#### Mark Messages as Read
```http
PATCH /api/chat/read
```

**Request Body:**
```json
{
  "message_ids": ["uuid1", "uuid2"]
}
```

## 🔔 Notifications API

#### Get Notifications
```http
GET /api/notifications
```

**Query Parameters:**
- `type` (optional): Filter by notification type
- `read` (optional): Filter by read status
- `limit` (optional): Number of notifications to return

#### Mark Notification as Read
```http
PATCH /api/notifications/{id}
```

**Request Body:**
```json
{
  "read": true
}
```

#### Mark All Notifications as Read
```http
PATCH /api/notifications/read-all
```

## 📊 Analytics API

### Sales Analytics (Farmers)

#### Get Sales Data
```http
GET /api/analytics/sales
```

**Query Parameters:**
- `start_date`: Start date (ISO format)
- `end_date`: End date (ISO format)
- `group_by`: Group by period (day, week, month)

**Response:**
```json
{
  "data": {
    "total_sales": 5000.00,
    "total_orders": 25,
    "average_order_value": 200.00,
    "sales_by_period": [
      {
        "period": "2024-01",
        "sales": 1500.00,
        "orders": 8
      }
    ],
    "top_products": [
      {
        "product_name": "Organic Tomatoes",
        "total_sold": 150,
        "revenue": 6750.00
      }
    ]
  }
}
```

### Purchase Analytics (Traders/Shopkeepers)

#### Get Purchase Data
```http
GET /api/analytics/purchases
```

**Response:**
```json
{
  "data": {
    "total_purchases": 25,
    "total_spent": 5000.00,
    "average_purchase_value": 200.00,
    "purchases_by_period": [
      {
        "period": "2024-01",
        "purchases": 8,
        "amount": 1600.00
      }
    ],
    "top_farmers": [
      {
        "farmer_name": "Rajesh Kumar",
        "total_orders": 10,
        "total_spent": 2000.00
      }
    ]
  }
}
```

## 💳 Payment API

#### Initiate Payment
```http
POST /api/payments/initiate
```

**Request Body:**
```json
{
  "order_id": "uuid",
  "amount": 2250.00,
  "currency": "INR",
  "payment_method": "upi"
}
```

#### Process Payment
```http
POST /api/payments/process
```

**Request Body:**
```json
{
  "transaction_id": "txn_123456789",
  "payment_method": "upi",
  "payment_details": {
    "upi_id": "1234567890@paytm"
  }
}
```

#### Get Payment Status
```http
GET /api/payments/status/{transaction_id}
```

## 📝 Error Responses

All API endpoints return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Error Codes

- `VALIDATION_ERROR`: Invalid request data
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `INTERNAL_ERROR`: Server error

## 🔄 Real-time Subscriptions

The application uses Supabase Realtime for live updates:

### Chat Messages
```javascript
const subscription = supabase
  .channel('chat-messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chats',
    filter: `receiver_id=eq.${userId}`
  }, (payload) => {
    // Handle new message
  })
  .subscribe()
```

### Notifications
```javascript
const subscription = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Handle new notification
  })
  .subscribe()
```

### Order Updates
```javascript
const subscription = supabase
  .channel('order-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'orders',
    filter: `trader_id=eq.${userId}`
  }, (payload) => {
    // Handle order status update
  })
  .subscribe()
```

## 🔐 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **General API endpoints**: 100 requests per minute
- **Real-time subscriptions**: 10 concurrent connections per user

## 📚 SDK Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Get products
const { data: products, error } = await supabase
  .from('products')
  .select(`
    *,
    farmer:users!products_farmer_id_fkey(*)
  `)
  .eq('availability', true)
  .order('created_at', { ascending: false })

// Create order
const { data: order, error } = await supabase
  .from('orders')
  .insert({
    trader_id: userId,
    farmer_id: farmerId,
    product_id: productId,
    quantity: 50,
    total_amount: 2250.00
  })
  .select()
```

### Python

```python
from supabase import create_client, Client

url = "https://your-project.supabase.co"
key = "your-anon-key"
supabase: Client = create_client(url, key)

# Get products
response = supabase.table("products").select("*, farmer:users(*)").eq("availability", True).execute()

# Create order
response = supabase.table("orders").insert({
    "trader_id": user_id,
    "farmer_id": farmer_id,
    "product_id": product_id,
    "quantity": 50,
    "total_amount": 2250.00
}).execute()
```

---

For more examples and detailed documentation, visit our [GitHub repository](https://github.com/yourusername/farm2city).

