import pdfArt from '../assets/tile-pdf.jpg'
import imgArt from '../assets/tile-img.jpg'
import csvArt from '../assets/tile-csv.jpg'
import zipArt from '../assets/tile-zip.jpg'

const tiles = [
  { code: 'PDF', label: 'Redactor', image: pdfArt, rotate: '-rotate-2', offset: 'mt-0' },
  { code: 'IMG', label: 'Compressor', image: imgArt, rotate: 'rotate-1', offset: 'mt-6' },
  { code: 'CSV', label: 'Cleaner', image: csvArt, rotate: 'rotate-2', offset: 'mt-2' },
  { code: 'ZIP', label: 'Batch tool', image: zipArt, rotate: '-rotate-1', offset: 'mt-8' },
]

export default function ToolPegboard() {
  return (
    <div className="grid-dots relative grid grid-cols-2 gap-5 rounded-sm p-8">
      {tiles.map((tile) => (
        <div
          key={tile.code}
          className={`bracket-card ${tile.rotate} ${tile.offset} flex h-28 items-center gap-3 bg-paper p-3 shadow-sm`}
        >
          <img src={tile.image} alt="" className="h-16 w-16 rounded-sm object-cover" />
          <div className="flex h-full flex-col justify-between">
            <span className="font-display text-xs font-semibold text-teal">{tile.code}</span>
            <span className="text-sm text-ink/70">{tile.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
