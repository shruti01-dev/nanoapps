import { useMemo, useState } from 'react'

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function splitBill(bill: number, tip: number, people: number) {
  if (![bill, tip, people].every(Number.isFinite)) return null
  if (bill < 0 || tip < 0 || tip > 100 || people < 1 || people > 1000 || !Number.isInteger(people)) return null
  const total = Math.round(bill * (1 + tip / 100) * 100) / 100
  if (!Number.isFinite(total)) return null
  return { total, each: Math.round((total / people) * 100) / 100 }
}

export default function BillSplitter() {
  const [bill, setBill] = useState('1200')
  const [tip, setTip] = useState('0')
  const [people, setPeople] = useState('4')

  const result = useMemo(
    () => splitBill(Number(bill), Number(tip), Number(people)),
    [bill, tip, people]
  )

  return (
    <div className="rounded-[13px] border border-line bg-tile-orange p-6">
      <h2 className="font-display text-lg font-semibold text-ink">Good company. Simple maths.</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-muted sm:col-span-2">
          Bill amount (₹)
          <input className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-blueprint" type="number" min="0" step="0.01" value={bill} onChange={(e) => setBill(e.target.value)} />
        </label>
        <label className="text-xs font-semibold text-muted">
          Tip (%)
          <input className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-blueprint" type="number" min="0" max="100" step="0.5" value={tip} onChange={(e) => setTip(e.target.value)} />
        </label>
        <label className="text-xs font-semibold text-muted">
          People
          <input className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-blueprint" type="number" min="1" max="1000" step="1" value={people} onChange={(e) => setPeople(e.target.value)} />
        </label>
      </div>
      {result ? (
        <div className="mt-4 rounded-[9px] bg-tile-blue px-4 py-3">
          <p className="text-xs text-tile-blue-ink">Each person pays</p>
          <p className="font-display text-3xl font-semibold text-blueprint">{money.format(result.each)}</p>
          <p className="mt-1 text-xs text-muted">Total including tip: {money.format(result.total)}</p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-clay">Enter a non-negative bill, a tip from 0–100%, and 1–1,000 whole people.</p>
      )}
    </div>
  )
}
