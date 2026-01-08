export interface User {
  id: string
  name: string
  email: string
  role: 'farmer' | 'trader' | 'shopkeeper'
  location?: string
  avatar_url?: string
  phone?: string
  bio?: string
  created_at: string
}

export interface Product {
  id: string
  farmer_id: string
  name: string
  price: number
  quantity: number
  availability: boolean
  description?: string
  category?: string
  unit?: string
  image_url?: string
  harvest_date?: string
  expiry_date?: string
  created_at: string
  farmer?: User
}

export interface Order {
  id: string
  trader_id: string
  farmer_id: string
  product_id: string
  quantity: number
  status: 'pending' | 'confirmed' | 'rejected' | 'delivered'
  delivery_date?: string
  total_amount?: number
  notes?: string
  payment_status: 'pending' | 'paid' | 'failed'
  created_at: string
  trader?: User
  farmer?: User
  product?: Product
}

export interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  read: boolean
  order_id?: string
  created_at: string
  sender?: User
  receiver?: User
}

export interface Review {
  id: string
  shopkeeper_id: string
  farmer_id: string
  rating: number
  comment?: string
  order_id?: string
  created_at: string
  shopkeeper?: User
  farmer?: User
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'order' | 'chat' | 'payment' | 'system'
  read: boolean
  data?: any
  created_at: string
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}

export interface InventoryItem {
  id: string
  shopkeeper_id: string
  product_id: string
  quantity_in: number
  quantity_out: number
  current_stock: number
  created_at: string
  updated_at: string
  product?: Product
}

// Dashboard analytics types
export interface SalesAnalytics {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  salesByMonth: Array<{
    month: string
    sales: number
    orders: number
  }>
  topProducts: Array<{
    product_name: string
    total_sold: number
    revenue: number
  }>
}

export interface PurchaseAnalytics {
  totalPurchases: number
  totalSpent: number
  averagePurchaseValue: number
  purchasesByMonth: Array<{
    month: string
    purchases: number
    amount: number
  }>
  topFarmers: Array<{
    farmer_name: string
    total_orders: number
    total_spent: number
  }>
}

// Filter types
export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  location?: string
  availability?: boolean
  search?: string
}

export interface OrderFilters {
  status?: string
  dateFrom?: string
  dateTo?: string
  farmer_id?: string
}

// Chat types
export interface ChatRoom {
  id: string
  participants: User[]
  lastMessage?: ChatMessage
  unreadCount: number
}



