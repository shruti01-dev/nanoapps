import { Link } from 'react-router-dom'
import { priceLabel, productPath } from '../lib/format'
import type { CatalogProduct } from '../api/types'

const fills = ['bg-tile-orange', 'bg-tile-green', 'bg-tile-pink', 'bg-tile-blue']

export default function ProductCard(product: CatalogProduct) {
  const kind = product.type === 'desktop' ? 'Desktop app' : 'Web tool'
  const fill = fills[Math.abs(product.id) % fills.length]

  return (
    <Link to={productPath(product)} target="_blank" rel="noopener noreferrer" className={`bracket-card flex flex-col gap-3 p-6 transition hover:-translate-y-0.5 hover:border-teal hover:shadow-md ${fill}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-teal">{priceLabel(product)}</span>
        <span className="text-xs text-ink/50">{kind}</span>
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">{product.name}</h3>
      <p className="text-sm leading-relaxed text-ink/70">{product.description}</p>
    </Link>
  )
}
