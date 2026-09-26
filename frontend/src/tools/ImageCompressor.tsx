import { useState } from 'react'

export default function ImageCompressor() {
  const [quality, setQuality] = useState(0.7)
  const [maxWidth, setMaxWidth] = useState(1600)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const compress = async (file: File) => {
    setError('')
    setStatus('Compressing…')
    const image = await loadImage(file)
    const scale = Math.min(1, maxWidth / image.width)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not prepare the image')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob) throw new Error('Could not compress this image')
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name.replace(/\.[^.]+$/, '') + '-compressed.jpg'
    link.click()
    URL.revokeObjectURL(url)
    const saved = Math.max(0, file.size - blob.size)
    setStatus(`Saved ${Math.round(saved / 1024)} KB. The compressed file is downloading.`)
  }

  return (
    <div className="bracket-card bg-paper p-6">
      <h2 className="font-display text-lg font-semibold text-ink">Image compressor</h2>
      <p className="mt-2 text-sm text-ink/60">Shrink a JPEG or PNG. The result downloads as a JPEG.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-ink/80">
          Quality {Math.round(quality * 100)}%
          <input
            type="range"
            min={0.3}
            max={0.95}
            step={0.05}
            value={quality}
            onChange={(event) => setQuality(Number(event.target.value))}
            className="mt-2 w-full"
          />
        </label>
        <label className="text-sm text-ink/80">
          Max width (px)
          <input
            type="number"
            min={200}
            max={4000}
            value={maxWidth}
            onChange={(event) => setMaxWidth(Number(event.target.value))}
            className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-teal"
          />
        </label>
      </div>
      <input
        type="file"
        accept="image/*"
        className="mt-4 text-sm text-ink/70"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          compress(file).catch((err: Error) => {
            setStatus('')
            setError(err.message || 'Could not compress that file.')
          })
        }}
      />
      {status && <p className="mt-4 text-sm text-teal">{status}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  )
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That file is not an image this browser can read'))
    }
    image.src = url
  })
}
