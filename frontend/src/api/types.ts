export type CatalogProduct = {
  id: number
  name: string
  slug: string
  description: string
  type: 'web' | 'desktop'
  price: number
  pricing_model: 'one_time' | 'subscription'
  billing_period: 'monthly' | 'yearly'
  is_free: boolean
  is_active: boolean
  platforms: string[]
  free_download_url?: string | null
  razorpay_plan_id?: string | null
}

export type ProductInput = {
  name: string
  slug: string
  description: string
  type: string
  price: number
  pricing_model: string
  billing_period: string
  is_free: boolean
  free_download_url?: string
  razorpay_plan_id?: string
  is_active?: boolean
}

export type Purchase = {
  id: number
  name: string
  slug: string
  type: string
  pricing_model: string
  platforms: string[]
  created_at: string | null
  license_key: string | null
  subscription_id: number | null
  subscription_status: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

export type OrderRecord = {
  id: number
  name?: string
  product_name?: string
  user_name?: string
  email?: string
  amount: number
  status: string
  razorpay_payment_id: string | null
  created_at: string
  type?: string
}

export type AccountUser = {
  id: number
  name: string
  email: string
  role: string
  is_verified: boolean
  created_at: string
}
