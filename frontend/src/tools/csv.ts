export function parseCsv(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  const text = input.replace(/^\uFEFF/, '')

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        cell += char
      }
      continue
    }
    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (char !== '\r') {
      cell += char
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows.filter((current) => current.some((value) => value.length > 0) || current.length > 1)
}

export function toCsv(rows: string[][]) {
  return rows
    .map((row) =>
      row
        .map((value) => {
          if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
          return value
        })
        .join(',')
    )
    .join('\n')
}

export function cleanCsv(
  rows: string[][],
  options: { trim: boolean; dropEmpty: boolean; dropDuplicates: boolean }
) {
  const trimmed = options.trim
    ? rows.map((row) => row.map((cell) => cell.trim()))
    : rows.map((row) => [...row])

  const withoutEmpty = options.dropEmpty
    ? trimmed.filter((row) => row.some((cell) => cell.length > 0))
    : trimmed

  if (!options.dropDuplicates) return withoutEmpty

  const seen = new Set<string>()
  return withoutEmpty.filter((row) => {
    const key = JSON.stringify(row)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
