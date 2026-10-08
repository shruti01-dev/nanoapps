import { useEffect, useMemo, useState } from 'react'

const money = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

function splitBill(bill: number, tip: number, people: number) {
  if (![bill, tip, people].every(Number.isFinite)) return null
  if (bill < 0 || tip < 0 || tip > 100 || people < 1 || people > 1000 || !Number.isInteger(people)) return null
  const total = Math.round(bill * (1 + tip / 100) * 100) / 100
  if (!Number.isFinite(total)) return null
  return { total, each: Math.round((total / people) * 100) / 100 }
}

export function BillSplitter() {
  const [bill, setBill] = useState('1200')
  const [tip, setTip] = useState('0')
  const [people, setPeople] = useState('4')
  const result = splitBill(Number(bill), Number(tip), Number(people))

  return (
    <div className="rounded-xl border border-[#e3eaf4] bg-[#f7f9fd] p-5">
      <h3 className="text-base font-semibold text-[#18283b]">Good company. Simple maths.</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="col-span-2 text-xs font-semibold text-[#697d96]">
          Bill amount (₹)
          <input className="mt-1 w-full rounded-md border border-[#d8e2ee] bg-white px-3 py-2 text-sm text-[#18283b]" type="number" min="0" step="0.01" value={bill} onChange={(e) => setBill(e.target.value)} />
        </label>
        <label className="text-xs font-semibold text-[#697d96]">
          Tip (%)
          <input className="mt-1 w-full rounded-md border border-[#d8e2ee] bg-white px-3 py-2 text-sm text-[#18283b]" type="number" min="0" max="100" step="0.5" value={tip} onChange={(e) => setTip(e.target.value)} />
        </label>
        <label className="text-xs font-semibold text-[#697d96]">
          People
          <input className="mt-1 w-full rounded-md border border-[#d8e2ee] bg-white px-3 py-2 text-sm text-[#18283b]" type="number" min="1" max="1000" step="1" value={people} onChange={(e) => setPeople(e.target.value)} />
        </label>
      </div>
      {result ? (
        <div className="mt-4 rounded-lg bg-[#e9f0ff] p-4">
          <span className="block text-xs text-[#7089b2]">Each person pays</span>
          <strong className="text-3xl font-semibold tracking-tight text-[#245fc8]">{money(result.each)}</strong>
          <p className="mt-1 text-xs text-[#7590b9]">Total including tip: {money(result.total)}</p>
        </div>
      ) : (
        <p className="mt-3 text-xs text-[#b4583e]">Enter a non-negative bill, a tip from 0–100%, and 1–1,000 whole people.</p>
      )}
    </div>
  )
}

const unitGroups = {
  length: { label: 'Length', units: { m: 'Metres', km: 'Kilometres', cm: 'Centimetres', ft: 'Feet', in: 'Inches', mi: 'Miles' }, factors: { m: 1, km: 1000, cm: 0.01, ft: 0.3048, in: 0.0254, mi: 1609.344 } },
  weight: { label: 'Weight', units: { kg: 'Kilograms', g: 'Grams', lb: 'Pounds', oz: 'Ounces' }, factors: { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.028349523125 } },
  temperature: { label: 'Temperature', units: { c: 'Celsius', f: 'Fahrenheit', k: 'Kelvin' } },
} as const

type GroupId = keyof typeof unitGroups

function convertUnit(value: number, group: GroupId, from: string, to: string) {
  if (!Number.isFinite(value)) return null
  if (group !== 'temperature') {
    const factors = unitGroups[group].factors as Record<string, number>
    const result = (value * factors[from]) / factors[to]
    return Number.isFinite(result) ? result : null
  }
  const celsius = from === 'c' ? value : from === 'f' ? ((value - 32) * 5) / 9 : value - 273.15
  if (celsius < -273.15) return null
  const result = to === 'c' ? celsius : to === 'f' ? (celsius * 9) / 5 + 32 : celsius + 273.15
  return Number.isFinite(result) ? result : null
}

export function UnitConverter() {
  const [group, setGroup] = useState<GroupId>('length')
  const [value, setValue] = useState('1')
  const units = Object.entries(unitGroups[group].units)
  const [from, setFrom] = useState(units[0][0])
  const [to, setTo] = useState(units[1][0])

  const result = convertUnit(Number(value), group, from, to)
  const formatted = result === null ? '' : new Intl.NumberFormat('en-IN', { maximumFractionDigits: 6 }).format(result)

  return (
    <div className="rounded-xl border border-[#e3eaf4] bg-[#f7f9fd] p-5">
      <h3 className="text-base font-semibold text-[#18283b]">A different unit. The same amount.</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="col-span-2 text-xs font-semibold text-[#697d96]">
          Measurement
          <select
            className="mt-1 w-full rounded-md border border-[#d8e2ee] bg-white px-3 py-2 text-sm"
            value={group}
            onChange={(e) => {
              const next = e.target.value as GroupId
              const nextUnits = Object.keys(unitGroups[next].units)
              setGroup(next)
              setFrom(nextUnits[0])
              setTo(nextUnits[1] || nextUnits[0])
            }}
          >
            {Object.entries(unitGroups).map(([id, item]) => (
              <option key={id} value={id}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="col-span-2 text-xs font-semibold text-[#697d96]">
          Value
          <input className="mt-1 w-full rounded-md border border-[#d8e2ee] bg-white px-3 py-2 text-sm" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <label className="text-xs font-semibold text-[#697d96]">
          From
          <select className="mt-1 w-full rounded-md border border-[#d8e2ee] bg-white px-3 py-2 text-sm" value={from} onChange={(e) => setFrom(e.target.value)}>
            {units.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-[#697d96]">
          To
          <select className="mt-1 w-full rounded-md border border-[#d8e2ee] bg-white px-3 py-2 text-sm" value={to} onChange={(e) => setTo(e.target.value)}>
            {units.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>
      </div>
      {result === null ? (
        <p className="mt-3 text-xs text-[#b4583e]">Enter a valid number to convert.</p>
      ) : (
        <div className="mt-4 rounded-lg bg-[#e9f0ff] p-4">
          <span className="block text-xs text-[#7089b2]">Converted value</span>
          <strong className="text-3xl font-semibold tracking-tight text-[#245fc8]">{formatted}</strong>
          <p className="mt-1 text-xs text-[#7590b9]">{(unitGroups[group].units as Record<string, string>)[to]}</p>
        </div>
      )}
    </div>
  )
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function FocusTimer() {
  const [minutes, setMinutes] = useState(25)
  const [remaining, setRemaining] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          setRunning(false)
          setDone(true)
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running])

  const pick = (next: number) => {
    setMinutes(next)
    setRemaining(next * 60)
    setRunning(false)
    setDone(false)
  }

  return (
    <div className="rounded-xl border border-[#e3eaf4] bg-[#f7f9fd] p-5 text-center">
      <h3 className="text-base font-semibold text-[#18283b]">Make a little space to focus.</h3>
      <div className="mt-4 flex justify-center gap-2">
        {[15, 25, 45].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => pick(option)}
            className={option === minutes ? 'rounded-md border border-[#adcbfe] bg-[#e8f0ff] px-3 py-1.5 text-xs font-semibold text-[#2563eb]' : 'rounded-md border border-[#dbe4f2] bg-white px-3 py-1.5 text-xs text-[#7d91ac]'}
          >
            {option} min
          </button>
        ))}
      </div>
      <p className="mt-4 font-display text-6xl font-semibold tracking-tight text-[#316bd2]">
        {pad(Math.floor(remaining / 60))}:{pad(remaining % 60)}
      </p>
      <p className="mt-1 text-xs text-[#8b9cb3]">{done ? 'Session complete. Time for a little break.' : running ? 'One task. A little more focus.' : 'Ready when you are.'}</p>
      <div className="mt-4 flex justify-center gap-2">
        <button type="button" className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white" onClick={() => { if (remaining === 0) setRemaining(minutes * 60); setDone(false); setRunning((value) => !value) }}>
          {running ? 'Pause' : remaining === 0 ? 'Start again' : 'Start focus'}
        </button>
        <button type="button" className="rounded-lg bg-[#eef3fb] px-4 py-2 text-sm font-semibold text-[#245bbd]" onClick={() => pick(minutes)}>
          Reset
        </button>
      </div>
    </div>
  )
}

export function BreathingBreak() {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!running) return
    const started = Date.now() - elapsed * 1000
    const timer = window.setInterval(() => setElapsed((Date.now() - started) / 1000), 100)
    return () => window.clearInterval(timer)
  }, [running])

  const phase = useMemo(() => {
    const second = elapsed % 14
    if (second < 4) return { label: 'Breathe in', name: 'in', remaining: 4 - second }
    if (second < 8) return { label: 'Hold gently', name: 'hold', remaining: 8 - second }
    return { label: 'Breathe out', name: 'out', remaining: 14 - second }
  }, [elapsed])

  const scale = running && (phase.name === 'in' || phase.name === 'hold') ? 'scale-110' : 'scale-100'

  return (
    <div className="rounded-xl border border-[#e3eaf4] bg-[#f7f9fd] p-5 text-center">
      <h3 className="text-base font-semibold text-[#18283b]">A moment for yourself.</h3>
      <p className="mt-2 text-xs text-[#8b7590]">In for 4 · hold for 4 · out for 6</p>
      <div className={`mx-auto mt-6 flex h-32 w-32 flex-col items-center justify-center rounded-full border-[12px] border-[#fcecf3] bg-[#f8e0ec] text-[#b65384] transition-transform duration-700 ${scale}`}>
        <span className="text-xs">{running ? phase.label : 'Ready?'}</span>
        <strong className="text-2xl">{running ? Math.ceil(phase.remaining) : '…'}</strong>
      </div>
      <button type="button" className="mt-5 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white" onClick={() => setRunning((value) => !value)}>
        {running ? 'Pause' : elapsed > 0 ? 'Continue' : 'Start breathing'}
      </button>
    </div>
  )
}
