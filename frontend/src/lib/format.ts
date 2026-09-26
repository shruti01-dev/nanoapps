import type { CatalogProduct } from '../api/types'

export function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)
}

export function priceLabel(product: Pick<CatalogProduct, 'price' | 'is_free' | 'pricing_model' | 'billing_period'>) {
  if (product.is_free) return 'Free'
  const amount = formatInr(Number(product.price))
  if (product.pricing_model === 'subscription') {
    return product.billing_period === 'yearly' ? `${amount} / year` : `${amount} / month`
  }
  return amount
}

export function productPath(product: Pick<CatalogProduct, 'type' | 'slug'>) {
  return product.type === 'desktop' ? `/software/${product.slug}` : `/tools/${product.slug}`
}
