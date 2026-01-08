// Application constants

export const PRODUCT_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Grains',
  'Pulses',
  'Spices',
  'Herbs',
  'Dairy',
  'Other'
] as const

export const PRODUCT_UNITS = [
  'kg',
  'g',
  'lb',
  'pieces',
  'dozen',
  'bunch',
  'bag',
  'liter',
  'ml'
] as const

export const PRICE_RANGES = [
  { label: 'Under ₹50', value: '0-50' },
  { label: '₹50 - ₹100', value: '50-100' },
  { label: '₹100 - ₹200', value: '100-200' },
  { label: '₹200 - ₹500', value: '200-500' },
  { label: 'Above ₹500', value: '500-' },
] as const

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'rejected',
  'delivered'
] as const

export const PAYMENT_STATUSES = [
  'pending',
  'paid',
  'failed'
] as const

export const USER_ROLES = [
  'farmer',
  'trader',
  'shopkeeper'
] as const

// Inventory thresholds
export const LOW_STOCK_THRESHOLD = 10
export const MEDIUM_STOCK_THRESHOLD = 50

// Auto-reorder settings
export const AUTO_REORDER_FREQUENCIES = [
  'daily',
  'weekly',
  'monthly'
] as const

export const DEFAULT_REORDER_QUANTITY = 50
export const DEFAULT_MIN_STOCK = 10

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Retry settings
export const MAX_RETRIES = 3
export const RETRY_DELAY_MS = 1000

