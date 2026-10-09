import { useMemo, useState } from 'react'

const groups = {
  length: {
    label: 'Length',
    units: { m: 'Metres', km: 'Kilometres', cm: 'Centimetres', ft: 'Feet', in: 'Inches', mi: 'Miles' },
    factors: { m: 1, km: 1000, cm: 0.01, ft: 0.3048, in: 0.0254, mi: 1609.344 } as Record<string, number>,
  },
  weight: {
    label: 'Weight',
    units: { kg: 'Kilograms', g: 'Grams', lb: 'Pounds', oz: 'Ounces' },
    factors: { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.028349523125 } as Record<string, number>,
  },
  temperature: {
    label: 'Temperature',
    units: { c: 'Celsius', f: 'Fahrenheit', k: 'Kelvin' },
  },
}

type GroupId = keyof typeof groups

function convert(value: number, group: GroupId, from: string, to: string) {
  if (!Number.isFinite(value)) return null
  if (group !== 'temperature') {
    const factors = groups[group].factors
    if (factors[from] == null || factors[to] == null) return null
    const result = (value * factors[from]) / factors[to]
    return Number.isFinite(result) ? result : null
  }
  const celsius = from === 'c' ? value : from === 'f' ? ((value - 32) * 5) / 9 : value - 273.15
  if (celsius < -273.15) return null
  const result = to === 'c' ? celsius : to === 'f' ? (celsius * 9) / 5 + 32 : celsius + 273.15
  return Number.isFinite(result) ? result : null
}

const format = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 6 })

export default function UnitConverter() {
  const [group, setGroup] = useState<GroupId>('length')
  const [value, setValue] = useState('1')
  const [from, setFrom] = useState('m')
  const [to, setTo] = useState('ft')

  const units = groups[group].units
  const result = useMemo(() => convert(Number(value), group, from, to), [value, group, from, to])

  const changeGroup = (next: GroupId) => {
    const keys = Object.keys(groups[next].units)
    setGroup(next)
    setFrom(keys[0])
    setTo(keys[1] || keys[0])
  }

  return (
    <div className="rounded-[13px] border border-line bg-tile-green p-6">
      <h2 className="font-display text-lg font-semibold text-ink">A different unit. The same amount.</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-muted sm:col-span-2">
          Measurement
          <select className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-blueprint" value={group} onChange={(e) => changeGroup(e.target.value as GroupId)}>
            {Object.entries(groups).map(([id, item]) => (
              <option key={id} value={id}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted sm:col-span-2">
          Value
          <input className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-blueprint" type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <label className="text-xs font-semibold text-muted">
          From
          <select className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-blueprint" value={from} onChange={(e) => setFrom(e.target.value)}>
            {Object.entries(units).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted">
          To
          <select className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-blueprint" value={to} onChange={(e) => setTo(e.target.value)}>
            {Object.entries(units).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </label>
      </div>
      {result == null ? (
        <p className="mt-4 text-sm text-clay">Enter a valid number to convert.</p>
      ) : (
        <div className="mt-4 rounded-[9px] bg-tile-blue px-4 py-3">
          <p className="text-xs text-tile-blue-ink">Converted value</p>
          <p className="font-display text-3xl font-semibold text-blueprint">{format.format(result)}</p>
          <p className="mt-1 text-xs text-muted">{units[to as keyof typeof units]}</p>
        </div>
      )}
    </div>
  )
}
