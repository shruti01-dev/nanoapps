import { Link } from 'react-router-dom'
import { priceLabel, productPath } from '../lib/format'
import type { CatalogProduct } from '../api/types'

export default function ProductCard(product: CatalogProduct) {
  const kind = product.type === 'desktop' ? 'Desktop app' : 'Web tool'

  return (
    <Link to={productPath(product)} className="bracket-card flex flex-col gap-3 bg-paper p-6 transition hover:border-teal">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-teal">{priceLabel(product)}</span>
        <span className="text-xs text-ink/50">{kind}</span>
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">{product.name}</h3>
      <p className="text-sm leading-relaxed text-ink/70">{product.description}</p>
    </Link>
  )
}
