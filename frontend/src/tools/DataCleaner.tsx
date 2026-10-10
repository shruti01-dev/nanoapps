import { useMemo, useState } from 'react'
import { cleanCsv, parseCsv, toCsv } from './csv'

export default function DataCleaner() {
  const [rows, setRows] = useState<string[][]>([])
  const [name, setName] = useState('cleaned.csv')
  const [trim, setTrim] = useState(true)
  const [dropEmpty, setDropEmpty] = useState(true)
  const [dropDuplicates, setDropDuplicates] = useState(true)
  const [error, setError] = useState('')

  const cleaned = useMemo(
    () => cleanCsv(rows, { trim, dropEmpty, dropDuplicates }),
    [rows, trim, dropEmpty, dropDuplicates]
  )

  const download = () => {
    const blob = new Blob([toCsv(cleaned)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bracket-card bg-tile-green p-6">
      <h2 className="font-display text-lg font-semibold text-ink">Data cleaner</h2>
      <p className="mt-2 text-sm text-ink/60">
        Trim cells, drop empty rows, and remove duplicate rows from a CSV.
      </p>
      <input
        type="file"
        accept=".csv,text/csv"
        className="mt-4 text-sm text-ink/70"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          setError('')
          setName(file.name.replace(/\.csv$/i, '') + '-cleaned.csv')
          file
            .text()
            .then((text) => setRows(parseCsv(text)))
            .catch(() => setError('Could not read that file.'))
        }}
      />
      <div className="mt-4 flex flex-col gap-2 text-sm text-ink/80">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={trim} onChange={(event) => setTrim(event.target.checked)} />
          Trim spaces
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={dropEmpty} onChange={(event) => setDropEmpty(event.target.checked)} />
          Remove empty rows
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={dropDuplicates}
            onChange={(event) => setDropDuplicates(event.target.checked)}
          />
          Remove duplicate rows
        </label>
      </div>
      {rows.length > 0 && (
        <p className="mt-4 text-sm text-ink/70">
          {rows.length} rows in, {cleaned.length} rows out.
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        disabled={cleaned.length === 0}
        onClick={download}
        className="mt-4 border border-ink px-4 py-2 text-sm font-medium text-ink transition hover:border-teal hover:text-teal disabled:opacity-50"
      >
        Download cleaned CSV
      </button>
    </div>
  )
}
