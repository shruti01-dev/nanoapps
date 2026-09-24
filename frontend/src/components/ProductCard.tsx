type ProductCardProps = {
    format: string
    name: string
    description: string
    type: 'Web tool' | 'Desktop app'
  }
  
  export default function ProductCard({ format, name, description, type }: ProductCardProps) {
    return (
      <div className="bracket-card flex flex-col gap-3 bg-paper p-6">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-semibold text-teal">{format}</span>
          <span className="text-xs text-ink/50">{type}</span>
        </div>
        <h3 className="font-display text-lg font-semibold text-ink">{name}</h3>
        <p className="text-sm leading-relaxed text-ink/70">{description}</p>
      </div>
    )
  }