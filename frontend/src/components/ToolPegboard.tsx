const tiles = [
    { code: 'PDF', label: 'Redactor', rotate: '-rotate-2', offset: 'mt-0' },
    { code: 'IMG', label: 'Compressor', rotate: 'rotate-1', offset: 'mt-6' },
    { code: 'CSV', label: 'Cleaner', rotate: 'rotate-2', offset: 'mt-2' },
    { code: 'ZIP', label: 'Batch tool', rotate: '-rotate-1', offset: 'mt-8' },
  ]
  
  export default function ToolPegboard() {
    return (
      <div className="grid-dots relative grid grid-cols-2 gap-5 rounded-sm p-8">
        {tiles.map((tile) => (
          <div
            key={tile.code}
            className={`bracket-card ${tile.rotate} ${tile.offset} flex h-28 flex-col justify-between bg-paper p-3 shadow-sm`}
          >
            <span className="font-display text-xs font-semibold text-teal">
              {tile.code}
            </span>
            <span className="text-sm text-ink/70">{tile.label}</span>
          </div>
        ))}
      </div>
    )
  }