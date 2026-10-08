import { Link } from 'react-router-dom'
import { priceLabel, productPath } from '../lib/format'
import type { CatalogProduct } from '../api/types'

export default function ProductCard(product: CatalogProduct) {
  const kind = product.type === 'desktop' ? 'Desktop' : 'Tool'
  const highlights = (product.features || []).slice(0, 3)
  const summary = product.tagline || product.description
  const platforms = (product.platforms || []).filter((platform) => platform === 'windows' || platform === 'mac')

  return (
    <Link
      to={productPath(product)}
      className="bracket-card group flex h-full flex-col gap-5 bg-paper p-7 transition hover:border-teal"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-teal">{priceLabel(product)}</span>
        <span className="border border-line px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-ink/50">
          {kind}
        </span>
      </div>

      <div>
        <h3 className="font-display text-2xl font-semibold tracking-tight text-ink group-hover:text-blueprint">
          {product.name}
        </h3>
        {summary && <p className="mt-2 text-sm leading-relaxed text-ink/70">{summary}</p>}
      </div>

      {highlights.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {highlights.map((feature) => (
            <li key={feature} className="flex gap-2 text-sm text-ink/65">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-col gap-3">
        {platforms.length > 0 && (
          <p className="text-xs uppercase tracking-[0.12em] text-ink/45">
            {platforms.map((platform) => (platform === 'windows' ? 'Windows' : 'Mac')).join(' · ')}
          </p>
        )}
        <span className="inline-flex items-center justify-center bg-ink px-4 py-3 text-sm font-medium text-paper transition group-hover:bg-blueprint">
          {product.type === 'desktop' ? 'Get installer' : 'Open tool'}
        </span>
      </div>
    </Link>
  )
}
